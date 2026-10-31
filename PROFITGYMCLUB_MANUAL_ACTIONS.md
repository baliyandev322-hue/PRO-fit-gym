# PROFITGYMCLUB — Production Manual Action Guide

**Project:** PROFITGYMCLUB  
**Apex Domain:** `https://profitgymclub.com`  
**WWW Domain:** `https://www.profitgymclub.com`  
**Backend API:** `https://pro-fit-gym.onrender.com`  
**Hosting Platforms:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)  

This document outlines the **exact, mandatory manual actions** required in external dashboards (Vercel, DNS Provider, Render, Razorpay, Google Analytics, and Google Search Console) to complete the production rollout.

---

## 1. Fix WWW SSL / TLS Certificate & Canonical Redirect

### The Problem
Visiting `https://www.profitgymclub.com` produces an SSL error (`SEC_E_WRONG_PRINCIPAL` / invalid TLS certificate) because `www.profitgymclub.com` was pointed directly via CNAME to `profitgymclub.com` rather than Vercel's edge network, and was not provisioned with a Let's Encrypt / Vercel SSL certificate.

### Step 1A: Configure Domain in Vercel
1. Open the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your project: **`js`** (or `profitgymclub`).
3. Navigate to **Settings** > **Domains**.
4. You should see `profitgymclub.com` listed as the Production Domain.
5. In the input box under **"Add Domain"**, type:
   ```text
   www.profitgymclub.com
   ```
6. Click **Add**.
7. Vercel will ask how to configure it. Select:
   - **"Redirect to profitgymclub.com"** (Recommended / Standard)
   - Status Code: **308 Permanent Redirect** (or 301).
8. Click **Save**.

### Step 1B: Update DNS at Domain Registrar (GoDaddy, Namecheap, Cloudflare, Hostinger, etc.)
1. Log in to your DNS provider dashboard where you purchased `profitgymclub.com`.
2. Open the **DNS Management / DNS Records** page.
3. Locate the existing `CNAME` record for host `www`.
4. Update or replace it with the following exact record:
   - **Type:** `CNAME`
   - **Name / Host:** `www`
   - **Target / Value:** `cname.vercel-dns.com`
   - **TTL:** `60 seconds` (or `Automatic`)
5. If there is an `A` record for `www`, delete it.
6. Verify your root record remains:
   - **Type:** `A`
   - **Name / Host:** `@`
   - **Target / Value:** `76.76.21.21` (Vercel IP)
7. Save changes.

### Step 1C: Verification
After 5–15 minutes (DNS propagation), run this command in your terminal or visit in your browser:
```bash
curl -Iv https://www.profitgymclub.com
```
**Expected Result:**
- TLS handshake completes successfully with a valid certificate.
- HTTP `308` or `301` redirect to `https://profitgymclub.com/`.

---

## 2. Render Backend Configuration & Secret Rotation

### The Problem
1. `ALLOWED_ORIGINS` on Render must include `https://profitgymclub.com` and `https://www.profitgymclub.com` so CORS headers allow the frontend to access API endpoints.
2. The default `JWT_SECRET` and admin password were previously present in Git history (`password123`). In production, these must be rotated.

### Step 2A: Generate a Cryptographically Secure JWT Secret
Run this command in any terminal to generate a secure 256-bit random key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
*(Example output: `a93b4f62d8494b...` — save this string).*

