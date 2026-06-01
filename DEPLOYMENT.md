# AKKC — Production Deployment (Hostinger VPS)

This guide deploys the AKKC application to the Hostinger VPS (Ubuntu 24.04 +
Docker + Nginx Proxy Manager), behind SSL, in an isolated, repeatable way.

## Architecture (what actually runs where)

| Concern            | Where it lives                          | Notes |
|--------------------|-----------------------------------------|-------|
| Next.js app        | **Docker container on the VPS**, port 3000 (localhost only) | The *only* thing you run on the VPS |
| Postgres database  | **Supabase Cloud**                      | Tables `applications`, `inquiries` |
| File uploads       | **Supabase Storage** bucket `documents` | Browser uploads **directly** to Supabase via signed URLs — files never touch the VPS disk |
| Scheduled cleanup  | **Supabase pg_cron**                    | Orphaned-file sweep (see `supabase/schema.sql`) |
| Email              | External SMTP provider                  | Sent by the app via nodemailer |
| TLS / routing      | **Nginx Proxy Manager** (already on VPS)| Terminates SSL, proxies to `akkc-app:3000` |

Because the app is stateless, the VPS holds **no application data**. The only
local file that matters is `.env`. This keeps the box clean and easy to rebuild.

Replace `aplikime.nacc.gov.al` below with your real domain everywhere it appears.

---

## 0. One-time Supabase Cloud setup

