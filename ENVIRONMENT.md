# Environment Configuration Guide

This document explains how to use the multi-environment setup for the Walleta backend.

## Available Environments

- **Production** - Uses `.env.production` with production database
- **UAT** - Uses `.env.uat` with UAT database
- **Development** - Uses `.env` (default) for local development

## Quick Start

### Development (Default)
```bash
npm run dev
```

### UAT Environment
```bash
npm run dev:uat
```

### Production Environment
```bash
npm run dev:prod
```

## Available Scripts

### Development Server
- `npm run dev` - Run with default `.env`
- `npm run dev:uat` - Run with UAT environment
- `npm run dev:prod` - Run with production environment

### Production Server (Built)
- `npm run start` - Run built app with default `.env`
- `npm run start:uat` - Run built app with UAT environment
- `npm run start:prod` - Run built app with production environment

### Database Migrations
- `npm run prisma:migrate` - Run migrations with default `.env`
- `npm run prisma:migrate:uat` - Run migrations on UAT database
- `npm run prisma:migrate:prod` - Deploy migrations to production database

### Prisma Studio
- `npm run prisma:studio` - Open Prisma Studio with default `.env`
- `npm run prisma:studio:uat` - Open Prisma Studio for UAT database
- `npm run prisma:studio:prod` - Open Prisma Studio for production database

## Environment Files

### `.env.production`
Contains production database credentials and configuration. **DO NOT commit to git.**

### `.env.uat`
Contains UAT database credentials and configuration. **DO NOT commit to git.**

You need to update this file with your actual UAT database credentials:
```env
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_uat_jwt_secret
```

### `.env.example`
Template file showing all required environment variables. This file is safe to commit.

### `.env` (optional)
Your local development environment. **DO NOT commit to git.**

## Setting Up UAT Database

1. Open `.env.uat` file
2. Replace the placeholder values with your actual UAT database credentials:
   - `DATABASE_URL` - Your UAT database connection string
   - `DIRECT_URL` - Direct connection for Prisma migrations
   - `JWT_SECRET` - A unique secret key for UAT (different from production)

## Security Notes

⚠️ **Important:**
- Never commit `.env`, `.env.production`, or `.env.uat` to version control
- Use different `JWT_SECRET` values for each environment
- Consider rotating your production database password after this setup
- For deployment platforms (Railway, Render, etc.), set environment variables in their dashboard

## Deployment

When deploying to production platforms:

1. **Railway/Render/Vercel**: Set environment variables in the platform's dashboard
2. **Manual deployment**: Use the appropriate start script:
   ```bash
   npm run build
   npm run start:prod
   ```

## Troubleshooting

### "Missing env var" error
Make sure all required variables are set in your environment file:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Database connection fails
1. Verify your database credentials are correct
2. Check that your database server is running
3. Ensure your IP is whitelisted (for cloud databases)
