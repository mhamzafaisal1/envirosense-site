# EnviroSense site

Landing page for the EnviroSense research project, with a live demo wired to the model API.

- **Live demo:** calls `POST {NEXT_PUBLIC_API_URL}/predict` on the deployed FastAPI service
- **Results:** rendered from `lib/metrics.json`, which is copied from `envirosense-ml/models/metrics.json` after each training run
- **Paper:** put the PDF at `public/EnviroSense.pdf`

## Dev

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at a running API
npm install
npm run dev                  # http://localhost:3000
```

## Deploy (Vercel)

Import the repo in Vercel, set the env vars from `.env.example`, and deploy. There's no server code; the site is fully static.

After retraining the model: `cp ../Envirosense-ML/models/metrics.json lib/metrics.json`, commit, and push.