Do this once in your Supabase project (https://supabase.com):

1. **Create the project** (region close to Albania, e.g. Frankfurt).
2. **SQL Editor → New query** → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   - Creates the `applications` and `inquiries` tables, the private `documents`
     Storage bucket (20 MB limit, PDF/JPEG/PNG only), RLS policies, and the
     daily orphaned-file cleanup job.
   - If `pg_cron` errors, enable it first: **Database → Extensions → pg_cron**, then re-run.
3. **Project Settings → API** — copy these for the `.env` file:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (**server-side secret — never expose**)

---

## 1. Prepare the VPS directory

SSH into the VPS, then:

```bash
sudo mkdir -p /opt/apps/akkc
sudo chown "$USER":"$USER" /opt/apps/akkc
cd /opt/apps
git clone <YOUR_GIT_REMOTE_URL> akkc
cd akkc
```

Make the helper scripts executable and create the shared Docker network that
both the app and Nginx Proxy Manager use:

```bash
chmod +x deploy.sh backup-env.sh
docker network create npm_network    # harmless if it already exists
```

---

## 2. Configure secrets (`.env`)

```bash
cp .env.example .env
nano .env          # fill in real values
chmod 600 .env     # readable only by your user
```

Fill in (see `.env.example` for inline notes):

```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY

# App — MUST be the public HTTPS URL (used to build admin links in emails)
NEXT_PUBLIC_APP_URL=https://aplikime.nacc.gov.al

# Email (SMTP)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false          # true only for implicit TLS on port 465
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="AKKC <no-reply@yourdomain.com>"
ADMIN_EMAIL=admin@yourdomain.com
```

> **Security:** `.env` is in `.gitignore` and `.dockerignore` — it is never
> committed and never copied into the Docker image. Keep `chmod 600`.

---

## 3. Build & start the app

```bash
./deploy.sh        # builds the image and starts the container
```

Or manually:

```bash
docker compose up -d --build
```

Verify it's healthy and answering locally:

```bash
docker compose ps                       # STATUS should show "healthy"
curl -I http://127.0.0.1:3000           # expect HTTP/1.1 200 OK
./deploy.sh logs                        # watch logs (Ctrl-C to stop)
```

The container binds to `127.0.0.1:3000` (not the public interface), so it is
only reachable through Nginx Proxy Manager.

---

## 4. Connect Nginx Proxy Manager + SSL

NPM runs in its own container, so it must share the `npm_network` to reach the
app by name.

**a. Put NPM on the shared network (one time):**

```bash
docker network connect npm_network <npm-container-name>
# find the name with: docker ps --format '{{.Names}}'   (often "nginx-proxy-manager" or "npm-app-1")
```

**b. Point your DNS** `A` record for `aplikime.nacc.gov.al` at the VPS public IP.

**c. In the NPM dashboard (port 81) → Hosts → Proxy Hosts → Add Proxy Host:**

- **Details tab**
  - Domain Names: `aplikime.nacc.gov.al`
  - Scheme: `http`
  - Forward Hostname / IP: `akkc-app`   *(the container name)*
  - Forward Port: `3000`
  - Block Common Exploits: **on**
  - Websockets Support: on (harmless)
- **SSL tab**
  - SSL Certificate: **Request a new SSL Certificate** (Let's Encrypt)
  - Force SSL: **on**
  - HTTP/2 Support: **on**
  - HSTS Enabled: **on** (optional, recommended)
  - Agree to Let's Encrypt ToS, enter your email → **Save**

NPM provisions the certificate automatically. Visit `https://aplikime.nacc.gov.al`.

> If forwarding by container name fails, ensure step (a) ran and that the app's
> `docker compose ps` shows it on `npm_network`. As a fallback you can forward
> to the host gateway `172.17.0.1:3000`.

---

## 5. End-to-end test checklist

Test against the live HTTPS URL:

- [ ] **Site loads** over HTTPS, padlock valid, no mixed-content warnings.
- [ ] **Application submission** — complete the multi-step form and submit.
- [ ] **File upload** — attach PDF/JPG/PNG docs; confirm they upload (browser → Supabase).
- [ ] **Database saved** — in Supabase → Table Editor → `applications`, the new row appears with `data` + `files` JSON.
- [ ] **Admin email** — `ADMIN_EMAIL` inbox receives "[AKKC] Aplikim i ri …" with the admin link.
- [ ] **Admin access** — open the admin link (`/admin/<token>`); all sections render and document "Shkarko" links download the files (signed URLs).
- [ ] **Applicant confirmation email** — the address in the form receives "Konfirmim i aplikimit …".
- [ ] **Inquiry widget** — submit a question via the chat widget; row lands in `inquiries` and admin gets "[AKKC] Pyetje/kërkesë …".

Quick storage sanity check (Supabase → Storage → `documents`): files appear
under `<application_id>/<key>.<ext>`.

If emails don't arrive: `./deploy.sh logs` and look for `[submit] email send
failed` / `[inquiry] email send failed`, then re-check SMTP creds/port/secure.

---

## 6. Updating after future changes (redeploy)

From `/opt/apps/akkc` on the VPS:

```bash
./deploy.sh            # git pull + rebuild + restart + prune old images
```

- Rolls the container with `unless-stopped` restart policy.
- `./deploy.sh logs` to watch startup; `./deploy.sh status` for health.
- To roll back: `git checkout <previous-commit> && ./deploy.sh --no-pull`.

---

## 7. Backups — what to back up and how

| Asset                  | Where             | Backup method |
|------------------------|-------------------|---------------|
| **Database**           | Supabase Cloud    | Automatic daily backups on Supabase (paid tiers add PITR). Optionally also run `pg_dump` on a schedule — see below. |
| **Uploaded files**     | Supabase Storage  | Covered by Supabase. For an off-site copy, periodically mirror the `documents` bucket (Supabase CLI / S3-compatible export). |
| **`.env` secrets**     | VPS `/opt/apps/akkc/.env` | **Not stored anywhere else** — back this up manually to a secure location (password manager / encrypted vault). Run `./backup-env.sh` to produce an encrypted copy. |
| **App code**           | Git remote        | Already version-controlled — keep the GitHub repo as the source of truth. |

The VPS itself holds no irreplaceable data beyond `.env`, so a destroyed VPS is
recoverable by: provision box → install Docker/NPM → `git clone` → restore
`.env` → `./deploy.sh`.

**Optional self-managed DB dump** (in addition to Supabase's backups), from any
machine with the DB connection string (Supabase → Project Settings → Database):

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.YOUR-PROJECT.supabase.co:5432/postgres" \
  --no-owner --format=custom -f akkc-$(date +%F).dump
```

Store the dump off the VPS. Schedule it with cron if you want regular copies.

---

## Troubleshooting quick reference

| Symptom | Check |
|---------|-------|
| 502 in browser | App container down/unhealthy → `docker compose ps`, `./deploy.sh logs` |
| NPM can't reach app | NPM not on `npm_network` → re-run `docker network connect npm_network <npm>` |
| "Missing Supabase env vars" in logs | `.env` not loaded / wrong keys → check `env_file` and values |
| Emails not sent | SMTP creds/port; `SMTP_SECURE=true` only for port 465 |
| Admin link 404 | Token must match a row; links are confidential and per-application |
| Build fails on VPS | Low RAM during build → add swap, or build the image off-box and push to a registry |
