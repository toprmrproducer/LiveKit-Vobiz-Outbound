# 📜 Final README Document: Rapid X AI Voice Agent

**Powered by [Rapid X AI](https://rapidxai.com) | Built by Shreyas Raj**

[![Instagram](https://img.shields.io/badge/Instagram-@ai.w.raj-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/ai.w.raj)
[![X](https://img.shields.io/badge/X-@topR9595-000000?style=for-the-badge&logo=x)](https://x.com/topR9595)
[![YouTube](https://img.shields.io/badge/YouTube-Shreyas_Raj-FF0000?style=for-the-badge&logo=youtube)](https://youtube.com/@ShreyasRaj)

---

## 👋 Introduction (Start Here)

Welcome! This code allows you to create your own **AI Employee** that can make phone calls. It listens, thinks, and speaks just like a human.

**You do NOT need to be a coder to use this.** Just follow this guide step-by-step.

---

## 🧩 The Ingredients (APIs)

To make an AI Voice Agent, you need 5 specific "ingredients". You will need to sign up for these websites to get "API Keys" (passwords).

| Ingredient | Service Name | Role | Price (Approx) | Free Option? |
| :--- | :--- | :--- | :--- | :--- |
| **1. The Phone Line** | **[Vobiz](https://vobiz.io)** | Connects AI to real phones. | ~$0.01 / min | ❌ No (Telecom always costs money) |
| **2. The Server** | **[LiveKit](https://livekit.io)** | Connects audio in real-time. | Free (Community) | ✅ **YES** (Generous Free Tier) |
| **3. The Ears** | **[Deepgram](https://deepgram.com)** | Transcribes speech to text. | $0.0043 / min | ✅ **YES** ($200 free credit) |
| **4. The Brain** | **[Groq](https://groq.com)** | Thinks & generates answers. | $0.0001 / call | ✅ **YES** (Very cheap / Free beta) |
| **5. The Voice** | **[Sarvam AI](https://sarvam.ai)** | Speaks Indian languages. | ~$0.01 / min | ❌ Paid (Cheap) |

### 💡 "Can I run this for FREE?"
**Almost.**
*   **LiveKit, Deepgram, and Groq** provide enough free credits to run hours of test calls for $0.
*   **Vobiz (Telephony)** requires you to buy a phone number (~$1/month) and pay for minutes. This is unavoidable because real phone networks (AT&T, Jio, Airtel) charge for access.

---

## 💰 Cost Breakdown (Per Minute Call)

If you run this in production, here is exactly how much one minute of conversation costs you:

*   **Telephony (Vobiz):** 1.0¢
*   **Voice (Sarvam):** 1.0¢
*   **Listening (Deepgram):** 0.4¢
*   **Server (LiveKit):** 0.4¢ (or Free)
*   **Brain (Groq):** ~0.0¢

**Total:** **~2.8 cents per minute** (₹2.30 INR)

---

## 🛠 How to Set Up (Step-by-Step)

### Step 1: Download the Code
1.  Click the green **"Code"** button on GitHub and choose **"Download ZIP"**.
2.  Unzip the folder on your computer.

### Step 2: Install Python
You need Python installed to run the robot brain.
*   **Mac:** `brew install python`
*   **Windows:** Download from [python.org](https://python.org).

### Step 3: Add Your Keys (The .env file)
1.  In the folder, look for a file named `.env.example`.
2.  Rename it to just `.env`.
3.  Open it with any text editor (Notepad, TextEdit).
4.  Paste your keys next to the names:
    ```env
    LIVEKIT_API_KEY=...
    LIVEKIT_API_SECRET=...
    DEEPGRAM_API_KEY=...
    GROQ_API_KEY=...
    VOBIZ_SIP_TRUNK_ID=...
    ```

### Step 4: Run the Agent (The Backend)
Open your terminal (Command Prompt) in the folder and run:

```bash
# Install tool requirements (do this once)
pip install -r requirements.txt

# Start the agent
python agent.py start
```
*If you see "Connecting to room...", it works!*

---

## 🖥 How to Run the Dashboard (Frontend)

This is the beautiful "Rapid X AI Control Center" website where you type numbers to call.

1.  Open a **NEW** terminal window.
2.  Go into the dashboard folder:
    ```bash
    cd dashboard
    ```
3.  Install website tools (do this once):
    ```bash
    npm install
    ```
4.  Start the website:
    ```bash
    npm run dev
    ```
5.  Open your browser to: **http://localhost:3000**

---

## 🎨 How to Customize

### "How do I change what the AI says?"
Open `agent.py`. Look for the section that says `instructions="""`.
Change the text inside the quotes.
*   *Example:* Change "You are a helpful assistant" to "You are a salesperson selling coffee."

### "How do I change the voice?"
Open `.env`. Change:
*   `SARVAM_VOICE=anushka` (Female)
*   `SARVAM_VOICE=aravind` (Male) (Check Sarvam docs for names).

---

## 🤝 Need Help? (Book a Call)

We build massive-scale AI systems for enterprises. If you want this custom-built for your business:

👉 **[Book a Call with Rapid X AI](https://rapidxai.com)**

---
*Built with ❤️ by Shreyas Raj.*
