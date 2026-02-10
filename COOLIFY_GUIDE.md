# Deployment Guide: Using Coolify (The Easy Way)

Since you are using **Coolify** on your KVM VPS, deployment is much simpler than manual Docker commands. Coolify will manage everything for you, similar to Vercel/Heroku.

## 1. Prerequisites
-   **Coolify Installed:** You said you have "OS with panel". Ensure you can log into your Coolify dashboard (usually `http://<your-ip>:3000` or `http://coolify...`).
-   **GitHub Connected:**
    1.  Go to Coolify -> **Sources**.
    2.  Add "GitHub" (or "Public Repository" if public).
    3.  Select this repository (`LiveKit-Vobiz-Outbound`).

---

## 2. Setting Up The Database (PostgreSQL)
First, we need the database running so other services can connect to it.

1.  **Project:** Go to your Project in Coolify (or create one).
2.  **Add Resource:** Click "+ New".
3.  **Database:** Select **PostgreSQL**.
4.  **Configuration:**
    -   Name: `vobiz-db`
    -   User: `vobiz`
    -   Password: `vobizpassword`
    -   Database Name: `vobiz_db`
    -   *Make sure these match your `.env` variables!*
5.  **Start:** Click "Start".
6.  **Internal URL:** Copy the connection string. It usually looks like:
    `postgresql://vobiz:vobizpassword@vobiz-db:5432/vobiz_db`
    *(Use the **Internal** Network URL since all services are in Coolify).*

---

## 3. Setting Up The Dashboard (Frontend + API)
This is your Next.js website.

1.  **Add Resource:** Click "+ New" -> "Application" -> "Public Repository" (or GitHub App).
2.  **Select Repo:** Choose `LiveKit-Vobiz-Outbound`.
3.  **Configuration:**
    -   **Base Directory:** `/dashboard` (Important! This tells Coolify the code is in a subfolder).
    -   **Build Pack:** `Docker` (It will use the `Dockerfile` I just added).
    -   **Environment Variables:** Add these keys:
        -   `DATABASE_URL`: (Paste the Internal Database URL from Step 2)
        -   `LIVEKIT_API_KEY`: ...
        -   `LIVEKIT_API_SECRET`: ...
        -   `LIVEKIT_URL`: ...
        -   `VOBIZ_SIP_TRUNK_ID`: ...
4.  **Start:** Click "Deploy".
5.  **Domain:** Coolify usually assigns a random domain (e.g., `dashboard.uuid.coolify.iop`). You can add your own custom domain in settings.

**Running Migrations (Database Setup):**
Once deployed, go to the Service -> **Terminal/Console** (in Coolify) and run:
```bash
npx prisma migrate deploy
```
*(This creates the tables in your new database)*.

---

## 4. Setting Up The Voice Agent (Python)
This handles the calls.

1.  **Add Resource:** Click "+ New" -> "Application" -> "GitHub".
2.  **Select Repo:** `LiveKit-Vobiz-Outbound` (Same repo).
3.  **Configuration:**
    -   **Base Directory:** `/` (Root).
    -   **Build Pack:** `Docker` (Uses root `Dockerfile`).
    -   **Environment Variables:** Copy ALL keys from your `.env.example`.
        -   **Crucial Update:** Set `WEBHOOK_URL` to your Dashboard's Internal URL.
        -   Example: `WEBHOOK_URL=http://<dashboard-service-name>:3000/api/hooks/transcript`
4.  **Start:** Click "Deploy".

---

## 5. Connecting Frontend & Backend
Since both are in Coolify:
-   **Dashboard** talks to **Database** via internal Docker network.
-   **Agent** talks to **Dashboard Webhook** via internal Docker network (or public URL).
-   **External World** puts calls into **Dashboard** (Public URL).

## Common Questions

**Q: "Can I host the website on Itlify (Netlify/Vercel)?"**
A: **Yes**, but it's harder.
-   If Dashboard is on Netlify, it cannot verify the database password securely unless the Database is "Publicly Accessible" (risky).
-   **Recommendation:** Host **EVERYTHING on Coolify**. It's faster, secure, and free.

**Q: "How do I log into SSH?"**
If you need to check things manually:
1.  Open your computer's terminal (Command Prompt or Terminal).
2.  Type:
    ```bash
    ssh root@<YOUR_SERVER_IP>
    ```
3.  Enter password.
4.  You are in! (But with Coolify, you rarely need this).

**Q: "How does code get there?"**
1.  You `git push` from your laptop.
2.  Coolify sees the new commit.
3.  Coolify automatically re-downloads and re-builds your app.
    *(Enable "Autodeploy" in Coolify settings).*

---

## 6. Database Cheatsheet (Checking Your Data)
If you want to check your data manually using the **Coolify Console**:

1.  Go to your **Database** resource in Coolify.
2.  Click **Execute Command** (or open Terminal).
3.  Type `psql -U vobiz -d vobiz_db` and press Enter.

**Useful Queries:**
```sql
-- See all campaigns
SELECT * FROM "Campaign";

-- Count usage
SELECT count(*) FROM "Call";

-- See last 5 transcripts
SELECT "phone", "transcript" FROM "Call" ORDER BY "createdAt" DESC LIMIT 5;

-- Quit
\q
```
