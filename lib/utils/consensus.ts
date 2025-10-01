// Consensus odds and ATS utilities

export type AmericanOdds = number

export interface SportsbookLine {
	spread?: {
		point_spread_away?: number
		point_spread_home?: number
		point_spread_away_money?: number
		point_spread_home_money?: number
	}
	moneyline?: {
		moneyline_away?: AmericanOdds
		moneyline_home?: AmericanOdds
	}
	total?: {
		total_over?: number
		total_under?: number
		total_over_money?: AmericanOdds
		total_under_money?: AmericanOdds
	}
}

export interface ConsensusResult {
	spreadAway: number | null
	spreadHome: number | null
	totalPoints: number | null
	winProbAway: number | null // 0..1
	winProbHome: number | null // 0..1
}

// Convert American moneyline to implied probability (decimal 0..1)
export function americanToImpliedProbability(odds: AmericanOdds | undefined | null): number | null {
	if (odds === undefined || odds === null || !isFinite(odds)) return null
	if (odds > 0) {
		return 100 / (odds + 100)
	}
	if (odds < 0) {
		return (-odds) / ((-odds) + 100)
	}
	return null
}

// Average numeric array ignoring null/undefined/NaN
function average(values: Array<number | null | undefined>): number | null {
	const nums = values.filter((v): v is number => typeof v === 'number' && isFinite(v))
	if (nums.length === 0) return null
	return nums.reduce((a, b) => a + b, 0) / nums.length
}

// Compute consensus metrics from multiple sportsbooks
export function computeConsensus(lines: SportsbookLine[]): ConsensusResult {
	const spreadAwayAvg = average(lines.map(l => l.spread?.point_spread_away))
	const spreadHomeAvg = average(lines.map(l => l.spread?.point_spread_home))
	// Totals may be expressed as over/under with same point number; prefer over
	const totalPointsAvg = average(
		lines.map(l => {
			const over = l.total?.total_over
			const under = l.total?.total_under
			if (typeof over === 'number' && isFinite(over)) return over
			if (typeof under === 'number' && isFinite(under)) return under
			return null
		})
	)

	// Compute normalized probabilities per sportsbook (remove vig) then average
	const normalizedPairs: Array<{ away: number; home: number }> = []
	for (const l of lines) {
		const awayImp = americanToImpliedProbability(l.moneyline?.moneyline_away)
		const homeImp = americanToImpliedProbability(l.moneyline?.moneyline_home)
		if (awayImp != null && homeImp != null && isFinite(awayImp) && isFinite(homeImp)) {
			const sum = awayImp + homeImp
			if (sum > 0) {
				normalizedPairs.push({ away: awayImp / sum, home: homeImp / sum })
			}
		}
	}

	let winProbAway: number | null = null
	let winProbHome: number | null = null
	if (normalizedPairs.length > 0) {
		winProbAway = normalizedPairs.reduce((a, b) => a + b.away, 0) / normalizedPairs.length
		winProbHome = normalizedPairs.reduce((a, b) => a + b.home, 0) / normalizedPairs.length
	} else {
		// Fallback: average implied independently then normalize once
		const awayImplied = lines
			.map(l => americanToImpliedProbability(l.moneyline?.moneyline_away))
			.filter((p): p is number => typeof p === 'number')
		const homeImplied = lines
			.map(l => americanToImpliedProbability(l.moneyline?.moneyline_home))
			.filter((p): p is number => typeof p === 'number')
		if (awayImplied.length || homeImplied.length) {
			const avgAway = awayImplied.length ? awayImplied.reduce((a, b) => a + b, 0) / awayImplied.length : 0
			const avgHome = homeImplied.length ? homeImplied.reduce((a, b) => a + b, 0) / homeImplied.length : 0
			const total = avgAway + avgHome
			if (total > 0) {
				winProbAway = avgAway / total
				winProbHome = avgHome / total
			}
		}
	}

	return {
		spreadAway: spreadAwayAvg,
		spreadHome: spreadHomeAvg,
		totalPoints: totalPointsAvg,
		winProbAway,
		winProbHome,
	}
}

export type AtsOutcome = 'ATS Win' | 'ATS Loss' | 'ATS Push'

// Calculate ATS outcome for a team given final scores and spread (spread applied to the team)
export function computeAtsOutcome(teamScore: number, opponentScore: number, teamSpread: number): AtsOutcome {
	const adjusted = teamScore + teamSpread
	if (adjusted > opponentScore) return 'ATS Win'
	if (adjusted < opponentScore) return 'ATS Loss'
	return 'ATS Push'
}

// Convenience: derive ATS for both sides from consensus spreads
export function computeAtsFromConsensus(
	awayScore: number,
	homeScore: number,
	consensus: Pick<ConsensusResult, 'spreadAway' | 'spreadHome'>
): { away: AtsOutcome | null; home: AtsOutcome | null } {
	const away = typeof consensus.spreadAway === 'number' && isFinite(consensus.spreadAway)
		? computeAtsOutcome(awayScore, homeScore, consensus.spreadAway)
		: null
	const home = typeof consensus.spreadHome === 'number' && isFinite(consensus.spreadHome)
		? computeAtsOutcome(homeScore, awayScore, consensus.spreadHome)
		: null
	return { away, home }
}


