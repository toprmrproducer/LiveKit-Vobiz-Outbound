# 🐙 How to Sync Your Code with GitHub

You often ask: *"Is my code on GitHub?"* or *"How do I save my changes?"*

Think of GitHub like **Google Drive** for your code.
- **Your Computer (Local):** Where you make changes.
- **GitHub (Remote):** The cloud backup where everything is safe.

Your code is **NOT** automatically synced. You have to manually "Save" and "Upload" it.

## 1. The 3-Step Process
Every time you want to save your work to the cloud, you do these three steps:

### Step 1: `git add .` (The "Staging" Phase)
This tells Git: *"I want to include ALL the file changes I just made in the next save."*
- It's like selecting all the photos you want to upload.

### Step 2: `git commit -m "Matched"` (The "Save" Phase)
This saves a snapshot of your code on your **computer**.
- The message in quotes is a note to yourself about what you did (e.g., "Added config file", "Fixed call bug").
- **Crucial:** At this point, your code is saved LOCALLY, but NOT on GitHub yet.

### Step 3: `git push` (The "Upload" Phase)
This actually sends your saved commit to **GitHub**.
- This is the moment your code appears on the website.
- If you lose your computer after this step, your code is safe.

---

## 2. Is My Code Synced?
To check if you have unsaved changes, run:
```bash
git status
```

- **If it says "nothing to commit, working tree clean":**
  ✅ You are perfectly synced! Everything on your computer is saved.

- **If you see red file names:**
  ⚠️ You have changes that are NOT saved yet. You need to do the 3 steps above.

- **If it says "Your branch is ahead of 'origin/main' by X commits":**
  ⚠️ You saved locally (committed), but haven't uploaded (pushed) to GitHub yet. Run `git push`.

---

## 3. Your Current Setup
Your code is currently linked to:
**https://github.com/toprmrproducer/LiveKit-Vobiz-Outbound**

### 🚀 Cheat Sheet Command
Run this single line in your terminal to sync everything right now:

```bash
git add . && git commit -m "wip: latest updates" && git push
```
*(Copy and paste this whenever you want to 'Save & Upload')*
