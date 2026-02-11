# 🚀 Final Deployment Steps: Dashboard & Database

You have successfully deployed:
1.  **PostgreSQL** (Database)
2.  **Voice Agent** (Python Backend)

Here is exactly how to finish the system by deploying the **Dashboard (The User Interface)** and connecting everything.

---

## Step 1: Create the Dashboard Service
1.  In Coolify, go to your Project.
2.  Click **"+ New"** -> **"Application"** -> **"Public Repository"**.
3.  Paste your GitHub URL: `https://github.com/toprmrproducer/LiveKit-Vobiz-Outbound`
4.  Click **"Check Repository"**.
5.  **Build Pack:** Select `Docker` (or `Dockerfile`).
6.  Click **"Continue"**.

## Step 2: Configure the Dashboard (CRITICAL)
Before you click "Deploy", you MUST change these settings in the **Configuration** tab:

1.  **Name:** Change to `dashboard-app` (Optional, but helpful).
2.  **Base Directory:** Change `/` to `/dashboard`
3.  **Dockerfile Location:** Change `/Dockerfile` to `/dashboard/Dockerfile`
4.  **Click "Save"** (Top button).

## Step 3: Add Environment Variables
1.  Go to the **"Environment Variables"** tab.
2.  Switch to **"Developer View"** (Top right toggle).
3.  Paste the following (Update the values with your real keys!):
    ```bash
    LIVEKIT_API_KEY=your_key
    LIVEKIT_API_SECRET=your_secret
    LIVEKIT_URL=wss://your-url.livekit.cloud
    VOBIZ_SIP_TRUNK_ID=ST_...

    # DATABASE_URL: Use the INTERNAL connection string from Postgres service!
    # Example: postgresql://vobiz:vobizpassword@vobiz-db:5432/vobiz_db
    DATABASE_URL=postgresql://vobiz:vobizpassword@vobiz-db:5432/vobiz_db

    # WEBHOOK_URL: Points to itself (localhost)
    WEBHOOK_URL=http://localhost:3000/api/hooks/transcript
    ```
4.  **Click "Save".**

## Step 4: Deploy
1.  Go back to the **Configuration** tab.
2.  Click **"Deploy"** (Top right).
3.  Wait for the Green Dot (Running).

---

## Step 5: Run Database Migrations (The Final Piece)
Your database is currently empty. We need to create the tables.

1.  While in the **Dashboard Service**, click the **"Terminal"** (or **"Console"**) tab.
2.  Type this command in the black box and press Enter:
    ```bash
    npx prisma migrate deploy
    ```
3.  You should see success messages like:
    > "Datasource: postgresql..."
    > "Applying migration..."
    > "All migrations have been successfully applied."

---

## Step 6: Open Your App!
1.  Go to the **"Links"** tab (or look under "Domains" in Configuration).
2.  Click the generated URL (e.g., `http://...sslip.io`).
3.  **You are live!** 🎉

---

### ⚠️ Post-Deployment Check
If calls are made but transcripts don't show up:
1.  Go to your **Voice Agent Service**.
2.  Check its `WEBHOOK_URL` environment variable.
3.  It must point to the Dashboard's **Internal DNS Name**:
    *   Example: `http://dashboard-app:3000/api/hooks/transcript`
    *   (You can find the "Internal Name" in the Dashboard's setting page).
