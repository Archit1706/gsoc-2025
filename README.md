# OSM Road Closures Frontend

A Next.js-based frontend application for the OpenStreetMap Temporary Road Closures Database and API project. This application provides a user-friendly interface for reporting and viewing temporary road closures.

## Features

-   **Interactive Map**: Built with Leaflet.js and React-Leaflet for displaying road closures on OpenStreetMap
-   **Real-time Updates**: Live display of active, upcoming, and expired road closures
-   **Closure Reporting**: Easy-to-use multi-step form for community members to report road closures
-   **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
-   **Location Selection**: Click-to-select location functionality on the map
-   **Closure Management**: View detailed information about each closure with status indicators
-   **Statistics Dashboard**: Comprehensive analytics and insights about road closures
-   **OpenLR Integration**: Support for OpenLR location referencing format

## Technologies Used

-   **Framework**: Next.js 15 with TypeScript (App Router)
-   **Styling**: Tailwind CSS v4
-   **Maps**: Leaflet.js with React-Leaflet
-   **State Management**: React Context API with useReducer
-   **Forms**: React Hook Form with multi-step validation
-   **HTTP Client**: Axios
-   **Notifications**: React Hot Toast
-   **Icons**: Lucide React
-   **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/                      # Next.js App Router directory
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles and Tailwind imports
├── components/              # React components
│   ├── Layout/              # Layout components
│   │   ├── Header.tsx       # Application header with navigation
│   │   ├── Sidebar.tsx      # Closures list sidebar
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   └── StatsDashboard.tsx # Statistics and analytics dashboard
│   ├── Map/                 # Map-related components
│   │   └── MapComponent.tsx # Interactive map with closures visualization
│   └── Forms/               # Form components
│       └── ClosureForm.tsx  # Multi-step road closure reporting form
├── context/                 # React Context providers
│   └── ClosuresContext.tsx  # Global state management for closures
├── services/                # API and external services
│   └── api.ts               # API client, types, and HTTP requests
├── public/                  # Static assets and icons
├── .gitignore               # Git ignore patterns
├── Dockerfile               # Container configuration (if available)
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration for Tailwind
├── tailwind.config.js       # Tailwind CSS configuration (v4)
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Getting Started

### Prerequisites

-   Node.js 18 or higher
-   npm, yarn, or pnpm
-   Backend FastAPI server running (see backend README)

