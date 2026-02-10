# CrimeLens Frontend

A modern web application for visualizing and analyzing crime data in Ottawa, built with React Router/Remix.

## Overview

CrimeLens provides an interactive platform for exploring crime statistics and trends in Ottawa. The application offers data visualization, filtering capabilities, and geographic mapping to help users better understand crime patterns in their community.

## Features

- **Interactive Crime Map**: Visualize crime incidents on an interactive map of Ottawa
- **Data Filtering**: Filter crime data by type, date range, location, and other parameters
- **Statistical Analysis**: View trends and analytics on crime patterns
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Data**: Access to up-to-date crime statistics

## Tech Stack

- **Framework**: React Router / Remix
- **Language**: TypeScript
- **Styling**: CSS/Tailwind CSS
- **Maps**: Maplibre

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tazim04/ottawa-crime-lens-frontend.git
cd ottawa-crime-lens-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` (or the port specified in your configuration).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Run formatter
- `npm run typecheck` - Run TypeScript type checking

## API Integration

This frontend connects to the CrimeLens backend API. Ensure the backend is running and accessible at the URL specified in your `.env` file.

Backend repository: [https://github.com/tazim04/Ottawa-Crime-Lens-Query]

## Features in Detail

### Crime Map
- Interactive map showing crime incident locations
- Cluster markers for areas with high crime density
- Click on markers to view incident details
- Filter crimes by type and date

### Analytics Dashboard
- Crime trends over time
- Geographic heat maps
- Statistical summaries

### Search & Filter
- Search by address or neighborhood
- Filter by crime category
- Date range selection
- Export filtered data

## Acknowledgments

- Crime data provided by Ottawa Police Service
- Map data © OpenStreetMap contributors
- Built with React Router/Remix

---

Made with ❤️ for the Ottawa community
