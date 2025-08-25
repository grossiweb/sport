import nodemailer from 'nodemailer'
import { wordpressClient } from '@/lib/wordpress/client'
import { sportsAPI } from '@/lib/api/sports-api'
import { EmailContent, Game, SportType } from '@/types'
import { format } from 'date-fns'

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async generateDailyEmail(): Promise<EmailContent> {
    try {
      // Get today's games for all sports
      const today = format(new Date(), 'yyyy-MM-dd')
      const allGames: Game[] = []
      
      const sports: SportType[] = ['CFB']
      
      for (const sport of sports) {
        try {
          const games = await sportsAPI.getGames(sport, today)
          allGames.push(...games)
        } catch (error) {
          console.error(`Error fetching ${sport} games:`, error)
        }
      }

      // Generate HTML content
      const htmlContent = this.generateDailyEmailHTML(allGames)
      const textContent = this.generateDailyEmailText(allGames)

      return {
        subject: `StatsPro Daily Report - ${format(new Date(), 'MMMM do, yyyy')}`,
        htmlContent,
        textContent,
        recipients: await this.getSubscriberEmails()
      }
    } catch (error) {
      console.error('Error generating daily email:', error)
      throw error
    }
  }

  async sendDailyEmail(): Promise<void> {
    try {
      const emailContent = await this.generateDailyEmail()
      
      // Create email campaign in WordPress
      await wordpressClient.createEmailCampaign(emailContent)

      // Send email
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailContent.recipients,
        subject: emailContent.subject,
        html: emailContent.htmlContent,
        text: emailContent.textContent,
      })

      console.log('Daily email sent successfully')
    } catch (error) {
      console.error('Error sending daily email:', error)
      throw error
    }
  }

  private generateDailyEmailHTML(games: Game[]): string {
    const gamesByLeague = games.reduce((acc, game) => {
      if (!acc[game.league]) {
        acc[game.league] = []
      }
      acc[game.league].push(game)
      return acc
    }, {} as Record<SportType, Game[]>)

    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .league-section { margin-bottom: 30px; }
            .league-title { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
            .game { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; }
            .teams { font-weight: bold; }
            .time { color: #666; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>StatsPro Daily Report</h1>
            <p>${format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
          </div>
          <div class="content">
            <h2>Today's Games & Analysis</h2>
    `

    Object.entries(gamesByLeague).forEach(([league, leagueGames]) => {
      html += `
        <div class="league-section">
          <h3 class="league-title">${league}</h3>
      `
      
      leagueGames.forEach(game => {
        html += `
          <div class="game">
            <div class="teams">
              ${game.awayTeam.city} ${game.awayTeam.name} @ ${game.homeTeam.city} ${game.homeTeam.name}
            </div>
            <div class="time">
              ${format(game.gameDate, 'h:mm a')} ${game.venue ? `• ${game.venue}` : ''}
            </div>
          </div>
        `
      })
      
      html += `</div>`
    })

    html += `
            <p>Get detailed analysis, predictions, and betting insights at <a href="http://localhost:3000">StatsPro</a></p>
          </div>
          <div class="footer">
            <p>© 2024 StatsPro. All rights reserved.</p>
            <p><a href="#unsubscribe">Unsubscribe</a> | <a href="#preferences">Preferences</a></p>
          </div>
        </body>
      </html>
    `

    return html
  }

  private generateDailyEmailText(games: Game[]): string {
    let text = `StatsPro Daily Report - ${format(new Date(), 'MMMM do, yyyy')}\n\n`
    text += `Today's Games & Analysis\n${'='.repeat(30)}\n\n`

    const gamesByLeague = games.reduce((acc, game) => {
      if (!acc[game.league]) {
        acc[game.league] = []
      }
      acc[game.league].push(game)
      return acc
    }, {} as Record<SportType, Game[]>)

    Object.entries(gamesByLeague).forEach(([league, leagueGames]) => {
      text += `${league}\n${'-'.repeat(league.length)}\n`
      
      leagueGames.forEach(game => {
        text += `${game.awayTeam.city} ${game.awayTeam.name} @ ${game.homeTeam.city} ${game.homeTeam.name}\n`
        text += `${format(game.gameDate, 'h:mm a')}${game.venue ? ` • ${game.venue}` : ''}\n\n`
      })
    })

    text += `Get detailed analysis at: http://localhost:3000\n\n`
    text += `© 2024 StatsPro. All rights reserved.`

    return text
  }

  private async getSubscriberEmails(): Promise<string[]> {
    // This would typically fetch from your user database
    // For now, return a placeholder
    return ['subscribers@statspro.com']
  }
}

export const emailService = new EmailService()