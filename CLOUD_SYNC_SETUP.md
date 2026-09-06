# Shared data sync (all devices)

The app stores chanda/expenses in a shared cloud store so every committee member sees the same data.

## One-time Vercel setup

1. Open [Environment Variables](https://vercel.com/pranshu1009s-projects/ganapati-2026/settings/environment-variables)
2. Add:
   - **Key:** `GITHUB_TOKEN`
   - **Value:** a GitHub token with `gist` scope  
     Create one at: https://github.com/settings/tokens/new  
     (classic token → enable **gist**)
3. Select **Production**, **Preview**, **Development**
4. Save → go to **Deployments** → **Redeploy** the latest deployment

## After deploy

1. On the **phone that already has data**, open the site → login → Dashboard  
2. Tap **Upload this phone’s data**  
3. Other devices will see the same chanda/expenses after refresh (auto-sync every few seconds)

## Check

Dashboard should show: **Synced across all devices**
