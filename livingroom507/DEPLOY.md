# Cloudflare Pages Deployment

This app is set up for Cloudflare Pages with Pages Functions and a D1 database binding named `DB`.

## 1. Log in to Cloudflare

```powershell
npx wrangler login
```

## 2. Create the D1 database

Create the production database:

```powershell
npx wrangler d1 create livingroom507-db
```

Copy the returned `database_id` value into [`wrangler.toml`](./wrangler.toml):

- `database_id = "REPLACE_WITH_PRODUCTION_DATABASE_ID"`

`preview_database_id` is already set to `DB` for local Pages development, so you do not need a second remote preview database unless you explicitly want one.

## 3. Apply the migrations

Run the schema and seed migrations against your local preview first:

```powershell
npx wrangler d1 migrations apply DB --local
```

Then apply them to the remote production database:

```powershell
npx wrangler d1 migrations apply DB --remote
```

## 4. Create the Pages project

```powershell
npx wrangler pages project create livingroom507
```

Use these values when prompted:

- Production branch: your real deployment branch, usually `main`
- Build output directory: `public`

## 5. Deploy the site

From the [`livingroom507`](.) directory:

```powershell
npx wrangler pages deploy public --project-name livingroom507
```

## 6. Recommended verification

After deploy, verify these endpoints return JSON instead of HTML:

```powershell
curl "https://<your-pages-domain>/api/affiliate/profile?email=roblq123@gmail.com"
curl -X POST "https://<your-pages-domain>/api/submit-quiz" -H "Content-Type: application/json" -d "{\"user_email\":\"roblq123@gmail.com\",\"module_number\":1,\"score\":4,\"total_questions\":5}"
```

## Notes

- The live site root should be the [`livingroom507`](.) folder, not the repo root.
- Static files are served from [`public`](./public), and serverless handlers are served from [`functions`](./functions).
- If you already have a Pages project, you do not need to recreate it. Just update the D1 binding and redeploy.
