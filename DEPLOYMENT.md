# LostMind AI Documentation - Deployment Guide

## 🚀 Complete Setup Guide for docs.lostmindai.com

This guide walks you through deploying your professional documentation site to Vercel with a custom domain.

## 📋 Prerequisites

- GitHub repository for this project
- Vercel account (free tier works)
- Access to your domain DNS settings for lostmindai.com

## 🎯 Step 1: Push to GitHub

1. **Initialize Git Repository**
   ```bash
   cd "/Users/sumitm1/Documents/New Ongoing Projects/LostMind AI - Documentation Site"
   git init
   git add .
   git commit -m "🚀 Initial commit: LostMind AI Documentation System

   - Next-Forge + Mintlify professional documentation
   - Auto-discovery of 12+ projects
   - Automated content extraction and generation
   - Daily sync automation via GitHub Actions
   - Ready for docs.lostmindai.com deployment"
   ```

2. **Create GitHub Repository**
   - Go to GitHub.com
   - Create new repository: `lostmind-ai-docs`
   - Set as public (for easier domain setup)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/[your-username]/lostmind-ai-docs.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `lostmind-ai-docs`

2. **Configure Build Settings**
   - **Root Directory**: `apps/docs`
   - **Build Command**: `mintlify build`
   - **Output Directory**: `_site`
   - **Install Command**: `pnpm install`

3. **Environment Variables** (if needed)
   - No environment variables required for basic setup

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project: No
# - Project name: lostmind-ai-docs
# - Directory: ./apps/docs
# - Override settings: Yes
#   - Build Command: mintlify build
#   - Output Directory: _site
```

## 🔧 Step 3: Configure Custom Domain

### 3.1 Add Domain in Vercel

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Domains**
3. Add domain: `docs.lostmindai.com`
4. Vercel will show DNS configuration needed

### 3.2 Configure DNS

Add the following DNS record to your domain:

```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
TTL: 300 (or Auto)
```

**Popular DNS Providers:**

- **Cloudflare**: DNS → Records → Add Record
- **GoDaddy**: DNS Management → Add CNAME
- **Namecheap**: Advanced DNS → Add New Record
- **Route 53**: Hosted Zone → Create Record

### 3.3 Verify Setup

1. Wait 5-10 minutes for DNS propagation
2. Visit `https://docs.lostmindai.com`
3. Verify SSL certificate is active (🔒 in browser)

## ⚡ Step 4: Test Automation

### 4.1 Test Project Discovery

```bash
# Test locally first
npm run docs:scan
npm run docs:extract

# Check that new projects are discovered
cat apps/docs/config/discovered-projects.json
```

### 4.2 Test GitHub Actions

1. Make a small change to any project
2. GitHub Actions will automatically:
   - Scan for changes daily at 6 AM UTC
   - Update documentation content
   - Trigger Vercel deployment

3. **Manual trigger**: Go to GitHub → Actions → "Update Documentation" → Run workflow

## 🎨 Step 5: Customize (Optional)

### Update Branding

Edit `apps/docs/mint.json`:

```json
{
  "name": "LostMind AI Documentation",
  "logo": {
    "dark": "/logo/lostmind-dark.svg",
    "light": "/logo/lostmind-light.svg"
  },
  "favicon": "/favicon.ico",
  "colors": {
    "primary": "#6366f1",
    "light": "#8b5cf6", 
    "dark": "#5b21b6"
  }
}
```

### Add Custom Logo

1. Add logo files to `apps/docs/logo/`
2. Update `mint.json` paths
3. Push changes to trigger rebuild

## 🔍 Step 6: Verify Complete Setup

### ✅ Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project deployed successfully  
- [ ] Custom domain `docs.lostmindai.com` resolving
- [ ] SSL certificate active (https://)
- [ ] All 12 projects showing in documentation
- [ ] Navigation menu working correctly
- [ ] Search functionality working
- [ ] GitHub Actions automation enabled
- [ ] Manual content update working

### 🧪 Test URLs

Visit these URLs to verify everything works:

- **Main Site**: https://docs.lostmindai.com
- **Main Platform**: https://docs.lostmindai.com/projects/lostmindai-turborepo/introduction
- **RAG Backend**: https://docs.lostmindai.com/projects/back-end-architecture-for-turborepo-with-rag-embeddings/introduction
- **Search**: Try searching for "turborepo" or "ai"

## 🛠️ Maintenance

### Daily Automation

The system automatically:
- Scans for new projects every day at 6 AM UTC
- Updates documentation for modified projects
- Deploys changes to production

### Manual Updates

Force update documentation:

```bash
# Run locally
npm run docs:update

# Or trigger GitHub Action manually
# GitHub → Actions → Update Documentation → Run workflow
```

### Adding New Projects

1. Add new project to `/Users/sumitm1/Documents/New Ongoing Projects/`
2. Include `README.md`, `CLAUDE.md`, or `docs/` folder
3. Wait for next automated scan, or run manual update

## 🎯 Expected Results

Once deployed, `docs.lostmindai.com` will provide:

- **Professional Documentation**: Similar to docs.stripe.com, docs.vercel.com
- **Auto-Discovery**: Automatically finds and documents your projects
- **Smart Organization**: Projects categorized by type and priority
- **Search**: Fast, intelligent search across all projects
- **Responsive**: Perfect on mobile, tablet, desktop
- **Fast Loading**: Edge-optimized for global performance

## 🔒 Security & Performance

### Built-in Security

- Automatic HTTPS via Vercel
- Security headers configured
- No exposed API keys or secrets

### Performance Features

- Edge deployment via Vercel CDN
- Static site generation for fast loading
- Optimized images and assets
- Automatic caching

## 🆘 Troubleshooting

### Common Issues

**Domain not resolving:**
- Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- Verify CNAME record is correct
- Wait up to 24 hours for full propagation

**Build failing:**
- Check build logs in Vercel dashboard
- Ensure `mintlify` is installed in devDependencies
- Verify `apps/docs` directory structure

**Content not updating:**
- Check GitHub Actions logs
- Verify file permissions for project directories
- Run manual update to test

**Styling issues:**
- Clear browser cache
- Check `mint.json` configuration
- Verify all required assets exist

### Getting Help

- **Vercel Issues**: [vercel.com/docs](https://vercel.com/docs)
- **Mintlify Issues**: [mintlify.com/docs](https://mintlify.com/docs)
- **DNS Issues**: Contact your domain provider support

---

## 🎉 Success!

Your documentation site is now live at `https://docs.lostmindai.com` with:

✅ **Professional Design** - Enterprise-grade documentation  
✅ **Automatic Updates** - Daily sync with your projects  
✅ **Custom Domain** - Professional branding  
✅ **Global Performance** - Fast loading worldwide  
✅ **Zero Maintenance** - Fully automated system  

Your documentation will now scale automatically as you add new projects to your workspace!