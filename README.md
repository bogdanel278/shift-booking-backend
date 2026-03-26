# Shift Booking Backend

A scalable backend for a shift-booking marketplace application similar to Coople or Indeed Flex.

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **PostgreSQL** - Database
- **Clean Architecture** - Separation of concerns

## Features

### Workers
- Create accounts
- View available shifts
- Book shifts
- View their bookings

### Businesses
- Create accounts
- Post shifts
- View bookings for their shifts

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE shift_booking;
```

4. Copy `.env.example` to `.env` and configure your database credentials:
```bash
cp .env.example .env
```

5. Run the SQL schema (see `database-schema.sql`)

### Development

Run in development mode with hot reload:
```bash
npm run dev
```

### Build & Production

Build the project:
```bash
npm run build
```

Run in production:
```bash
npm start
```

## API Endpoints

### Users
- `POST /api/users` - Create a new user (worker or business)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users

### Shifts
- `POST /api/shifts` - Create a new shift (business only)
- `GET /api/shifts` - Get all available shifts
- `GET /api/shifts/:id` - Get shift by ID
- `PUT /api/shifts/:id` - Update shift
- `DELETE /api/shifts/:id` - Delete shift

### Bookings
- `POST /api/bookings` - Create a booking (worker only)
- `GET /api/bookings/worker/:workerId` - Get worker's bookings
- `GET /api/bookings/shift/:shiftId` - Get shift's bookings
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

## Project Structure

```
backend/
  src/
    index.ts              # Application entry point
    app.ts                # Express app configuration
    config/
      database.ts         # Database connection
    routes/
      userRoutes.ts       # User endpoints
      shiftRoutes.ts      # Shift endpoints
      bookingRoutes.ts    # Booking endpoints
    controllers/
      userController.ts   # User request handlers
      shiftController.ts  # Shift request handlers
      bookingController.ts # Booking request handlers
    services/
      userService.ts      # User business logic
      shiftService.ts     # Shift business logic
      bookingService.ts   # Booking business logic
    models/
      userModel.ts        # User data model
      shiftModel.ts       # Shift data model
      bookingModel.ts     # Booking data model
    middleware/
      errorHandler.ts     # Error handling middleware
```

## Database Schema

### Users Table
- `id` - UUID primary key
- `name` - VARCHAR(255)
- `email` - VARCHAR(255) unique
- `role` - ENUM('worker', 'business')
- `created_at` - TIMESTAMP

### Shifts Table
- `id` - UUID primary key
- `business_id` - UUID foreign key
- `title` - VARCHAR(255)
- `location` - VARCHAR(255)
- `start_time` - TIMESTAMP
- `end_time` - TIMESTAMP
- `pay_rate` - DECIMAL(10,2)
- `created_at` - TIMESTAMP

### Bookings Table
- `id` - UUID primary key
- `shift_id` - UUID foreign key
- `worker_id` - UUID foreign key
- `status` - ENUM('pending', 'confirmed', 'cancelled')
- `created_at` - TIMESTAMP

## License

ISC
