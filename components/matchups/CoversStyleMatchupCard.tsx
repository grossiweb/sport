'use client'

import React from 'react'
import { TeamLogo } from '@/components/ui/TeamLogo'
import { americanToImpliedProbability, computeConsensus, computeAtsFromConsensus } from '@/lib/utils/consensus'
import { formatSpread as formatSpreadUtil, formatTotal as formatTotalUtil, formatPercentage } from '@/lib/utils/betting-format'

interface TeamSide {
	name: string
	abbreviation?: string
	city?: string
	league: 'NFL' | 'CFB'
	id: string | number
	score?: number
}

interface CoversStyleMatchupCardProps {
	away: TeamSide
	home: TeamSide
	lines: any // raw lines object keyed by affiliate
}

export function CoversStyleMatchupCard({ away, home, lines }: CoversStyleMatchupCardProps) {
	const sportsbookLines = React.useMemo(() => {
		if (!lines) return [] as any[]
		return Object.values(lines)
	}, [lines])

	const consensus = React.useMemo(() => computeConsensus(
		sportsbookLines.map((l: any) => ({
			spread: {
				point_spread_away: l?.spread?.point_spread_away,
				point_spread_home: l?.spread?.point_spread_home,
				point_spread_away_money: l?.spread?.point_spread_away_money,
				point_spread_home_money: l?.spread?.point_spread_home_money
			},
			moneyline: {
				moneyline_away: l?.moneyline?.moneyline_away,
				moneyline_home: l?.moneyline?.moneyline_home
			},
			total: {
				total_over: l?.total?.total_over,
				total_under: l?.total?.total_under,
				total_over_money: l?.total?.total_over_money,
				total_under_money: l?.total?.total_under_money
			}
		}))
	), [sportsbookLines])

	const awayScore = typeof away.score === 'number' ? away.score : 0
	const homeScore = typeof home.score === 'number' ? home.score : 0
	const ats = computeAtsFromConsensus(awayScore, homeScore, {
		spreadAway: consensus.spreadAway ?? 0,
		spreadHome: consensus.spreadHome ?? 0
	})

	const formatPct = (p: number | null) => formatPercentage(p === null ? undefined : p)
	const formatSpread = (v: number | null) => formatSpreadUtil(v === null ? undefined : v)
	const formatTotal = (v: number | null) => formatTotalUtil(v === null ? undefined : v)

	return (
		<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
				<div className="text-xs font-semibold text-gray-700 dark:text-gray-200">Matchup</div>
				<div className="text-xs text-gray-500 dark:text-gray-400">Consensus Lines</div>
			</div>

			{/* Body */}
			<div className="p-4 grid grid-cols-3 gap-3 items-center">
				{/* Away */}
				<div className="flex flex-col items-center text-center">
					<TeamLogo team={{ id: String(away.id), name: away.name, city: away.city || '', abbreviation: away.abbreviation || '', league: away.league }} size="lg" />
					<div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{away.name}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">Win Prob: {formatPct(consensus.winProbAway)}</div>
				</div>

				{/* Middle metrics */}
				<div className="flex flex-col items-center gap-2">
					<div className="flex items-center gap-3">
						<div className="text-center">
							<div className="text-[11px] text-gray-500 dark:text-gray-400">Spread</div>
							<div className="text-sm font-semibold text-gray-900 dark:text-white">{formatSpread(consensus.spreadAway)} / {formatSpread(consensus.spreadHome)}</div>
						</div>
						<div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
						<div className="text-center">
							<div className="text-[11px] text-gray-500 dark:text-gray-400">Total (O/U)</div>
							<div className="text-sm font-semibold text-gray-900 dark:text-white">{formatTotal(consensus.totalPoints)}</div>
						</div>
					</div>

					<div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
						<div className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
							Away ATS: {ats.away ?? '—'}
						</div>
						<div className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
							Home ATS: {ats.home ?? '—'}
						</div>
					</div>
				</div>

				{/* Home */}
				<div className="flex flex-col items-center text-center">
					<TeamLogo team={{ id: String(home.id), name: home.name, city: home.city || '', abbreviation: home.abbreviation || '', league: home.league }} size="lg" />
					<div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{home.name}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">Win Prob: {formatPct(consensus.winProbHome)}</div>
				</div>
			</div>
		</div>
	)
}


