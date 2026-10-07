# Kitchen Keeper — phone app + shared inventory

This is an installable Progressive Web App (PWA). It can work locally, and when connected to Supabase it can synchronize one household inventory between multiple phones.

## 1. Create the cloud project
1. Create a Supabase project.
2. In Supabase **SQL Editor**, run `supabase-schema.sql`.
3. In Project Settings / API, copy the **Project URL** and **Publishable key**.
4. Open `index.html` and find `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_PUBLISHABLE_KEY` near the top. Replace them with those values. Use only the browser-safe publishable/anon key, never a secret/service-role key. Supabase's browser client is intended to be initialized with the project URL and publishable key. citeturn0search0
5. In Supabase Authentication, enable Email/password. If you want immediate password sign-in without email confirmation, turn off the email-confirmation requirement in the Auth settings; otherwise users should confirm their email first.

## 2. Publish it
Upload all files in this folder to GitHub Pages, Cloudflare Pages, Netlify, or another HTTPS static host. HTTPS is needed for installability/service workers.

## 3. Install on phones
Open the published HTTPS address on each phone. Use the browser's **Add to Home Screen / Install App** option. It will open as a standalone app.

## 4. Share the kitchen
- On the first phone, open **Settings → Cloud Sharing**, create an account, sign in, and create a household.
- The app displays an **invite code**.
- On another phone, install the app, create/sign into an account, open Cloud Sharing, and enter the invite code.
- Everyone in that household sees the same inventory. Food additions, edits, quantity changes and deletions sync through the database/realtime connection. Supabase Realtime supports database change subscriptions. citeturn0search4

## 5. Photos
The current version stores each uploaded item photo with the food record for simple household use. For a very large inventory with lots of high-resolution photos, the next upgrade should move pictures to Supabase Storage.

## Security
The included SQL enables Row Level Security and restricts food/settings access to authenticated household members. Do not expose a Supabase secret/service-role key in the browser.
