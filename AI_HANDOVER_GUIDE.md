# 🤖 AI Agent Handover Guide: Project Vobiz (Outbound Voice AI)

**Date:** Feb 2026
**Status:** Code Complete (Phase 4 finished). In Deployment Phase.
**Repo Context:** `LiveKit-Vobiz-Outbound`

---

## 1. 🎯 The Mission (Context for AI)
The user is building a **Mass Outbound AI Calling Platform** on a self-hosted **KVM VPS** using **Coolify**.
*   **Goal:** Allow users to upload a CSV of thousands of phone numbers, have an AI call them simultaneously, and store the transcripts/analysis in a database.
*   **Key Constraint:** The user is a "no-code" founder. You must explain things in simple terms but execute complex code tasks precisely.
*   **Current Blocker:** Deployment verification. We have written the code, but we haven't seen it run on the live server yet.

---

## 2. 🏗️ Architecture & Tech Stack

### A. Core Components
1.  **Voice Agent (Python)**:
    *   **Framework:** `livekit-agents` (v1.0+).
    *   **Role:** Handles the actual audio conversation.
    *   **Logic:** Receives SIP calls -> Converses using LLM -> Sends Transcript to Dashboard on disconnect.
2.  **Dashboard (Next.js 14+)**:
    *   **Role:** The UI for the user.
    *   **Features:** CSV Upload, Campaign Management, Database Viewer, Webhook Receiver.
    *   **Database:** PostgreSQL (via Prisma ORM).
3.  **SaaS Infrastructure (Coolify)**:
    *   **Deployment:** Docker containers managed by Coolify.
    *   **Networking:** Internal Docker network (Dashboard talks to DB via `postgres:5432`, Agent talks to Dashboard via `dashboard-app:3000`).

### B. Deployment Setup (Coolify)
*   **Service 1: PostgreSQL** (`vobiz-db`): Stores data.
*   **Service 2: Dashboard** (`/dashboard`): Next.js app. Exposes port 3000.
*   **Service 3: Voice Agent** (`/`): Python app. Runs on host network or exposes ports for RTC.

---

## 3. 📂 Codebase "Mental Map" (File-by-File)

### Root Directory (`/`) - The Voice Agent
*   **`agent.py`**: **CRITICAL**. The main brain.
    *   `entrypoint()`: Decides if it's an outbound call (reads metadata) or inbound (web).
    *   `SIP Participant Creation`: Logic is actually in the Dashboard, but the Agent *receives* the call.
    *   **Data Loop**: Look for `@ctx.room.on("disconnected")`. This functions sends the transcript to `WEBHOOK_URL`.
*   **`config.py`**: Configuration singleton.
    *   Dynamic prompts (`user_prompt`) are passed via `job.metadata` and override `SYSTEM_PROMPT`.
*   **`Dockerfile`**: Python environment setup (installs `requirements.txt`).
*   **`.env.example`**: Template for env vars.

### Dashboard Directory (`/dashboard`) - The Control Center
*   **`prisma/schema.prisma`**: Database Models.
    *   `Campaign`: Stores batch info.
    *   `Contact`: Individual person.
    *   `Call`: The log of a specific call (status, transcript).
*   **`app/api/campaigns/[id]/dispatch/route.ts`**: **The Mass Dialer Logic**.
    *   Fetches pending contacts -> Loop -> Creates `Call` record -> Calls `sipClient.createSipParticipant`.
    *   **Crucial:** Passes `call_id` in `roomMetadata` so the Agent knows which DB record to update.
*   **`app/api/hooks/transcript/route.ts`**: **The Receiver**.
    *   Receives POST from `agent.py`. Updates the `Call` record with `transcript` and `status: COMPLETED`.
*   **`components/BulkDialer.tsx`**: CSV Uploader UI.
*   **`lib/server-utils.ts`**: Inits LiveKit `RoomServiceClient`, `SipClient`, and `PrismaClient`.

---

## 4. 🔄 The Data Flow (How "Mass Calling" Works)

1.  **Upload:** User uploads `leads.csv` in Dashboard (`BulkDialer.tsx`).
    *   -> API creates `Contact` records in DB.
2.  **Dispatch:** User clicks "Process Batch".
    *   -> `/api/dispatch` triggered.
    *   -> selects 10 pending contacts.
    *   -> Creates `Call` record (Status: DISPATCHED).
    *   -> Calls LiveKit API to dial SIP Trunk (`VOBIZ_SIP_TRUNK_ID`).
    *   -> **Metadata Injection:** Passes `call_id` and `user_prompt` into the SIP Participant's metadata.
3.  **The Call:**
    *   Vobiz dials the phone. User picks up.
    *   LiveKit Server connects audio to `agent.py`.
    *   `agent.py` reads `call_id` from metadata.
    *   Agent converses using `user_prompt`.
4.  **The Return:**
    *   Call ends.
    *   `agent.py` fires `on_disconnect`.
    *   Sends `transcript` + `call_id` to `WEBHOOK_URL` (Dashboard).
    *   Dashboard updates `Call` record in DB.
5.  **Result:** User sees "Completed" and Transcript in Dashboard.

---

## 5. ⚠️ Current State & "Where We Left Off"

**We are in the middle of DEPLOYMENT.**

### What is Done ✅
*   All code for the above flow is written and committed.
*   `COOLIFY_GUIDE.md` was created to walk the user through clicking buttons in Coolify.
*   `Dockerfile` created for Dashboard.

### What is NOT Done (Where you assume control) 🛑
1.  **Verification:** We haven't confirmed the user actually clicked "Deploy" on Coolify.
2.  **Database Migration:** The user needs to run `npx prisma migrate deploy` inside the Coolify console. **They might forget this.**
3.  **Env Var Sync:** The user might mess up the `WEBHOOK_URL`.
    *   **Correct Value for Agent:** `http://<dashboard-internal-ip>:3000/api/hooks/transcript` (Because they are on the same Docker network).
    *   **Correct Value for Dashboard:** `http://localhost:3000/api/hooks/transcript` (Self-reference).

### Immediate Action Plan for YOU (The Next AI)
1.  **Ask the user:** "Did you push the latest code?"
2.  **Ask the user:** "Did you create the Database and Dashboard services in Coolify?"
3.  **The "Migration" Step:** The user will likely ask "My dashboard says database error".
    *   You MUST tell them: "Go to Coolify -> Dashboard Service -> Terminal -> Run `npx prisma migrate deploy`".
4.  **The "Webhook" check:** If calls happen but no transcripts appear, debugging the `WEBHOOK_URL` in the Agent service is your priority.

---

## 6. Environment Variables Reference (Copy-Paste for User)

**Agent Service (`.env`):**
```bash
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
# ... (AI Provider Keys: OPENAI, GROQ, DEEPGRAM, SARVAM) ...
WEBHOOK_URL=http://dashboard-app:3000/api/hooks/transcript  <-- Internal URL!
DATABASE_URL=postgresql://vobiz:vobizpassword@vobiz-db:5432/vobiz_db <-- Internal URL!
```

**Dashboard Service (`.env`):**
```bash
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
VOBIZ_SIP_TRUNK_ID=...
DATABASE_URL=postgresql://vobiz:vobizpassword@vobiz-db:5432/vobiz_db
```

---
**Good luck. The system is powerful, just guide the deployment gently.**
