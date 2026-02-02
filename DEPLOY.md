# 🚀 AgentFi Deployment Guide

## 1. Prerequisites (Checked)
- **GitHub CLI (`gh`)**: ✅ Installed & Authenticated as `radebe49`.
- **Vercel CLI**: ❌ Not installed. (We will use Git + Vercel Web Dashboard instead, it's more stable).

## 2. Push Code to GitHub
*Run these commands in your terminal:*

```bash
# 1. Initialize Git in the project root
cd /Users/radebe49/agentfi
git init

# 2. Configure .gitignore (Crucial: Ignore keys!)
echo "node_modules
.next
.env
.DS_Store
wallet.key
broadcast/
cache/
out/
" > .gitignore

# 3. Create Repo & Push
git add .
git commit -m "Initial commit: AgentFi Production v1"
gh repo create agentfi --public --source=. --remote=origin --push
```

## 3. Deploy to Vercel (Web Dashboard)
*Since Vercel CLI is missing, use the web:*

1.  Go to **[vercel.com/new](https://vercel.com/new)**.
2.  Import the **`agentfi`** repository you just created.
3.  **Build Settings**:
    -   **Framework**: Next.js (Auto-detected).
    -   **Root Directory**: `app` (IMPORTANT: The Next.js app is in the `app/` subfolder, not root).
4.  **Environment Variables**:
    -   (None needed currently as config is public, but in future `TAVILY_API_KEY` should go here).
    -   *Wait, `TAVILY_API_KEY` is hardcoded in `verify/route.ts` for MVP. For production security, move it to ENV.*
5.  Click **Deploy**.

## 4. Post-Deployment
1.  **Get URL**: Vercel will give you `https://agentfi.vercel.app`.
2.  **Update Config**:
    -   Update `SKILL.md` and `install.sh` to point to the new Vercel URL instead of `localhost:3000`.
    -   Commit & Push updates.

---

## ⚡ Quick Install Vercel CLI (Optional)
If you prefer CLI deployment:
```bash
npm i -g vercel
vercel login
vercel link
vercel deploy --prod
```