### Installation

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd osm-road-closures/frontend
    ```

2. **Install dependencies**:

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. **Set up environment variables**:

    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4. **Run the development server**:

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

### Docker Deployment

If Dockerfile is available:

```bash
# Build the Docker image
docker build -t osm-closures-frontend .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url osm-closures-frontend
```

## Usage

### Reporting a Road Closure

1. Click the **"Report Closure"** button in the header
2. Follow the 3-step form process:
    - **Step 1**: Describe the closure, select reason, and set severity level
    - **Step 2**: Click on the map to select location, set time range, and provide your name
    - **Step 3**: Add optional contact information and alternative routes
3. Review and submit the closure report

### Viewing Road Closures

-   **Map View**: Closures are displayed as animated markers/lines on the map
    -   Red: Active closures
    -   Gray: Expired closures
    -   Different icons based on closure type
-   **Sidebar**: Lists all closures with status indicators and filtering
    -   Click on any closure to focus on it on the map
    -   Real-time status updates
-   **Status Indicators**:
    -   Active: Currently blocking traffic
    -   Upcoming: Scheduled for future
    -   Expired: No longer active

### Statistics Dashboard

Access comprehensive analytics including:

-   Total closure counts and status breakdown
-   Closure distribution by reason and severity
-   Recent activity timeline
-   OpenLR integration statistics

### Map Features

-   **Interactive Navigation**: Pan, zoom, and explore the map
-   **Dynamic Loading**: Closures update based on map bounds
-   **Click Selection**: Click on closures to see detailed information
-   **Location Picker**: Click-to-select functionality for reporting
-   **Responsive Design**: Optimized for all screen sizes

## API Integration

The frontend communicates with the FastAPI backend through the `services/api.ts` module:

-   **GET /closures**: Fetch closures within map bounds
-   **GET /closures/stats**: Retrieve closure statistics
-   **POST /closures**: Create new closure reports
-   **PUT /closures/:id**: Update existing closures
-   **DELETE /closures/:id**: Remove closures

## State Management

The application uses React Context API for global state management:

-   **ClosuresContext**: Manages closure data, loading states, and API calls
-   **Actions**: CREATE, UPDATE, DELETE, SELECT closures
-   **Error Handling**: Centralized error management with user notifications
-   **Real-time Updates**: Automatic data refresh based on user interactions

## Styling

-   **Tailwind CSS v4**: Latest utility-first CSS framework
-   **Custom Components**: Reusable UI components with consistent styling
-   **Responsive Design**: Mobile-first approach with breakpoint optimization
-   **Animations**: Smooth transitions and loading states
-   **Accessibility**: WCAG-compliant color contrast and navigation

## Development Guidelines

### Code Style

-   **TypeScript**: Strict type checking enabled
-   **ESLint**: Code linting with Next.js recommended rules
-   **Component Structure**: Functional components with hooks
-   **File Organization**: Logical grouping by feature and responsibility

### Component Guidelines

-   Use TypeScript interfaces for all props
-   Implement error boundaries for robust error handling
-   Follow React best practices (hooks, memo, suspense)
-   Keep components focused and reusable
-   Use proper semantic HTML for accessibility

### Performance Optimizations

-   **Dynamic Imports**: Map component loaded only on client-side
-   **Code Splitting**: Automatic route-based splitting
-   **Image Optimization**: Next.js automatic optimization
-   **Bundle Analysis**: Optimized dependency bundling
-   **Caching**: Smart API response caching

## Environment Variables

| Variable              | Description         | Default                 | Required |
| --------------------- | ------------------- | ----------------------- | -------- |
| `NEXT_PUBLIC_API_URL` | FastAPI Backend URL | `http://localhost:8000` | Yes      |

## Browser Support

-   Chrome 88+
-   Firefox 85+
-   Safari 14+
-   Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the coding guidelines
4. Test your changes thoroughly
5. Commit changes: `git commit -am 'Add some feature'`
6. Push to branch: `git push origin feature/your-feature`
7. Submit a pull request with detailed description

## Deployment Options

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push
4. Automatic preview deployments for pull requests

### Other Platforms

The application can be deployed to:

-   Netlify
-   AWS Amplify
-   Railway
-   Heroku
-   Docker containers
-   Self-hosted servers

## Testing (Future Enhancement)

The project structure supports adding:

-   **Unit Tests**: Jest with React Testing Library
-   **Integration Tests**: Testing user workflows
-   **E2E Tests**: Cypress or Playwright
-   **API Mocking**: MSW for development and testing

## GSoC 2025 Integration

This frontend is part of the Google Summer of Code 2025 project for OpenStreetMap:

-   **Project**: Temporary Road Closures Database and API
-   **Mentor**: Simon Poole
-   **Student**: Archit Rathod
-   **Backend**: FastAPI with PostgreSQL/PostGIS
-   **OpenLR Support**: Location referencing for cross-platform compatibility
-   **OsmAnd Integration**: Planned integration with mobile navigation

## License

This project is part of the Google Summer of Code 2025 program with OpenStreetMap. See the main project repository for license details.

## Support

For questions and support:

-   Create an issue in the GitHub repository
-   Contact the project mentor: Simon Poole
-   Join the OSM development community discussions
-   Refer to the GSoC project documentation

## Roadmap

-   [x] Basic map interface with closure display
-   [x] Multi-step closure reporting form
-   [x] Real-time status updates
-   [x] Statistics dashboard
-   [ ] Advanced filtering and search
-   [ ] Mobile app integration (OsmAnd)
-   [ ] Offline functionality
-   [ ] User authentication system
-   [ ] Closure verification workflow
