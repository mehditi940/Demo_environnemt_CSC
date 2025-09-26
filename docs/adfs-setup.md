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