### Step 2B: Update Environment Variables on Render
1. Open the [Render Dashboard](https://dashboard.render.com/).
2. Select your Web Service: **`pro-fit-gym`**.
3. In the left navigation menu, click **Environment**.
4. Add or update the following variables:

| Environment Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enforces production security protections |
| `ALLOWED_ORIGINS` | `https://profitgymclub.com,https://www.profitgymclub.com` | Allows both root and www domains |
| `JWT_SECRET` | *(Paste generated 64-char hex key from Step 2A)* | Never reuse old git secrets |
| `PORT` | `5000` | Or leave default assigned by Render |
| `MONGODB_URI` | *(Your existing MongoDB Atlas connection string)* | Retain existing connection |
| `RAZORPAY_KEY_ID` | `rzp_live_TpI8PtIajvVoW3` *(or refreshed key)* | Must match Razorpay Live Dashboard |
| `RAZORPAY_KEY_SECRET` | `FZ0vfr7iMCaKZ33sEbLhJebu` *(or refreshed key)* | Keep private on server only |

5. Click **Save Changes**. Render will automatically trigger a zero-downtime redeploy.

### Step 2C: Verification
Test the health check endpoint:
```bash
curl -I https://pro-fit-gym.onrender.com/api/health
```
**Expected Result:** HTTP `200 OK` with JSON `{ "status": "online", "environment": "production" }`.

---

## 3. Razorpay Live Key Activation & Verification

### The Context
During testing, calls to the Razorpay Orders API with the provided live key returned `401 Unauthorized`. This indicates either:
- The live key is currently disabled or pending KYC approval in Razorpay.
- Or the Key Secret was regenerated in the Razorpay dashboard.

### Steps to Verify & Refresh:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch the top toggle to **"Live Mode"** (confirm it says LIVE in green).
3. In the left sidebar, navigate to **Account & Settings** > **API Keys**.
4. Check the status of your Key ID:
   - If `rzp_live_TpI8PtIajvVoW3` is shown as active, verify the secret.
   - If revoked or expired, click **"Regenerate Live Key"**.
   - Copy the new **Key Id** and **Key Secret**.
5. Update the values in two places:
   - **Render Dashboard:** Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
   - **Vercel Dashboard:** Set `VITE_RAZORPAY_KEY_ID` (Key ID only! Never add Secret to Vercel).
6. Redeploy frontend on Vercel and backend on Render.

---

## 4. Google Analytics 4 (GA4) Setup

### The Context
The codebase is now instrumented with a lightweight, GDPR-compliant GA4 analytics module tracking:
- `trial_form_submission`
- `trial_booking_success`
- `whatsapp_lead_click`
- `begin_checkout`
- `purchase`
- `contact_form_submission`

### Steps to Connect Your GA4 Property:
1. Go to [Google Analytics](https://analytics.google.com/).
2. If you do not have a GA4 stream:
   - Navigate to **Admin** > **Data Streams** > **Web**.
   - Stream URL: `https://profitgymclub.com`
   - Stream Name: `PROFIT Training Club Web`
   - Click **Create Stream**.
3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`).
4. Add the variable to Vercel:
   - Open [Vercel Dashboard](https://vercel.com/dashboard) > Project **`js`** > **Settings** > **Environment Variables**.
   - Key: `VITE_GA4_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX` (your copied ID)
   - Environments: check **Production** and **Preview**.
   - Click **Save**.
5. Trigger a new deployment in Vercel to bake the variable into the build.

### How to Verify:
1. Open GA4 and click **Reports** > **Realtime**.
2. Visit `https://profitgymclub.com` in an incognito window.
3. Click "Book Free Trial Pass" or click the WhatsApp button.
4. Watch the Realtime dashboard — the event `trial_form_submission` or `whatsapp_lead_click` will appear within 5 seconds.

---

## 5. Google Search Console & Sitemap Submission

### Steps:
1. Open [Google Search Console](https://search.google.com/search-console).
2. Add Property: Choose **URL prefix** and enter `https://profitgymclub.com`.
3. Verify ownership:
   - If using Vercel, DNS verification (TXT record) or HTML tag verification is easiest.
4. Once verified, click **Sitemaps** in the left menu.
5. Under **"Add a new sitemap"**, enter:
   ```text
   sitemap.xml
   ```
6. Click **Submit**.

### How to Verify:
- Status will update to **"Success"** within a few minutes.
- Discovered pages count will report **23 URLs** (1 homepage, 1 blog index, 16 scientific articles, 2 legal pages, etc.).

---

## 6. Rotate Database Credentials in MongoDB Atlas

### The Context
Because the early demo seed credentials (`admin@profitgym.com` / `password123`) were tracked in older git commits, you should ensure your MongoDB Atlas database does not contain any user accounts using `password123`.

### Steps:
1. Connect to your MongoDB Atlas database (via MongoDB Compass or Atlas web shell).
2. Switch to your database: `profit_gym` (or configured database).
3. Query the `admins` and `users` collections:
   ```javascript
   db.users.find({ email: "admin@profitgym.com" });
   ```
4. If this user exists, update the password to a strong hashed password using bcrypt or delete the record and register your official admin account via the secured registration endpoint or manual script.
