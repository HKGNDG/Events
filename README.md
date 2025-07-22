# Nashville Event Pulse 🎵

A modern, full-stack event management system designed specifically for Nashville's vibrant entertainment scene. This application provides real-time event tracking, venue management, and impact analysis for hotels and businesses in the Nashville area.

## 🌟 Features

### Frontend (React + Vite)
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS and Shadcn UI components
- **Real-time Dashboard**: Live event statistics and impact metrics
- **Event Management**: Comprehensive event listing with advanced filtering
- **Venue Analytics**: Detailed venue information and capacity tracking
- **Integration Hub**: External API connections and system monitoring
- **Settings Management**: Configurable hotel and system preferences

### Backend (Spring Boot)
- **RESTful API**: Complete REST API for frontend communication
- **Ticketmaster Integration**: Real-time event data from Ticketmaster API
- **Image Processing**: Intelligent image selection and optimization
- **Multi-page Fetching**: Aggregates data from multiple API calls
- **CORS Support**: Cross-origin resource sharing enabled

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Lucide React** - Customizable icon library
- **React Router** - Client-side routing
- **Date-fns** - Date manipulation utilities

### Backend
- **Spring Boot 3** - Java-based microservices framework
- **Maven** - Build automation and dependency management
- **RestTemplate** - HTTP client for API calls
- **Jackson** - JSON processing
- **Spring Web** - RESTful web services

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Java 17+
- Maven 3.6+

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Navigate to backend directory
cd eventsystem

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

## 🔧 Configuration

### Frontend Configuration
The frontend connects to the backend API running on `http://localhost:8080` by default.

### Backend Configuration
Update `eventsystem/src/main/resources/application.properties`:
```properties
# Server configuration
server.port=8080

# Ticketmaster API configuration
ticketmaster.api.key=YOUR_API_KEY
ticketmaster.api.base-url=https://app.ticketmaster.com/discovery/v2

# CORS configuration
spring.web.cors.allowed-origins=http://localhost:5173
```

## 📊 API Endpoints

### Events
- `GET /api/events` - Get all events with pagination
- `GET /api/events/{id}` - Get specific event
- `GET /api/events/search` - Search events with filters

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/{id}` - Get specific venue

### Configuration
- `GET /api/config` - Get system configuration
- `POST /api/config` - Update system configuration

## 🎨 UI Components

### Dashboard
- Real-time event statistics
- Impact score tracking
- Quick action buttons
- Activity feed

### Events
- Advanced filtering (date, impact level, venue type)
- Grid and list view modes
- Event cards with images
- Pagination support

### Analytics
- Event impact timeline
- Venue utilization charts
- Category distribution
- Interactive charts

### Integration
- API connection status
- System health monitoring
- External service management

## 🔍 Key Features

### Image Processing
- Automatic image selection from multiple sources
- Quality-based image prioritization
- Fallback mechanisms for missing images
- Metadata extraction and optimization

### Event Filtering
- Date range selection
- Impact level filtering
- Venue type categorization
- Distance-based filtering
- Real-time search

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interactions
- Adaptive layouts

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Backend Deployment
```bash
# Build JAR file
mvn clean package

# Run JAR file
java -jar target/eventsystem-0.0.1-SNAPSHOT.jar
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ticketmaster API** - Event data source
- **Shadcn UI** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Icon library
- **Spring Boot** - Backend framework

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: harshit@nashvilledigitalgroup.com

---

**Built with ❤️ for Nashville's vibrant entertainment scene**