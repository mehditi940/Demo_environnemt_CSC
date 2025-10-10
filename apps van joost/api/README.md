# AR Viewer API

## Description

A comprehensive RESTful API for the AR Viewer medical visualization platform. Built with Express.js, Prisma ORM, and PostgreSQL, providing real-time collaboration features, patient data management, and 3D model handling for HoloLens integration.

##  Architecture

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Real-time**: Socket.IO for live collaboration
- **File Handling**: Multer for 3D model uploads
- **Validation**: Zod schema validation

##  Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd AR-Viewer/apps/api
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL (Docker)
   cd ../../docker
   docker-compose up -d postgres
   
   # Or use local PostgreSQL
   createdb arviewer
   ```

4. **Run Migrations**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

##  API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `PUT /auth/account/:id` - Update user
- `DELETE /auth/account/:id` - Delete user

### Patients
- `GET /patient/` - List all patients
- `POST /patient/` - Create patient
- `GET /patient/:id` - Get patient by ID
- `PUT /patient/:id` - Update patient
- `DELETE /patient/:id` - Delete patient

### Rooms
- `GET /room/` - List all rooms
- `POST /room/` - Create room
- `GET /room/:id` - Get room by ID
- `PUT /room/:id` - Update room
- `DELETE /room/:id` - Delete room

### Connections
- `POST /connection/` - Create connection
- `GET /connection/:id` - Get connection

### WebSocket
- Socket.IO endpoint for real-time communication
- Room-based collaboration
- File sharing and synchronization

##  Development

### Commands

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start           # Start production build
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues

# Database
npx prisma studio   # Open database GUI
npx prisma migrate dev    # Create migration
npx prisma generate      # Generate client
npx prisma db push        # Push schema changes
npx prisma db seed        # Seed database
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/arviewer"
DB_FILE_NAME="database.sqlite"

# Application
PORT=3001
NODE_ENV=development
API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"

# Security
JWT_SECRET="your-secret-key"
AUTH_TOKEN="test-auth-token"

# Storage
STORAGE_PATH="./storage"

# WebRTC
STUN_SERVERS="stun:stun.l.google.com:19302"
```

##  Database Schema

### Models

- **User**: User management with roles (Admin, Surgeon, User, System)
- **Patient**: Patient data with unique identifiers
- **Room**: Collaboration rooms with patient associations
- **Connection**: Real-time connection tracking
- **Model**: 3D model storage with base64 encoding
- **UserRoom**: Many-to-many relationship for room access

### Relationships

```prisma
User 1--* Room (creator)
User *--* Room (via UserRoom)
Room 1--* Model
Room 1--* Connection
Patient 1--* Room
```

##  Security

### Authentication
- JWT tokens with expiration
- Role-based access control
- Password hashing with salt
- Session management

### Authorization
- Admin: Full access
- Surgeon: Patient and room management
- User: Limited access
- System: Internal operations

### Data Protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- File upload restrictions
- Rate limiting on sensitive endpoints

##  Monitoring

### Health Checks
- `GET /health` - Application health
- Database connection monitoring
- Memory and CPU usage tracking

### Logging
- Query logging in development
- Error tracking and reporting
- Performance monitoring
- Security event logging

##  Testing

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@arviewer.com", "password": "admin123"}'

# Test protected endpoint
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Database Testing
```bash
# Test database connection
npx prisma db execute --stdin --url "$DATABASE_URL" < /dev/null

# View database in Prisma Studio
npx prisma studio
```

##  Production Deployment

### Docker Deployment
```bash
# Build and start
cd ../../docker
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

### Environment Configuration
- Use production database URL
- Set secure JWT secrets
- Configure proper CORS settings
- Enable SSL/TLS

##  Documentation

- **[Development Setup](../docs/DEVELOPMENT_SETUP.md)** - Complete setup guide
- **[Prisma Workflow](../docs/PRISMA_WORKFLOW.md)** - Database management
- **[Production Deployment](../../docker/PRODUCTION_DEPLOYMENT.md)** - Production setup
- **[API Documentation](http://localhost:3001/api-docs)** - Swagger documentation

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Project Structure

```
apps/api/
├── prisma/              # Prisma schema and migrations
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── routes/             # API route handlers
│   ├── auth/          # Authentication routes
│   ├── patient/       # Patient management
│   ├── room/          # Room collaboration
│   └── connection/    # Connection management
├── services/          # Business logic
│   ├── passport.ts    # Authentication strategies
│   └── authorizationMiddleware.ts
├── schemas/           # Type definitions and validation
│   ├── db.ts         # Prisma client
│   ├── user.ts       # User types
│   ├── patient.ts    # Patient types
│   ├── room.ts       # Room types
│   └── connection.ts # Connection types
├── socket/            # Socket.IO handlers
│   ├── socketHandler.ts
│   └── messageHandlers/
├── utils/             # Utility functions
│   ├── debugLogger.ts
│   ├── passwordHash.ts
│   └── swaggerJs.ts
├── storage/           # File storage directory
└── index.ts          # Application entry point
```

##  Advanced Configuration

### Database Connection Pooling

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20'
    }
  },
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error']
})
```

### Performance Monitoring

```typescript
// Enable query logging
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn(`Slow query: ${e.duration}ms - ${e.query}`)
  }
})
```

### Error Handling

```typescript
// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Duplicate entry' })
  }
  if (error.code === 'P2003') {
    return res.status(400).json({ message: 'Invalid reference' })
  }
  res.status(500).json({ message: 'Internal server error' })
})
```
