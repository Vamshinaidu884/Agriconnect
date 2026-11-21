# Deployment Guide

## Recommended hosting

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 1. Create MongoDB Atlas

1. Create a free Atlas project and cluster.
2. Create a database user with read/write access.
3. In Network Access, allow `0.0.0.0/0` for Render.
4. Copy the connection string and replace `<username>`, `<password>`, and the database name:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/agrimatch?retryWrites=true&w=majority
```

Do not commit this value. Enter it only in Render environment variables.

## 2. Deploy the backend to Render

1. Push this repository to GitHub.
2. In Render, select **New > Blueprint** and choose this repository.
3. Render will read `render.yaml`.
4. Enter `MONGODB_URI` and `JWT_SECRET`.
5. Enter optional Cloudinary, weather, plant, and email secrets only if those features are used.
6. Deploy and verify:

```text
https://YOUR-SERVICE.onrender.com/api/health
```

## 3. Deploy the frontend to Vercel

1. Import the GitHub repository in Vercel.
2. Keep the framework preset as Vite.
3. Add this environment variable:

```text
VITE_API_URL=https://YOUR-SERVICE.onrender.com/api
```

4. Deploy and copy the production Vercel URL.

## 4. Connect frontend and backend

In Render, set `CLIENT_URL` to the Vercel production URL:

```text
https://YOUR-PROJECT.vercel.app
```

Multiple origins can be comma-separated:

```text
https://YOUR-PROJECT.vercel.app,https://another-preview.vercel.app
```

Redeploy the backend after changing `CLIENT_URL`, and redeploy the frontend after changing `VITE_API_URL`.
