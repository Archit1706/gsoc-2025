# OSM Road Closures Frontend

A Next.js-based frontend application for the OpenStreetMap Temporary Road Closures Database and API project. This application provides a user-friendly interface for reporting and viewing temporary road closures.

## Features

-   **Interactive Map**: Built with Leaflet.js and React-Leaflet for displaying road closures on OpenStreetMap
-   **Real-time Updates**: Live display of active, upcoming, and expired road closures
-   **Closure Reporting**: Easy-to-use form for community members to report road closures
-   **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
-   **Location Selection**: Click-to-select location functionality on the map
-   **Closure Management**: View detailed information about each closure with status indicators

## Technologies Used

-   **Framework**: Next.js 14 with TypeScript
-   **Styling**: Tailwind CSS
-   **Maps**: Leaflet.js with React-Leaflet
-   **State Management**: React Context API with useReducer
-   **Forms**: React Hook Form
-   **HTTP Client**: Axios
-   **Notifications**: React Hot Toast
-   **Icons**: Lucide React
-   **Date Handling**: date-fns

## Project Structure

```
frontend/
├── pages/
│   ├── _app.tsx              # Next.js app wrapper
│   └── index.tsx             # Main page component
├── src/
│   ├── components/
│   │   ├── Layout/           # Layout components
│   │   │   ├── Header.tsx    # Application header
│   │   │   ├── Sidebar.tsx   # Closures list sidebar
│   │   │   └── Layout.tsx    # Main layout wrapper
│   │   ├── Map/              # Map-related components
│   │   │   └── MapComponent.tsx # Interactive map with closures
│   │   └── Forms/            # Form components
│   │       └── ClosureForm.tsx # Road closure reporting form
│   ├── context/
│   │   └── ClosuresContext.tsx # Global state management
│   ├── services/
│   │   └── api.ts            # API client and types
│   └── types/                # TypeScript type definitions
├── styles/
│   └── globals.css           # Global styles and Tailwind imports
├── public/                   # Static assets
├── Dockerfile                # Container configuration
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Getting Started

### Prerequisites

-   Node.js 18 or higher
-   npm or yarn
-   Backend API running (see backend README)

### Installation

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd osm-road-closures/frontend
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables**:

    ```bash
    cp .env.local.example .env.local
    ```

    Update `.env.local` with your configuration:

    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4. **Run the development server**:

    ```bash
    npm run dev
    ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t osm-closures-frontend .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url osm-closures-frontend
```

## Usage

### Reporting a Road Closure

1. Click the **"Report Closure"** button in the header
2. Click on the map to select the closure location
3. Fill out the form with:
    - Description of the closure
    - Reason for closure (construction, accident, etc.)
    - Start and end times
    - Your name
4. Submit the form

### Viewing Road Closures

-   **Map View**: Closures are displayed as colored markers/lines on the map
    -   Red: Active closures
    -   Gray: Expired closures
-   **Sidebar**: Lists all closures with status indicators
    -   Click on any closure to focus on it on the map
-   **Status Indicators**:
    -   Active: Currently blocking traffic
    -   Upcoming: Scheduled for future
    -   Expired: No longer active

### Map Features

-   **Pan and Zoom**: Navigate around the map
-   **Click Selection**: Click on closures to see details
-   **Auto-refresh**: Closures update based on map bounds
-   **Responsive**: Works on all screen sizes

## API Integration

The frontend communicates with the backend API through the `services/api.ts` module:

-   **GET /closures**: Fetch closures within map bounds
-   **POST /closures**: Create new closure reports
-   **PUT /closures/:id**: Update existing closures
-   **DELETE /closures/:id**: Remove closures

## State Management

The application uses React Context API for global state management:

-   **ClosuresContext**: Manages closure data, loading states, and API calls
-   **Actions**: CREATE, UPDATE, DELETE, SELECT closures
-   **Error Handling**: Centralized error management with user notifications

## Styling

-   **Tailwind CSS**: Utility-first CSS framework
-   **Custom Components**: Reusable UI components with consistent styling
-   **Responsive Design**: Mobile-first approach
-   **Dark/Light Mode**: Can be extended for theme switching

## Development Guidelines

### Code Style

-   **TypeScript**: Strict type checking enabled
-   **ESLint**: Code linting with Next.js recommended rules
-   **Prettier**: Code formatting (can be added)
-   **Component Structure**: Functional components with hooks

### Component Guidelines

-   Use TypeScript interfaces for props
-   Implement error boundaries for robust error handling
-   Follow React best practices (hooks, memo, etc.)
-   Keep components focused and reusable

### Testing (Future Enhancement)

The project structure supports adding:

-   Jest for unit testing
-   React Testing Library for component testing
-   Cypress for end-to-end testing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The application can be deployed to:

-   Netlify
-   AWS Amplify
-   Heroku
-   Docker containers

## Environment Variables

| Variable              | Description     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## Browser Support

-   Chrome 88+
-   Firefox 85+
-   Safari 14+
-   Edge 88+

## Performance Optimizations

-   **Dynamic Imports**: Map component loaded only on client-side
-   **Image Optimization**: Next.js automatic image optimization
-   **Bundle Splitting**: Automatic code splitting by Next.js
-   **Caching**: API response caching where appropriate

## License

This project is part of the Google Summer of Code 2025 program with OpenStreetMap.

## Support

For questions and support:

-   Create an issue in the GitHub repository
-   Contact the project mentor: Simon Poole
-   Join the OSM development community discussions
