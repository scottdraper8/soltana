<div align="center">

# 2026 Old Testament Study Timeline

![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-1.97-CC6699?logo=sass&logoColor=white)
[![pre-commit](https://img.shields.io/badge/pre--commit-v4.4.0-FAB040?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit)

---


*A weekly study timeline that aligns the Come, Follow Me (OT 2026) curriculum with a chronological Old Testament reading plan. Track your progress across multiple Bible editions with an elegant, neumorphic interface.*

---

</div>

## Features

### Study Organization
- **52-week plan** covering the full year of Old Testament study
- **CFM integration** with links to official Come, Follow Me lessons
- **Chronological readings** providing historical context alongside topical studies
- **Current week highlighting** that automatically scrolls to the present week

### Modern Interface
- **Neumorphic design** with depth and dimension
- **Dynamic backgrounds** featuring CFM lesson banner images
- **Responsive layout** that adapts to any device
- **Smooth animations** and transitions throughout

## Quick Start

**Prerequisites:**
- Node.js 18 or higher
- npm or yarn

**Clone and setup:**

```bash
git clone https://github.com/YOUR_USERNAME/ot-2026-timeline.git
cd ot-2026-timeline
npm install
npm run dev
```

The application will open at `http://localhost:5173`

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production with TypeScript compilation |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint and Stylelint checks |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

### Project Structure

```
ot-2026-timeline/
├── src/
│   ├── assets/          # Images and static assets
│   ├── data/            # Week data (weeks.json)
│   ├── styles/          # Sass stylesheets
│   ├── timeline/        # Core timeline components
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── index.html           # Entry point
└── package.json         # Dependencies and scripts
```

## Data Structure

Weekly data is stored in `src/data/weeks.json` and typed through `src/types/timeline.ts`.

Each week entry includes:

- **Week metadata**: Number and date range
- **CFM lesson**: Title, link, reading assignment, excerpt, and banner image
- **Chronological readings**: Seven daily readings (empty strings for rest days)

**Example week structure:**

```json
{
  "week": 1,
  "startDate": "2025-12-29",
  "endDate": "2026-01-04",
  "dateLabel": "Dec 29–Jan 4",
  "cfm": {
    "title": "The First Testament of Jesus Christ",
    "link": "https://...",
    "reading": "Introduction to the Old Testament",
    "excerpt": "When you consider studying...",
    "image": "assets/images/lesson_banner.jpg"
  },
  "chronological": [
    "Epistle Dedicatory",
    "Bible Chronology",
    "", "", "", "", ""
  ]
}
```
