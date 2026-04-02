# HealthAI Deployment Guide

## Overview

This guide covers deploying HealthAI to production environments. The application consists of two components:
1. **Frontend**: Next.js 16 application (can be deployed to Vercel, Netlify, AWS, etc.)
2. **Backend**: Python FastAPI application (can be deployed to Heroku, AWS, GCP, Azure, etc.)

## Deployment Options

### Option 1: Vercel (Recommended for Frontend) + Heroku (Backend)

#### Step 1: Deploy Backend to Heroku

1. **Create Heroku Account**
   - Sign up at https://www.heroku.com

2. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh

   # Windows
   Download installer from https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Create Procfile**
   ```bash
   echo "web: cd backend && pip install -r requirements.txt && python main.py" > Procfile
   ```

4. **Create requirements.txt in backend** (already done)

5. **Initialize Git and Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"

   heroku login
   heroku create your-app-name-backend
   git push heroku main
   ```

6. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY="your-secret-key-here"
   ```

7. **Note Backend URL** (e.g., `https://your-app-name-backend.herokuapp.com`)

#### Step 2: Deploy Frontend to Vercel

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Visit https://vercel.com
   - Import project from GitHub

2. **Configure Environment Variables**
   ```
   BACKEND_URL=https://your-app-name-backend.herokuapp.com
   ```

3. **Deploy**
   - Vercel automatically deploys on push to main branch

### Option 2: AWS (Both Frontend + Backend)

#### Frontend on AWS Amplify
```bash
npm install -g @aws-amplify/cli
amplify init
amplify publish
```

#### Backend on AWS EC2
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Python and dependencies
sudo yum install python3 python3-venv python3-pip
cd /app
git clone your-repository
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install and start Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### Option 3: Docker Containerization

#### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["python", "main.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=healthai
      - POSTGRES_USER=healthai
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Database Integration (Production)

### Replace In-Memory Data with PostgreSQL

1. **Install SQLAlchemy**
   ```bash
   pip install sqlalchemy psycopg2
   ```

2. **Update backend/main.py**
   ```python
   from sqlalchemy import create_engine
   from sqlalchemy.orm import sessionmaker

   DATABASE_URL = "postgresql://user:password@localhost/healthai"
   engine = create_engine(DATABASE_URL)
   SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
   ```

3. **Create Models**
   ```python
   from sqlalchemy import Column, Integer, String, Float, DateTime
   from sqlalchemy.ext.declarative import declarative_base

   Base = declarative_base()

   class User(Base):
       __tablename__ = "users"
       id = Column(Integer, primary_key=True)
       email = Column(String, unique=True)
       password_hash = Column(String)

   class Prediction(Base):
       __tablename__ = "predictions"
       id = Column(Integer, primary_key=True)
       user_id = Column(Integer)
       risk_score = Column(Float)
       created_at = Column(DateTime)
   ```

## Production Checklist

### Security
- [ ] Change `SECRET_KEY` to a strong, random value
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable CORS only for your frontend domain
- [ ] Rotate API keys regularly
- [ ] Use environment variables for all secrets
- [ ] Implement rate limiting
- [ ] Set up CSRF protection

### Performance
- [ ] Enable caching headers
- [ ] Set up CDN for static assets
- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Set up database indexes
- [ ] Monitor API response times
- [ ] Implement request/response pagination

### Monitoring & Logging
- [ ] Set up error tracking (Sentry)
- [ ] Enable application logging
- [ ] Set up performance monitoring
- [ ] Create uptime monitoring
- [ ] Set up alerting for failures
- [ ] Monitor database performance

### Compliance & Data
- [ ] Enable HIPAA compliance (if applicable)
- [ ] Implement audit logging
- [ ] Set up data backup strategy
- [ ] Test disaster recovery
- [ ] Document data retention policies
- [ ] Set up regular security audits

## Environment Variables (Production)

```bash
# Backend
SECRET_KEY=your-production-secret-key
BACKEND_URL=https://your-domain.com/api
DATABASE_URL=postgresql://user:pass@host/db
ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_BACKEND_URL=https://your-domain.com/api
ENVIRONMENT=production
```

## Scaling Considerations

### Horizontal Scaling
1. **Load Balancer** (Nginx, HAProxy, ALB)
   - Distribute traffic across multiple instances
   - Session sticky routing for stateless design

2. **Multiple Backend Instances**
   ```bash
   # Use Gunicorn with multiple workers
   gunicorn -w 8 -b 0.0.0.0:8000 main:app
   ```

3. **Multiple Frontend Instances**
   - Deploy to multiple regions
   - Use global CDN

### Database Scaling
1. **Read Replicas** for heavy read workloads
2. **Connection Pooling** (PgBouncer)
3. **Sharding** for very large datasets

### Caching Layer
1. **Redis** for session and prediction caching
   ```python
   import redis
   cache = redis.Redis(host='localhost', port=6379)
   ```

2. **CDN** for static assets and API responses

## Troubleshooting Deployment

### Application Won't Start
```bash
# Check logs
heroku logs --tail
# or for local Docker
docker logs container-name
```

### Database Connection Issues
```bash
# Verify credentials
psql -h hostname -U username -d database
# Check connection string format
postgresql://user:password@host:5432/dbname
```

### Slow Performance
```bash
# Monitor API endpoints
# Use APM tools (DataDog, New Relic, Elastic APM)
# Profile Python code with cProfile
python -m cProfile main.py
```

### CORS Errors
```python
# Update CORS settings in backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## SSL/TLS Certificate

### Using Let's Encrypt (Free)
```bash
# On your server
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### Using AWS Certificate Manager (Free)
- Request certificate in ACM
- Validate domain ownership
- Attach to ALB/CloudFront

## Database Backup Strategy

### Automated Backups
```bash
# PostgreSQL automated backup
pg_dump -h localhost -U user -d healthai > backup.sql

# Schedule with cron
0 2 * * * pg_dump -h localhost -U user -d healthai > /backups/healthai-$(date +\%Y\%m\%d).sql
```

### AWS RDS Automatic Backups
- Enable automatic backups (7-35 days retention)
- Create manual snapshots before major changes
- Test restore procedures regularly

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      
      - name: Build and test
        run: |
          npm ci
          npm run build
          npm run test
      
      - name: Deploy to production
        run: |
          # Deploy commands here
```

## Post-Deployment

1. **Verify Deployment**
   - Test all endpoints
   - Check frontend/backend connectivity
   - Verify authentication flow
   - Test data persistence

2. **Monitor Metrics**
   - API response times
   - Error rates
   - User activity
   - Database performance

3. **Set Up Alerts**
   - High error rates
   - Service unavailability
   - Database issues
   - Unusual traffic patterns

4. **Document Runbook**
   - Incident response procedures
   - Rollback procedures
   - Escalation contacts
   - Known issues and workarounds

## Support & Updates

- Monitor security advisories for dependencies
- Schedule regular dependency updates
- Plan major version upgrades
- Maintain documentation
- Regular security audits
- Performance optimization reviews

For detailed deployment instructions for your specific platform, refer to:
- Vercel: https://vercel.com/docs/deployments
- Heroku: https://devcenter.heroku.com/
- AWS: https://aws.amazon.com/getting-started/
- GCP: https://cloud.google.com/docs
- Azure: https://docs.microsoft.com/azure/
