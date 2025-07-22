# Ticketmaster Event System (Spring Boot Backend)

A robust Spring Boot backend for fetching, processing, and serving event data from the Ticketmaster API. Designed for integration with modern frontend dashboards, this service provides a clean REST API with filtering, sorting, impact scoring, and venue metadata enrichment.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Setup & Installation](#setup--installation)
4. [Configuration](#configuration)
5. [Project Structure](#project-structure)
    - [File-by-File Breakdown](#file-by-file-breakdown)
6. [API Usage](#api-usage)
7. [Architecture & Extensibility](#architecture--extensibility)
8. [Contribution Guidelines](#contribution-guidelines)
9. [Support & Contact](#support--contact)

---

## Project Overview

This backend service fetches events from the Ticketmaster API, enriches them with venue metadata and impact scoring, and exposes a REST endpoint for frontend consumption. It is ideal for powering event dashboards, analytics, or hotel/event management systems.

---

## Features
- Fetches events from Ticketmaster using your API key
- REST endpoint: `/api/events` with rich query parameters
- Configurable API key, base URL, and server port
- Venue metadata enrichment (tier, type)
- Impact score and impact level calculation for each event
- Filtering by date, keyword, location, and period (today, week, month)
- Pagination and sorting support
- CORS enabled for frontend integration
- Simple, extensible Java structure

---

## Setup & Installation

### 1. Build the Project
```bash
mvn clean install
```

### 2. Run the Application
```bash
mvn spring-boot:run
```

The server will start on [http://localhost:8080](http://localhost:8080)

---

## Configuration

Edit `src/main/resources/application.properties` to set your Ticketmaster API key, secret, base URL, and server port:

```
# Ticketmaster API configuration
api.ticketmaster.key=YOUR_API_KEY
api.ticketmaster.secret=YOUR_API_SECRET
api.ticketmaster.base-url=https://app.ticketmaster.com/discovery/v2/events.json
server.port=8080
```

---

## Project Structure

```
eventsystem/
  ├── pom.xml
  ├── README.md
  ├── src/
      └── main/
          ├── java/
          │   └── com/example/eventsystem/
          │       ├── EventsystemApplication.java
          │       ├── controller/
          │       │   └── EventController.java
          │       ├── service/
          │       │   └── TicketmasterService.java
          │       └── model/
          │           └── EventResponse.java
          └── resources/
              └── application.properties
```

### File-by-File Breakdown

- **pom.xml** — Maven project configuration, dependencies (Spring Boot, Lombok, etc.)
- **application.properties** — API key, secret, base URL, and server port configuration
- **EventsystemApplication.java** — Main Spring Boot entry point
- **controller/EventController.java** — REST controller for `/api/events`, handles HTTP requests and delegates to the service
- **service/TicketmasterService.java** — Core logic for fetching, mapping, scoring, and filtering events from Ticketmaster
- **model/EventResponse.java** — Data model for event responses, including all event, venue, and impact fields

---

## API Usage

### Endpoint
- **GET** `/api/events`

### Query Parameters
- `startDate` (optional, ISO 8601): Start of date range
- `endDate` (optional, ISO 8601): End of date range
- `keyword` (optional): Search keyword
- `page` (default: 0): Page number (pagination)
- `size` (default: 10): Page size (pagination)
- `sortBy` (default: date): Field to sort by (`date`, `name`, `venue`)
- `sortDir` (default: asc): Sort direction (`asc` or `desc`)
- `lat` (optional): Latitude (defaults to Nashville hotel)
- `lon` (optional): Longitude (defaults to Nashville hotel)
- `radius` (optional): Search radius in miles (default: 10)
- `period` (optional): Predefined period (`today`, `week`, `month`)

### Example
```bash
curl "http://localhost:8080/api/events?keyword=music&startDate=2025-08-01T00:00:00Z&endDate=2025-08-31T23:59:59Z"
```

### Response
Returns a JSON array of event objects, each with:
- `id`, `name`, `date`, `time`, `venue`, `address`, `category`, `price`, `ticketUrl`, `status`, `description`, `venueTier`, `venueType`, `impactScore`, `impactLevel`, `distance`

---

## Architecture & Extensibility

- **Spring Boot:** Modern Java backend framework
- **Service Layer:** All Ticketmaster API logic, mapping, and scoring in `TicketmasterService.java`
- **Model:** `EventResponse.java` encapsulates all event/venue/impact data
- **Controller:** `EventController.java` exposes REST endpoint, handles query params, and CORS
- **Configurable:** API keys, base URL, and port via `application.properties`
- **Extensible:** Add new endpoints, models, or business logic by following the modular structure
- **Logging:** Uses SLF4J for logging API calls and errors

---

## Contribution Guidelines

1. Fork and clone the repository
2. Create a new branch for your feature or fix
3. Follow the existing code style (Java 17+, Spring Boot conventions)
4. Add/modify classes in the appropriate package
5. Test your changes locally (`mvn spring-boot:run`)
6. Submit a pull request with a clear description

---

## Support & Contact

For support, questions, or feature requests, contact:
- **Project Maintainer:** (add your contact here)

---

*Generated by deep code analysis. For further details, see inline code comments and the [API Usage](#api-usage) section.* 