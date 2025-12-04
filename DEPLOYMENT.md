# ☁️ Cloud Deployment Guide

## Supported Platforms

The MCP Connector Awareness Engine supports deployment to:

- **Railway** (Recommended - Easy setup, auto-scaling)
- **Render** (Free tier available)
- **Fly.io** (Global edge deployment)
- **Vercel** (Serverless option)
- **Any Docker host** (Self-hosted)

---

## 🚄 Railway Deployment (Recommended)

### Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/mcp-awareness)

### Manual Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Set environment variables
railway variables set ASANA_PAT="your_token_here"
railway variables set LINEAR_API_KEY="your_key_here"
railway variables set GITHUB_TOKEN="your_token_here"
railway variables set NOTION_API_KEY="your_key_here"

# Deploy
railway up
```

**Cost**: ~$5/month for starter plan

---

## 🎨 Render Deployment

### Quick Deploy

1. Fork this repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml`
6. Add environment variables in dashboard
7. Deploy!

### Manual Setup

```bash
# Create render.yaml is already included
# Just connect your repo to Render
```

**Cost**: Free tier available (suspends after inactivity)

---

## 🪁 Fly.io Deployment

### Setup

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app (fly.toml already configured)
fly launch

# Set secrets
fly secrets set ASANA_PAT="your_token_here"
fly secrets set LINEAR_API_KEY="your_key_here"
fly secrets set GITHUB_TOKEN="your_token_here"
fly secrets set NOTION_API_KEY="your_key_here"

# Deploy
fly deploy
```

**Cost**: ~$3/month for 1 VM

---

## ▲ Vercel Deployment (Serverless)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add ASANA_PAT
vercel env add LINEAR_API_KEY
vercel env add GITHUB_TOKEN
vercel env add NOTION_API_KEY
```

**Note**: Serverless has limitations for long-running processes. Best for API endpoints.

**Cost**: Free tier available

---

## 🐳 Docker Self-Hosted

### Using Docker Compose

```bash
# Clone repository
git clone https://github.com/GlacierEQ/mcp-connector-awareness-engine.git
cd mcp-connector-awareness-engine

# Create .env file
cp .env.example .env
# Edit .env with your tokens

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Direct Docker Run

```bash
# Build image
docker build -t mcp-awareness .

# Run container
docker run -d \
  --name mcp-awareness-engine \
  -e ASANA_PAT="your_token" \
  -e LINEAR_API_KEY="your_key" \
  -e GITHUB_TOKEN="your_token" \
  -e NOTION_API_KEY="your_key" \
  -v $(pwd)/data:/app/data \
  -p 3000:3000 \
  mcp-awareness
```

**Cost**: Your hosting costs (VPS ~$5-20/month)

---

## 🔄 GitHub Actions Auto-Deploy

The repository includes `.github/workflows/deploy.yml` that:

- ✅ Builds on every push to `main`
- ✅ Runs tests
- ✅ Builds Docker image
- ✅ Pushes to GitHub Container Registry
- ✅ Auto-deploys to Railway (if configured)

### Setup GitHub Actions

1. Go to repository Settings → Secrets
2. Add secrets:
   - `RAILWAY_TOKEN` (if using Railway)
   - `RENDER_API_KEY` (if using Render)
   - API tokens are NOT needed here (set in deployment platform)

---

## 🔐 Environment Variables

Required for all platforms:

```bash
ASANA_PAT=your_asana_personal_access_token
LINEAR_API_KEY=your_linear_api_key
GITHUB_TOKEN=your_github_token
NOTION_API_KEY=your_notion_integration_token
```

Optional configuration:

```bash
HEALTH_CHECK_INTERVAL_MINUTES=30
AUTO_RUN_ON_START=true
VERIFY_INTERVAL_HOURS=24
REQUIRE_PAGINATION_COMPLETION=true
AUTO_RESOLVE_IDS=true
ALERT_ON_FAILURE=true
CREATE_LINEAR_ISSUES_ON_FAILURE=true
```

---

## 📊 Monitoring

All platforms provide:
- Health check endpoint: `/health`
- Logs via platform dashboard
- Automatic restarts on failure

Additionally:
- Linear issues created on connector failures
- Notion dashboard updated with health status
- GitHub Actions deployment notifications

---

## 🚀 Deployment Checklist

- [ ] Choose deployment platform
- [ ] Set all environment variables
- [ ] Test health endpoint
- [ ] Verify calibration runs successfully
- [ ] Check logs for errors
- [ ] Confirm Linear issue creation (if enabled)
- [ ] Verify Notion dashboard updates
- [ ] Set up monitoring alerts

---

## 🆘 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs mcp-awareness-engine

# Verify environment variables
docker exec mcp-awareness-engine env
```

### Calibration fails
```bash
# Run manual calibration
docker exec -it mcp-awareness-engine npm run calibrate

# Check token validity
# Verify API tokens haven't expired
```

### Health check failing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Check connector status
docker exec -it mcp-awareness-engine npm run health-check
```

---

## 📈 Scaling

For high-traffic scenarios:

1. **Horizontal scaling**: Deploy multiple instances behind load balancer
2. **Shared state**: Use Redis for calibration state
3. **Database**: Migrate from SQLite to PostgreSQL
4. **Queue**: Add message queue for async operations

Contact for enterprise deployment support.

---

## 🔗 Platform Links

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com/)
