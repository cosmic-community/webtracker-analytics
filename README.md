# WebTracker Analytics

![WebTracker Analytics](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=300&fit=crop&auto=format)

A powerful web analytics platform similar to Hotjar that captures user interactions, records session replays, and generates heatmaps. This MVP demonstrates real-time user behavior tracking with all data stored in Cosmic CMS.

## ✨ Features

- **Real-time Session Recording** - Capture mouse movements, clicks, scrolls, and page interactions
- **Interactive Heatmap Visualization** - Generate click and movement heatmaps with intensity-based overlays
- **Session Replay Dashboard** - Browse, filter, and replay user sessions with playback controls
- **Live Analytics Dashboard** - View real-time visitor statistics and user behavior metrics
- **Self-Tracking Implementation** - The application tracks its own usage for demonstration
- **Cosmic CMS Backend** - All tracking data stored and managed through Cosmic
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Privacy-Focused** - Anonymized tracking with configurable sampling rates

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=68b892d966cccb5104c7005a&clone_repository=68b895cb66cccb5104c70067)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "I want to create a hotjar clone where I can record the cursor of visitors to my website and also get a heatmap of where users often go on my site. Can that be built?"

### Code Generation Prompt

> "I want to create a hotjar clone where I can record the cursor of visitors to my website and also get a heatmap of where users often go on my site. I want the heatmap and recordings to be saved to my Cosmic CMS and accessible in my admin dashboard. For the MVP of this site, let's have the website itself have the Hotjar style tracking on it and then we will add later the ability for users to add similar tracking to their site. This is most just to test out if it will work."

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🚀 Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Cosmic CMS for data storage and management
- **Analytics**: Custom tracking system with session recording
- **Visualization**: Canvas-based heatmap rendering
- **Icons**: Lucide React icons
- **Deployment**: Vercel, Netlify, or similar platforms

## 🎯 Getting Started

### Prerequisites

- Node.js 18+ installed
- Bun package manager (recommended) or npm
- Cosmic CMS account and bucket
- Git for version control

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd webtracker-analytics
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your Cosmic CMS credentials in `.env.local`:
```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

5. Start the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📡 Cosmic SDK Examples

### Storing Session Data
```typescript
// Store user session recording
const sessionData = await cosmic.objects.insertOne({
  type: 'tracking-sessions',
  title: `Session ${sessionId}`,
  metadata: {
    session_id: sessionId,
    website_domain: 'localhost:3000',
    duration: 180000,
    page_views: 3,
    events: eventsList,
    user_agent: navigator.userAgent
  }
});
```

### Retrieving Heatmap Data
```typescript
// Fetch heatmap data for specific page
const heatmapData = await cosmic.objects.find({
  type: 'heatmap-data',
  'metadata.website_domain': 'localhost:3000',
  'metadata.page_url': '/dashboard'
}).depth(1);
```

### Updating Analytics
```typescript
// Update website analytics
await cosmic.objects.updateOne(websiteId, {
  metadata: {
    total_sessions: newCount,
    last_activity: new Date().toISOString()
  }
});
```

## 🔗 Cosmic CMS Integration

This application uses three main Cosmic object types:

### Tracking Sessions
- **Purpose**: Store raw session recording data
- **Fields**: session_id, website_domain, events, duration, user_agent
- **Usage**: Session replay and behavior analysis

### Heatmap Data
- **Purpose**: Store aggregated click and scroll data
- **Fields**: website_domain, page_url, click_data, scroll_data
- **Usage**: Generate visual heatmaps and interaction patterns

### Website Configurations
- **Purpose**: Store tracking settings and API keys
- **Fields**: domain, api_key, settings, user_id
- **Usage**: Configure tracking behavior and authentication

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the project: `bun run build`
2. Deploy the `out` folder to Netlify
3. Configure environment variables in Netlify settings

### Self-hosted
1. Build the project: `bun run build`
2. Start the production server: `bun run start`
3. Configure reverse proxy (nginx/Apache) as needed

Remember to set up your environment variables in your deployment platform to ensure proper Cosmic CMS integration.
<!-- README_END -->