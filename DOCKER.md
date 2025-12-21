# Docker Deployment Guide

This guide explains how to build and run the Invent Alliance Limited website using Docker.

## Prerequisites

- Docker installed (version 20.10 or later)
- Docker Compose installed (version 2.0 or later)
- `.env.local` file with your environment variables

## Quick Start

### Production Build

1. **Create `.env.local` file** (if not already created):
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   CONTACT_TO_EMAIL=contact@inventallianceco.com,contact@patrickogbonna.com
   ACADEMY_TO_EMAIL=academy@inventallianceco.com,contact@patrickogbonna.com
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Access the website**:
   - Open http://localhost:3000 in your browser

### Development Mode

For development with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

## Docker Commands

### Build the image:
```bash
docker build -t ial-website .
```

### Run the container:
```bash
docker run -p 3000:3000 --env-file .env.local ial-website
```

### Stop the container:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f
```

### Rebuild after changes:
```bash
docker-compose up -d --build
```

## Production Deployment

### Using Docker Compose (Recommended)

1. **Update environment variables** in `docker-compose.yml` or use `.env.local`
2. **Build and start**:
   ```bash
   docker-compose up -d --build
   ```

### Using Docker directly

1. **Build the image**:
   ```bash
   docker build -t ial-website:latest .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name ial-website \
     -p 3000:3000 \
     --env-file .env.local \
     --restart unless-stopped \
     ial-website:latest
   ```

## Environment Variables

The following environment variables are required:

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (usually 587)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password/App Password
- `CONTACT_TO_EMAIL` - Comma-separated contact email addresses
- `ACADEMY_TO_EMAIL` - Comma-separated academy registration email addresses

## Health Check

The container includes a health check that verifies the application is running:

```bash
docker ps
```

Look for the "healthy" status in the STATUS column.

## Troubleshooting

### Container won't start:
```bash
docker-compose logs web
```

### Check container status:
```bash
docker-compose ps
```

### Restart the container:
```bash
docker-compose restart
```

### Remove everything and start fresh:
```bash
docker-compose down -v
docker-compose up -d --build
```

## Production Considerations

1. **Use a reverse proxy** (nginx, Traefik) in front of the container
2. **Set up SSL/TLS** certificates
3. **Configure proper logging** and monitoring
4. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

## Security Notes

- Never commit `.env.local` to version control
- Use Docker secrets or environment variables for sensitive data
- Run containers as non-root user (already configured)
- Keep Docker and images updated
- Use specific image tags instead of `latest` in production

