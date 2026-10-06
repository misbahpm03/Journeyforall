# A Little World Made for You

An interactive gift in five chapters (envelope → scrapbook → museum → garden → letter → night sky).
One repo, deployed once per person. Everything personal is edited at **`/admin`**; nothing in the code changes.

## A new person (≈5 minutes)

1. **Vercel → Add New → Project →** import this repo. (Each person gets their own project, so their own URL, photos and words.)
2. **Storage → Create → Blob** — choose **Public** access — and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. **Settings → Environment Variables →** add `ADMIN_PASSWORD` (anything only you know).
4. **Deploy** (or Redeploy, if it built before the two steps above).
5. Open `https://<project>.vercel.app/admin`, sign in, fill everything in, upload photos and a song, **Save**.
   Changes go live immediately — no redeploy.

Send her the root URL. `/admin` is only useful with the password.

## Letting her write back (optional, EmailJS)

1. At [emailjs.com](https://www.emailjs.com): **Email Services → Add** (e.g. your Gmail) → note the **Service ID**.
2. **Email Templates → Create**. Use any of these in the subject/body:
   `{{message}}`, `{{from_name}}`, `{{recipient}}`, `{{sent_at}}`, `{{page_url}}` → note the **Template ID**.
3. **Account → Public Key** (it's meant to be public). Under **Security**, add your site's URL as an allowed origin.
4. In `/admin → Writing back`: tick the box, paste the three IDs, press **Send a test**, then **Save**.

A quiet "write something back?" then appears on the last page, a few seconds after the final line.

## Editing locally

```bash
npm install
npx vercel link && npx vercel env pull .env.local   # gets the Blob token + password for that project
npm run dev                                           # http://localhost:3000  ·  /admin to edit
```

Without `.env.local` the site still runs with placeholder content; saving is disabled.
Add `#scrapbook`, `#museum`, `#garden`, `#letter` or `#universe` to the URL to jump to a chapter.

## Where things live

| What | Where |
| --- | --- |
| Content shape + placeholder defaults | `src/content/gift.ts` |
| Admin editor | `src/app/admin/` |
| Stored content | Vercel Blob, `content/site-*.json` (newest wins) |
| Uploaded photos / songs | Vercel Blob, `images/` and `audio/` |
| Default colours | top of `src/app/globals.css` (overridable in admin → Colours) |

Photos are resized in the browser to ~2000px WebP before upload. HEIC needs exporting to JPEG first (except in Safari).
