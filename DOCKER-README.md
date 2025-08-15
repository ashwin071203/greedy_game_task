# Todo Dashboard - Docker Setup

This guide explains how to set up and run the Todo Dashboard application using Docker.

## Prerequisites

- Docker (v20.10.0 or higher)
- Docker Compose (v2.0.0 or higher)
- Node.js (v18 or higher) - for local development without Docker

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL='https://szmojyniradfqhprpnes.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bW9qeW5pcmFkZnFocHJwbmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjg3MjYsImV4cCI6MjA3MDg0NDcyNn0.GTMeYSqQtKPOIOPUdh12AO8ucEI_1Nwl90wM2pIVtEc
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Building and Running with Docker Compose

1. **Build the Docker image**
   ```bash
   docker-compose build
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **View the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the application**
   ```bash
   docker-compose down
   ```

## Development with Docker

For development, you might want to use Docker with hot-reloading:

1. **Start the development server**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Install new dependencies**
   If you add new dependencies, you'll need to rebuild the container:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Production Deployment

For production deployment, consider the following:

1. Set up a reverse proxy (like Nginx) in front of the application
2. Use environment-specific configuration files
3. Set up proper SSL/TLS certificates
4. Configure proper logging and monitoring

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Ensure no other services are running on port 3000
   - Or change the port mapping in `docker-compose.yml`

2. **Environment variables not loading**
   - Make sure the `.env.local` file exists in the root directory
   - Check for typos in variable names

3. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Check for network connectivity issues

### Viewing Logs

```bash
# View logs from all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for a specific service
docker-compose logs web
```

## Cleaning Up

To remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

To remove all unused containers, networks, and images:

```bash
docker system prune -a
```
