# Setting Up Nancy's Kitchen Website
### A step-by-step guide — no coding experience needed!

This guide will walk you through everything you need to do to get Nancy's Kitchen live on the internet
so your whole family can access it. It should take about 30–45 minutes total.

---

## What You'll Need (all free)

| Service | What it does | Cost |
|---------|-------------|------|
| **Node.js** | Runs the website on your computer during setup | Free |
| **Supabase** | Stores all the recipes and photos online | Free |
| **Anthropic API** | Claude AI reads Nancy's handwriting | ~$0.01 per photo |
| **GitHub** | Stores your website code online | Free |
| **Vercel** | Hosts the website so family can visit it | Free |

---

## STEP 1 — Install Node.js on Your Computer

1. Go to **https://nodejs.org**
2. Click the big green button that says **"LTS"** (not "Current")
3. Download and run the installer — click "Next" through everything
4. When it's done, restart your computer

---

## STEP 2 — Set Up Supabase (your recipe database + photo storage)

**Create an account:**
1. Go to **https://supabase.com** and click "Start your project"
2. Sign up with your email or Google account
3. Click "New Project" and fill in:
   - **Name:** `nancys-kitchen` (or anything you like)
   - **Database Password:** make up a strong password and save it somewhere
   - **Region:** pick the one closest to you (e.g. "US East")
4. Click "Create new project" and wait about 2 minutes

**Set up the database tables:**
1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from the folder you downloaded
4. Copy ALL the text from that file and paste it into the SQL editor
5. Click the green **"Run"** button
6. You should see "Success. No rows returned" — that means it worked!

**Set up photo storage:**
1. Click **"Storage"** in the left sidebar
2. Click **"New bucket"**
3. Name it exactly: `recipe-images`
4. Check the box for **"Public bucket"**
5. Click **"Create bucket"**

**Get your API keys:**
1. Click **"Project Settings"** (gear icon) in the left sidebar
2. Click **"API"**
3. Copy and save these three values (you'll need them in Step 4):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (another long string — keep this secret!)

---

## STEP 3 — Get an Anthropic API Key (for AI recipe reading)

1. Go to **https://console.anthropic.com**
2. Sign up for an account
3. Go to **"API Keys"** and click **"Create Key"**
4. Give it a name like "Nancy's Kitchen"
5. Copy the key (starts with `sk-ant-...`) and save it somewhere safe
6. You'll need to add a small amount of credit ($5–$10) — each photo analysis costs about 1 cent,
   so $5 would cover 500 recipe photos

---

## STEP 4 — Set Up the Website Files

1. Unzip the `nancys-recipes.zip` file you downloaded
2. Open that folder — you should see files like `package.json`, folders like `app/`, etc.

**Create your settings file:**
1. In the folder, find the file called `.env.example`
2. Make a copy of it and rename the copy to exactly: `.env.local`
3. Open `.env.local` with Notepad (Windows) or TextEdit (Mac)
4. Fill in your values from the steps above:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJyour-anon-key-here
SUPABASE_SERVICE_KEY=eyJyour-service-role-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

5. Save the file

---

## STEP 5 — Test It on Your Computer

1. Open **Terminal** (Mac: search for "Terminal" in Spotlight) or **Command Prompt** (Windows: search "cmd")
2. Type this command and press Enter to go to your folder:
   ```
   cd Downloads/nancys-recipes
   ```
   (Adjust the path to wherever you unzipped the files)

3. Install the required packages (do this once):
   ```
   npm install
   ```
   This will download some code — it takes 2–3 minutes.

4. Start the website:
   ```
   npm run dev
   ```

5. Open your browser and go to: **http://localhost:3000**

You should see Nancy's Kitchen! 🎉

When you're done testing, press `Ctrl+C` in the terminal to stop it.

---

## STEP 6 — Put It Online with Vercel (so family can see it)

**Create a GitHub account and upload your code:**
1. Go to **https://github.com** and create a free account
2. Click the **"+"** icon → **"New repository"**
3. Name it `nancys-kitchen`, keep it Private, click "Create repository"
4. Follow GitHub's instructions to upload your folder (the "…or push an existing repository" section)

**Deploy to Vercel:**
1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **"Add New Project"**
3. Select your `nancys-kitchen` repository
4. Before clicking Deploy, click **"Environment Variables"** and add all four:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key
   - `SUPABASE_SERVICE_KEY` → your service role key
   - `ANTHROPIC_API_KEY` → your Anthropic key
5. Click **"Deploy"**

After 2–3 minutes, Vercel will give you a URL like `https://nancys-kitchen.vercel.app`

**Share that link with your family and Nancy's Kitchen is live!** 🎉

---

## STEP 7 — Upload Nancy's Recipes

1. Visit your new website
2. Click **"Add Recipe"** in the top navigation
3. Click or drag your HEIC photo files into the upload area
4. You can select ALL 200 photos at once!
5. Click **"Analyze All with AI"**
6. Claude will read each recipe card, transcribe it, and suggest a category
7. Review each one, make any corrections, then click **"Save to Nancy's Kitchen"**

---

## Tips & Notes

- **HEIC files from iPhone:** These work perfectly. Just select them from your Photos app or Files app.
- **Blurry or hard-to-read photos:** Claude will do its best, but you can always correct any mistakes
  before saving, or go back and edit later.
- **Sharing the link:** Anyone with the website address can view recipes and leave comments.
  There's no password needed — it's designed to be open to family.
- **Editing recipes later:** On any recipe page, just click "Edit Recipe" to make changes anytime.
- **Family comments:** Family members just need to enter their name — no accounts required.

---

## Need Help?

If something doesn't work, here are the most common issues:

**"npm: command not found"** → Node.js didn't install correctly. Try restarting your computer and repeating Step 1.

**"Upload failed"** → Check that your Supabase storage bucket is named exactly `recipe-images` and is set to Public.

**"Claude could not read this image"** → The photo may be too dark or blurry. Try taking a better photo, or just type the recipe in manually using the edit form.

**The website looks broken** → Make sure your `.env.local` file has all four values and no extra spaces around the `=` signs.

---

*Nancy's Kitchen was built with love for the Pavlik family. 💚🧡*
