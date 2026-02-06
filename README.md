# 🚀 Rapid X AI Voice Agent (Vobiz Edition)

**Powered by [Rapid X AI](https://rapidxai.com)**  
*Next-Gen Conversational AI Orchestration*

[![Instagram](https://img.shields.io/badge/Instagram-@ai.w.raj-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/ai.w.raj)
[![X](https://img.shields.io/badge/X-@topR9595-000000?style=for-the-badge&logo=x)](https://x.com/topR9595)
[![YouTube](https://img.shields.io/badge/YouTube-Shreyas_Raj-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com/@ShreyasRaj)

---

## 🌟 Introduction

Welcome to the **Rapid X AI Voice Agent** codebase. This project allows you to spawn intelligent, human-like voice assistants that can call phone numbers, handle real-time conversations, and trigger actions.

It is built on a "Modern AI Stack" for ultra-low latency:
*   **[LiveKit](https://livekit.io)**: For real-time audio streaming infrastructure.
*   **[Vobiz](https://vobiz.io)**: For telephony (SIP Trunking) connectivity.
*   **[Sarvam AI](https://sarvam.ai)**: For hyper-realistic Indian voices.
*   **[Groq](https://groq.com)**: For instant AI thinking (LPU Inference).

---

## 📂 Project Structure (Where is everything?)

Here is a simple breakdown of the files:

*   **`agent.py`**: 🧠 **The Brain.** This file enables the AI. It listens to audio, thinks using Groq, and speaks using Sarvam.
*   **`dashboard/`**: 💻 **The Control Center.** This folder contains the Website code.
    *   `app/page.tsx`: The main page with the "Call Dispatcher" UI.
    *   `app/api/dispatch/route.ts`: The button logic. When you click "Call", this file talks to the server.
*   **`.env`**: 🔑 **The Keys.** This secret file stores your API passwords (LiveKit, Vobiz, etc.). **Never share this!**
*   **`requirements.txt`**: 📦 **The Parts List.** A list of Python tools (libraries) the AI needs to run.
*   **`Dockerfile`**: 🐳 **The Shipping Container.** Instructions to package the AI for cloud servers.

---

## ⚡️ Quick Start Guide

### 1. Prerequisites
*   Python 3.10+ installed.
*   Node.js installed (for the dashboard).
*   API Keys from [LiveKit](https://livekit.io), [Sarvam AI](https://sarvam.ai), and [Groq](https://groq.com).
*   A SIP Trunk set up on [Vobiz](https://vobiz.io).

### 2. Setup (Backend / Agent)
Open your terminal and run:

```bash
# 1. Clone the repository
git clone https://github.com/Start-Up-Republic/LiveKit-Vobiz-Outbound.git
cd LiveKit-Vobiz-Outbound

# 2. Create the environment (Virtual Box)
python3 -m venv venv
source venv/bin/activate  # (On Windows use `venv\Scripts\activate`)

# 3. Install the parts
pip install -r requirements.txt

# 4. Set up your keys
cp .env.example .env
# -> Now open .env and paste your API keys!
```

**Run the Agent:**
```bash
python agent.py start
```
*You will see "Connecting to LiveKit..." success messages.*

### 3. Setup (Frontend / Dashboard)
Open a **new** terminal window:

```bash
cd dashboard

# 1. Install dashboard parts
npm install

# 2. Run the website
npm run dev
```

Go to **[http://localhost:3000](http://localhost:3000)** in your browser. You will see the **Rapid X AI Control Center**.

---

## 📞 How to Make a Call
1.  Ensure `agent.py` is running in one terminal.
2.  Ensure `npm run dev` is running in another.
3.  Open the Dashboard (localhost:3000).
4.  Enter a phone number (e.g., `+91...`).
5.  Click **"Initiate Call"**.
6.  The Agent will wake up, dial the number via Vobiz, and start talking!

---

## 🤝 Need Custom AI Solutions?
**Book a call with the Rapid X AI Team.** We build enterprise-grade voice agents for sales, support, and operations.

👉 **[rapidxai.com](https://rapidxai.com)**

---
*Built with ❤️ by Shreyas Raj.*
