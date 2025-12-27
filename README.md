# GitHub Stats Generator

A beautiful web application for generating customizable GitHub statistics cards for your profile README.

## Features

- **Four Main Card Types**: Stats, Streak, Top Languages, and Additional Stats
- **40+ Built-in Themes**: Dark, light, transparent, radical, and many more
- **Fully Customizable**: Icons, borders, colors, and more
- **Live Preview**: See your card before copying
- **Copy-Paste Ready**: Get markdown code instantly
- **Lightweight SVGs**: Under 10KB, perfect for READMEs
- **Auto-updating**: Cards update automatically via GitHub API

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: GitHub Token

For higher API rate limits (5000/hour instead of 60/hour), create a `.env` file:

```bash
GITHUB_TOKEN=your_github_token_here
```

Get a token at: https://github.com/settings/tokens

## Deployment

Deploy easily on Vercel:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Usage

### Web UI

1. Enter your GitHub username
2. Select a card type (Stats, Top Languages, Streak, or Additional Stats)
3. Choose a theme from 40+ options
4. Toggle options (icons, borders, progress bars, etc.)
5. Preview your card in real-time
6. Copy the markdown code
7. Paste into your README.md

### API Endpoints

#### Stats Card
```
/api?username=octocat&theme=radical&show_icons=true
```

#### Top Languages
```
/api/top-langs/?username=octocat&layout=compact
```

#### Streak Card
```
/api/streak?username=octocat&theme=transparent
```

#### Additional Stats
```
/api/additional-stats?username=octocat&show_icons=true
```

### Parameters

- `username` (required): GitHub username
- `theme`: Theme name (default, dark, radical, etc.)
- `show_icons`: Show icons (true/false)
- `hide_border`: Hide card border (true/false)
- `hide_progress`: Hide progress bars (true/false, stats only)
- `layout`: Layout style (default/compact, top-langs only)
- `show`: Additional metrics (reviews,prs_merged, stats only)
- `bg_color`: Custom background color (hex without #)
- `title_color`: Custom title color (hex without #)

### Example Markdown

```markdown
![Stats](https://your-domain.vercel.app/api?username=octocat&theme=radical)

![Top Langs](https://your-domain.vercel.app/api/top-langs/?username=octocat)

![Streak](https://your-domain.vercel.app/api/streak?username=octocat)
```

## Tech Stack

- **Next.js 14**: React framework with API routes
- **TypeScript**: Type-safe development
- **Octokit**: GitHub API client
- **Node Cache**: API response caching
- **SVG**: Pure vector graphics (no canvas)

## License

MIT

