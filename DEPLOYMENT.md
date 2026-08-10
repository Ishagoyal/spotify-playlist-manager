# Deployment notes

## Render API service

Create a **Web Service** with `server` as its Root Directory.

- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/`

Set these environment variables in Render:

```text
MONGO_URI=<copy the current URI from MongoDB Atlas Connect>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
SPOTIFY_CLIENT_ID=<spotify client id>
SPOTIFY_CLIENT_SECRET=<spotify client secret>
SPOTIFY_REDIRECT_URI=https://<your-render-api>.onrender.com/callback
```

`querySrv ENOTFOUND _mongodb._tcp.cluster0.qgch3pe.mongodb.net` means the Atlas hostname embedded in `MONGO_URI` does not exist in public DNS. Get a new URI from **Atlas → Database → Connect → Drivers**, replace `MONGO_URI` in Render, and redeploy. Network Access/IP allow-list errors occur later and have a different message; they are not the cause of this error.

## Vercel client

The client is a separate Vite app. In Vercel, set the project **Root Directory** to `client`, use `npm run build`, and set:

```text
VITE_BACKEND_URL=https://<your-render-api>.onrender.com
```

Redeploy after changing a `VITE_` variable because Vite embeds it at build time.

`404: NOT_FOUND`, `Code: DEPLOYMENT_NOT_FOUND`, and an ID such as `bom1::...` come from Vercel—not Render. It normally means the URL targets a removed/invalid Vercel deployment or the custom domain is not attached to the current project. Open the current deployment from the Vercel dashboard, use its generated URL, then reconnect the custom domain if applicable. If the repository root is selected instead of `client`, Vercel will not use `client/vercel.json` or the client build settings.
