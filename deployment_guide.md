# NYAI Deployment Guide (Free Tier) - Netlify Version

Follow these steps to deploy NYAI to the web for free using Netlify for the frontend.

## 1. Database: MongoDB Atlas (Free Shared Tier)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a **Shared Cluster** (free).
3. Create a **Database User** (username and password).
4. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
5. Get your **Connection String** (SRV) and replace `<password>` with your user password.

## 2. Backend: Render (Free Web Service)
1. Push your code to a **GitHub Repository**.
2. Log in to [Render](https://render.com/).
3. Click **New +** > **Web Service**.
4. Connect your NYAI repo.
5. **Configuration**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. **Environment Variables**:
   - `MONGODB_URI`: (Your MongoDB Atlas SRV)
   - `GROQ_API_KEY`: (Your Groq API key)
   - `JWT_SECRET`: (Any random long string)
   - `FRONTEND_URL`: (You will get this after Netlify deployment)
   - `NODE_ENV`: `production`

## 3. Frontend: Netlify (Free)
1. Log in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub repo.
4. **Configuration**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Environment Variables**:
   - Click **Add environment variables**.
   - `VITE_API_URL`: (Your Render Web Service URL, e.g., `https://nyai-backend.onrender.com`)
6. Click **Deploy site**.

## 4. Final Connection
1. Once Netlify is deployed, copy its URL (e.g., `https://nyai-frontend.netlify.app`).
2. Go back to your **Render Dashboard** and update the `FRONTEND_URL` environment variable with this URL.
3. This ensures CORS allows requests from your production frontend.

---

### ⚠️ Important: React Router Fix
Netlify needs a `_redirects` file to handle React routing. I have already created `client/public/_redirects` for you. This prevents 404 errors when refreshing pages.
