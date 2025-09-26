AD FS (OIDC) Setup

Overview
- Backend verifies ADFS-issued JWTs via JWKS (no local passwords).
- Frontend uses OIDC (PKCE) with redirect login.
- Local SQLite database remains for app data (patients, rooms, users table, etc.).

Backend (.env)
- Copy apps/api/.env.example to apps/api/.env (or use .env.local) and set:
  - PORT=3001
  - DB_FILE_NAME=file:./dev.sqlite
  - API_URL=http://YOUR_IP:3001
  - FRONTEND_URLS=http://YOUR_IP:5173,http://localhost:5173
  - STORAGE_PATH=./uploads
  - STUN_SERVERS=stun:stun.l.google.com:19302
  - ADFS_OIDC_ISSUER=https://adfs.umc.local/adfs
  - ADFS_OIDC_JWKS_URI=https://adfs.umc.local/adfs/discovery/keys
  - ADFS_OIDC_AUDIENCE=f4d9aaf4-ee50-47c0-b19c-f6e913332eb7 (optional)

Frontend (.env)
- Copy apps/frontend/.env.example to apps/frontend/.env (or use .env.local) and set:
  - VITE_API_URL=http://YOUR_IP:3001
  - VITE_OIDC_AUTHORITY=https://adfs.umc.local/adfs
  - VITE_OIDC_CLIENT_ID=<your_client_id_guid>
  - VITE_OIDC_REDIRECT_URI=http://YOUR_IP:5173/auth/callback

AD FS Application (Relying Party)
- Type: OpenID Connect (public client, no client secret) for SPA with PKCE.
- Redirect URIs: include http://YOUR_IP:5173/auth/callback (and/or http://localhost:5173/auth/callback for local dev).
- Issuer must be https://adfs.umc.local/adfs and discovery keys at /adfs/discovery/keys.
- Scopes: openid profile (default in this repo).

Running locally
1) API: `cd apps/api && npm i && npm run dev` (listens on 0.0.0.0:3001)
2) Frontend: `cd apps/frontend && npm i && npm run dev -- --host 0.0.0.0` (serves on 0.0.0.0:5173)
3) Visit http://YOUR_IP:5173 and use “Inloggen met AD (ADFS)”.

Notes
- Do not use https://0.0.0.0 for URLs; 0.0.0.0 is a bind address, not reachable from browsers. Use your host IP or localhost.
- JWT fallback (local users) is disabled when ADFS env vars are present. Admin endpoints still manage local app users/roles for authorization.


Optional frontend OIDC overrides (avoid discovery CORS)
- Some AD FS setups block CORS on `/.well-known/openid-configuration`, which prevents the SPA from discovering endpoints before redirecting.
- In that case, add one of the following to `apps/frontend/.env`:
  - Use discovery directly (if allowed):
    - `VITE_OIDC_METADATA_URL=https://adfs.umc.local/adfs/.well-known/openid-configuration`
  - Or bypass discovery with explicit endpoints (recommended):
    - `VITE_OIDC_AUTHORIZATION_ENDPOINT=https://adfs.umc.local/adfs/oauth2/authorize/`
    - `VITE_OIDC_TOKEN_ENDPOINT=https://adfs.umc.local/adfs/oauth2/token/`
    - `VITE_OIDC_END_SESSION_ENDPOINT=https://adfs.umc.local/adfs/oauth2/logout/`
    - `VITE_OIDC_ISSUER=https://adfs.umc.local/adfs`
    - `VITE_OIDC_JWKS_URI=https://adfs.umc.local/adfs/discovery/keys`
  - Optionally disable userinfo call (AD FS may not expose it):
    - `VITE_OIDC_LOAD_USERINFO=false`

Troubleshooting
- Button does nothing: open browser console.
  - If you see a CORS error to `/.well-known/openid-configuration`, use the overrides above.
  - If there is a TLS/certificate error on your AD FS hostname, the discovery fetch will fail; explicit endpoints avoid the pre-fetch and perform a top-level redirect.
- After login you get an error page: ensure the Redirect URI in AD FS exactly matches `VITE_OIDC_REDIRECT_URI` (scheme/host/port/path).
