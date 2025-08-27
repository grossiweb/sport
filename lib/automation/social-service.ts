import { wordpressClient } from '@/lib/wordpress/client'
import { sportsAPI } from '@/lib/api/sports-api'
import { SocialPost, Game, SportType } from '@/types'
import { format } from 'date-fns'

export class SocialService {
  async generateDailySocialPosts(): Promise<SocialPost[]> {
    try {
      // Get today's featured games
      const today = format(new Date(), 'yyyy-MM-dd')
      const allGames: Game[] = []
      
      // Get CFB games for today
      try {
        const games = await sportsAPI.getGames('CFB',today)
        allGames.push(...games.slice(0, 2)) // Top 2 games
      } catch (error) {
        console.error('Error fetching CFB games:', error)
      }

      const posts: SocialPost[] = []

      // Generate Instagram post
      posts.push(await this.generateInstagramPost(allGames))

      // Generate Facebook post
      posts.push(await this.generateFacebookPost(allGames))

      // Generate Twitter post
      posts.push(await this.generateTwitterPost(allGames))

      return posts
    } catch (error) {
      console.error('Error generating social posts:', error)
      throw error
    }
  }

  async publishDailySocialPosts(): Promise<void> {
    try {
      const posts = await this.generateDailySocialPosts()
      
      for (const post of posts) {
        // Create post in WordPress
        await wordpressClient.createSocialPost(post)
        
        // Here you would integrate with actual social media APIs
        // For now, we'll just log the posts
        console.log(`${post.platform} post scheduled:`, post.content)
      }

      console.log('Daily social posts published successfully')
    } catch (error) {
      console.error('Error publishing social posts:', error)
      throw error
    }
  }

  private async generateInstagramPost(games: Game[]): Promise<SocialPost> {
    const topGames = games.slice(0, 3)
    const gameList = topGames.map(game => 
      `🏆 ${game.awayTeam.name} @ ${game.homeTeam.name}`
    ).join('\n')

    const content = `🔥 Today's Top Matchups! 🔥

${gameList}

Get expert analysis, predictions, and betting insights at StatsPro 📊

#SportsBetting #SportsAnalytics #${topGames[0]?.league || 'Sports'} #StatsPro #PredictionsDaily`

    return {
      platform: 'instagram',
      content,
      imageUrl: await this.generateGameGraphic(topGames),
      scheduledDate: this.getScheduledTime(8, 0), // 8:00 AM
      status: 'scheduled'
    }
  }

  private async generateFacebookPost(games: Game[]): Promise<SocialPost> {
    const featuredGame = games[0]
    if (!featuredGame) {
      return {
        platform: 'facebook',
        content: 'Check out today\'s sports analytics and predictions at StatsPro!',
        scheduledDate: this.getScheduledTime(10, 0),
        status: 'scheduled'
      }
    }

    const content = `🎯 Featured Matchup Alert!

${featuredGame.awayTeam.city} ${featuredGame.awayTeam.name} vs ${featuredGame.homeTeam.city} ${featuredGame.homeTeam.name}

📍 ${featuredGame.venue || 'TBD'}
⏰ ${format(featuredGame.gameDate, 'h:mm a')}

Our AI analysis is predicting an exciting game! Get detailed breakdowns, player props, and betting insights with your StatsPro subscription.

What's your prediction? Drop it in the comments! 👇

#${featuredGame.league} #SportsAnalytics #SportsPredictions #StatsPro`

    return {
      platform: 'facebook',
      content,
      scheduledDate: this.getScheduledTime(10, 0), // 10:00 AM
      status: 'scheduled'
    }
  }

  private async generateTwitterPost(games: Game[]): Promise<SocialPost> {
    const featuredGame = games[0]
    if (!featuredGame) {
      return {
        platform: 'twitter',
        content: '📊 Daily sports analytics and predictions now live at StatsPro! #SportsAnalytics',
        scheduledDate: this.getScheduledTime(12, 0),
        status: 'scheduled'
      }
    }

    const content = `🚨 Game Alert: ${featuredGame.awayTeam.abbreviation} @ ${featuredGame.homeTeam.abbreviation}

📊 Advanced analytics
🤖 AI predictions  
💰 Betting insights

All available now at StatsPro!

#${featuredGame.league} #SportsBetting #Analytics`

    return {
      platform: 'twitter',
      content,
      scheduledDate: this.getScheduledTime(12, 0), // 12:00 PM
      status: 'scheduled'
    }
  }

  private async generateGameGraphic(games: Game[]): Promise<string> {
    // In a real implementation, you would generate an actual graphic
    // using a service like Canvas API, Puppeteer, or a graphic generation service
    // For now, return a placeholder URL
    return 'https://via.placeholder.com/1080x1080/2563eb/ffffff?text=StatsPro+Daily+Games'
  }

  private getScheduledTime(hour: number, minute: number): Date {
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    return date
  }
}

export const socialService = new SocialService()