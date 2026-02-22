# Deploying HealixRefer to Render

Follow these steps to deploy your application as a "Web Service" on [Render](https://render.com).

## 1. Prepare your GitHub Repository
Make sure all your changes are pushed to your GitHub repository.

## 2. Create a Web Service on Render
1.  Log in to [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the following settings:
    - **Name**: `healix-refer`
    - **Region**: Select the one closest to you.
    - **Branch**: `main`
    - **Root Directory**: Leave blank (I have updated the main root `package.json` to handle this).
    - **Runtime**: `Node`
    - **Build Command**: `npm run render-build`
    - **Start Command**: `npm start`

## 3. Configure Environment Variables
Navigate to the **Environment** tab in your Render service and add the following:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB connection string (Atlas or other) |
| `JWT_SECRET` | A secure random string for signing tokens |
| `GROQ_API_KEY` | Your Groq AI API Key |
| `VITE_API_URL` | Leave blank (it will use relative paths) |

## 4. Database Connection
> [!IMPORTANT]
> If you are using MongoDB Atlas, make sure you have "Allowed Access from Anywhere" (IP `0.0.0.0/0`) or added Render's IP to your whitelist in the Atlas dashboard.

## 5. Deploy
Click **Create Web Service**. Render will now:
1.  Install root, server, and client dependencies.
2.  Build the React frontend.
3.  Start the Express server, which will serve the frontend on your Render URL.

Your app will be live at `https://healix-refer.onrender.com` (or similar).
