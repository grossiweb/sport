# StatsPro College Football Analytics Platform

A professional college football analytics platform built with Next.js, featuring advanced statistics, AI predictions, and betting insights exclusively for College Football (CFB).

## Features

### Core Functionality
- **College Football Only**: Exclusive focus on NCAA Football
- **Team Statistics**: Advanced analytics for college football teams
- **Player Statistics**: Individual performance metrics and trends
- **Daily Matchups**: Game insights with AI predictions
- **Betting Data**: Line movements, public betting percentages, handle data
- **Predictions & Trends**: AI-powered game predictions and market analysis
- **Game Schedules**: Complete college football schedules and scores

### Subscription Features
- **Member-only Access**: Paywall protection for premium content
- **Dark/Light Mode**: Theme switching
- **Responsive Design**: Mobile-first approach
- **Real-time Data**: Live updates via API integrations

### Content Management
- **WordPress CMS**: Headless WordPress for content management
- **Automated Emails**: Daily sports reports via email
- **Social Media**: Auto-posting to Instagram/Facebook
- **Content Scheduling**: Automated content distribution

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Data Fetching**: React Query, Axios
- **API**: TheRundown.io (College Football data only)
- **CMS**: WordPress (headless) with WPGraphQL
- **Email**: Nodemailer
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── teams/             # Team statistics pages
│   ├── players/           # Player statistics pages
│   ├── login/             # Authentication pages
│   └── ...
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── teams/             # Team-related components
│   ├── players/           # Player-related components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── api/               # API clients
│   ├── wordpress/         # WordPress integration
│   └── automation/        # Email/social automation
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- WAMP/XAMPP server (for WordPress)
- WordPress installation

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# WordPress GraphQL API
WORDPRESS_API_URL=http://localhost/statspro/graphql

# Sports Data API
THERUNDOWN_API_KEY=your_therundown_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. WordPress Setup

Your WordPress is already configured at `http://localhost/statspro/wp-admin` with:
- Username: stefano
- Password: sfg6678$$

The following plugins are installed:
- Advanced Custom Fields
- Custom Post Type UI
- Post Types Order
- Vercel Deploy Hooks
- WPGraphQL
- WPGraphQL for Advanced Custom Fields

### 4. API Keys Setup

#### TheRundown.io
1. Sign up at [TheRundown.io](https://therundown.io) or get access via RapidAPI
2. Get your API key from the dashboard
3. Add it to your `.env.local` file
4. Ensure you have access to College Football (americanfootball_ncaaf) endpoints

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## WordPress CMS Configuration

### Custom Post Types

Create these custom post types in WordPress:

1. **Email Templates**
   - Fields: Subject, Recipients, Send Daily, Sport Filters
   - Used for automated email campaigns

2. **Social Posts**
   - Fields: Platform, Content, Scheduled Date, Image URL, Status
   - Used for social media automation

### GraphQL Endpoints

The app connects to WordPress via GraphQL at:
`http://localhost/statspro/graphql`

### Content Management

1. **Email Management**: Create email templates in WordPress admin
2. **Social Media**: Schedule posts through WordPress interface
3. **Content Distribution**: Automated via the platform's API routes

## API Endpoints

### College Football Data
- `GET /api/games?date={date}` - Get college football games
- `GET /api/teams` - Get college football teams
- `GET /api/teams/stats` - Get team statistics
- `GET /api/players` - Get players
- `GET /api/players/stats` - Get player statistics
- `GET /api/predictions?date={date}` - Get game predictions
- `GET /api/betting/data?eventId={eventId}` - Get betting data

### Automation
- `POST /api/automation/email` - Send daily emails
- `POST /api/automation/social` - Publish social posts

## Key Features

### Team Statistics
- Sortable and filterable by multiple metrics
- Performance-based color coding
- Expandable rows for detailed stats
- Multi-sport support with sport-specific metrics

### Player Statistics
- Position and age filtering
- Performance tracking over time
- Advanced statistical breakdowns
- Player detail views

### Daily Matchups
- AI-powered game predictions
- Betting line analysis
- Weather and venue data
- Key player information

### Automated Content
- Daily email reports
- Social media posting
- WordPress content management
- Scheduled content distribution

## Customization

### Extending College Football Features
1. Add new stat fields to type definitions in `types/index.ts`
2. Update API mappers in `lib/api/sports-api.ts`
3. Add new columns to table components
4. Enhance prediction algorithms

### Styling
- Tailwind CSS configuration in `tailwind.config.js`
- Custom components in `app/globals.css`
- Dark mode support via `next-themes`

### Authentication
- Subscription-based access control
- Role-based permissions
- Session management
- Protected routes

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### WordPress Hosting
- Host WordPress on a server accessible to your Next.js app
- Ensure GraphQL endpoint is publicly accessible
- Configure CORS if needed

## Support

For questions about setup or customization, refer to:
- Next.js documentation
- WordPress GraphQL documentation
- TheRundown.io API documentation

## License

This project is proprietary software for StatsPro.