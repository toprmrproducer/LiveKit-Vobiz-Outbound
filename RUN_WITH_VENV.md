# How to Run with Venv (Virtual Environment)

This guide explains how to set up and run the LiveKit Outbound Agent using Python's standard `venv` module.

## 1. Prerequisites

- **Python 3.9** or higher installed.
- Terminal (Mac/Linux) or PowerShell/Command Prompt (Windows).

## 2. Setup (One-time)

### MacOS / Linux

1.  **Open Terminal** in this project folder.
2.  **Create a virtual environment**:
    ```bash
    python3 -m venv venv
    ```
3.  **Activate the virtual environment**:
    ```bash
    source venv/bin/activate
    ```
    *(You should see `(venv)` appear in your terminal prompt)*

4.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

### Windows

1.  **Open PowerShell** in this project folder.
2.  **Create a virtual environment**:
    ```powershell
    python -m venv venv
    ```
3.  **Activate the virtual environment**:
    ```powershell
    .\venv\Scripts\Activate
    ```
4.  **Install dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```

## 3. Configuration

Make sure you have your `.env` file set up with your LiveKit, Vobiz, and OpenAI/Deepgram keys.

```bash
cp .env.example .env
# Edit .env and add your keys
```

## 4. Running the Agent

You need two terminal windows running at the same time.

### Terminal 1: Background Agent

1.  Navigate to the project folder.
2.  Activate the venv (if not already active):
    *   Mac/Linux: `source venv/bin/activate`
    *   Windows: `.\venv\Scripts\Activate`
3.  Start the agent:
    ```bash
    python agent.py start
    ```
    *Wait until you see "registered worker" in the logs.*

### Terminal 2: Make a Call

1.  Open a new terminal window/tab.
2.  Navigate to the project folder.
3.  Activate the venv:
    *   Mac/Linux: `source venv/bin/activate`
    *   Windows: `.\venv\Scripts\Activate`
4.  Trigger a call:
    ```bash
    python make_call.py --to +1234567890
    ```
    *(Replace `+1234567890` with the actual phone number including country code)*

---

## Alternative: Using `uv` (Faster)

If you have `uv` installed, you can skip the manual venv activation steps and just run:

```bash
uv run python agent.py start
```
