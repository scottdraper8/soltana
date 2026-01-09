# 2026 Old Testament Study Timeline

A weekly study timeline that aligns the Come, Follow Me (OT 2026) curriculum with a chronological Old Testament reading plan. The timeline provides references for study using multiple Bible editions: KJV-JST, LSB-Mac, Hebrew Study Bible, and ESV Church History Bible.

## Features

- **52-week plan**: Covers the full year of Old Testament study
- **CFM integration**: Links to official Come, Follow Me lessons with weekly reading assignments
- **Chronological readings**: Daily readings that provide chronological context alongside CFM studies
- **Resource tracking**: Checkboxes for tracking progress across four Bible editions
- **Current week highlighting**: Automatically highlights and scrolls to the current week
- **Responsive design**: Neumorphic UI that works across devices

## Technology

Built with TypeScript, Vite, and SCSS. Uses a modular architecture with separate modules for data, rendering, navigation, and utilities.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## Data Structure

Weekly data is stored in `src/data/weeks.json` and typed through `src/types/timeline.ts`. Each week includes:

- Week number and date range
- Come, Follow Me lesson title, link, and reading assignment
- Seven daily chronological readings (empty strings for days without readings)
