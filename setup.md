Setup voor ADFS-integratie (SPA + Web API)

Doel

- ADFS integreren voor SPA + Web API, met role-based redirect:
  - Gebruikers in groep `umc-chirurgen` gaan naar `/chirurg/dashboard`
  - Gebruikers in groep `Domain Admins` gaan naar `/admin/dashboard`

AD FS (Application Group)

- Type: "Native application accessing a web API"
- Native Application (SPA)
  - `client_id`: `45167895-9fc7-456f-bb1f-9a16cae69194`
  - Redirect URI: `http://localhost:5173/auth/callback`
  - Permitted to access: jouw Web API (zie hieronder)
- Web API
  - Identifier (audience): `api://umc-webapp`
  - Issuance Transform Rules (groepen → eenvoudige rollen)
    - Domain Admins → Outgoing claim type: `Role`, Outgoing value: `admin`
    - umc-chirurgen → Outgoing claim type: `Role`, Outgoing value: `chirurg`
  - Alternatief (Custom Rule via group SID):
    - Domain Admins → admin
      `c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid", Value == "{SID-DOMAIN-ADMINS}"] => issue(Type = "role", Value = "admin");`
    - umc-chirurgen → chirurg
      `c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid", Value == "{SID-UMC-CHIRURGEN}"] => issue(Type = "role", Value = "chirurg");`

Backend (.env voor API runtime)

- Bestand: `apps/api/.env`
  - `PORT=3001`
  - `DB_FILE_NAME=file:./dev.sqlite`
  - `API_URL=http://localhost:3001`
  - `FRONTEND_URLS=http://localhost:5173`
  - `STORAGE_PATH=./uploads`
  - `STUN_SERVERS=stun:stun.l.google.com:19302`
  - ADFS/OIDC:
    - `ADFS_OIDC_ISSUER=https://adfs.umc.local/adfs`
    - `ADFS_OIDC_LEGACY_ISSUER=http://adfs.umc.local/adfs/services/trust`
    - `ADFS_OIDC_JWKS_URI=https://adfs.umc.local/adfs/discovery/keys`
    - `ADFS_OIDC_AUDIENCE=api://umc-webapp`
    - `ADFS_DEFAULT_ROLE=admin`
    - Mapping (role of group; beide toegestaan):
      - `ADFS_ROLE_MAP_ADMIN=admin`
      - `ADFS_ROLE_MAP_SURGEON=chirurg`
      - `ADFS_GROUP_ADMIN=Domain Admins`
      - `ADFS_GROUP_SURGEON=umc-chirurgen`
      - `ADFS_ROLE_CLAIMS=role,roles,groups,group,groupsid`

Backend (codepunten)

- `services/passport.ts`
  - ADFS JWT strategie met JWKS
  - `issuer`: lijst met toegestane issuers: `[ADFS_OIDC_ISSUER, ADFS_OIDC_LEGACY_ISSUER?]`
  - `audience`: `api://umc-webapp`
  - Claimparsing uit `role/roles/groups/group/groupsid`
  - Bepaalt `user.uiRole` op basis van env‑mapping:
    - role = `admin` → uiRole `admin`
    - role = `chirurg` → uiRole `chirurg`
    - of match op `ADFS_GROUP_ADMIN` / `ADFS_GROUP_SURGEON`
  - Backend `user.role`:
    - uiRole `admin` → `admin`
    - anders → `ADFS_DEFAULT_ROLE` (bijv. `user`)
- `routes/auth/authRouter.ts`
  - `GET /auth/me` geeft `id, email, role, uiRole, groups`
  - Update autorisatie: "admin" (ADFS) heeft beheerrechten (met veiligheidsrails voor `system` en peer‑admin)
- `services/authorizationMiddleware.ts`
  - Behandelt `admin` (of `uiRole: admin`) als voldoende voor routes die eerder `super-admin` vereisten
- `index.ts`
  - `app.use(passport.initialize())`
  - Registreer strategieën, incl. `"adfs-jwt"`

Frontend (.env.local voor SPA)

- Bestand: `apps/frontend/.env.local`
  - `VITE_API_URL=http://localhost:3001`
  - `VITE_OIDC_AUTHORITY=https://adfs.umc.local/adfs`
  - `VITE_OIDC_CLIENT_ID=45167895-9fc7-456f-bb1f-9a16cae69194`
  - `VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback`
  - `VITE_OIDC_SCOPE=openid profile`
  - Belangrijk (audience/resource): `VITE_OIDC_RESOURCE=api://umc-webapp`

Frontend (codepunten)

- `src/service/oidcConfig.js`
  - Stuurt `resource=VITE_OIDC_RESOURCE` mee in authorize + token request
- `src/ui/pages/AuthCallback.jsx`
  - Na `completeLogin()` → `/auth/me` → role‑based redirect:
    - uiRole `chirurg` → `/chirurg/dashboard`
    - uiRole `admin` of backend `role` admin/super-admin → `/admin/dashboard`
- `src/ui/components/auth/ProtectedRoute.jsx`
  - Houdt rekening met `uiRole` en mapt `uiRole: "chirurg"` naar route‑rol `"surgeon"`
  - Behandelt `super-admin`/`system` als `admin` voor route‑toegang

Verifiëren

- Herstart API en frontend (Vite)
- Login chirurg:
  - `/auth/me` → `uiRole: "chirurg"` → blijft op `/chirurg/dashboard`
- Login Domain Admins:
  - `/auth/me` → `uiRole: "admin"` → blijft op `/admin/dashboard`
- DevTools snelle checks:
  - Network: `authorize` en `/oidc/token` bevatten `resource=api://umc-webapp`
  - Console: access_token payload `aud === "api://umc-webapp"`
  - `/auth/me` geeft 200 met `uiRole`

Troubleshooting

- `/auth/me` → 401
  - Controleer Authorization header en API .env (issuer/audience)
  - JWKS TLS: gebruik `NODE_EXTRA_CA_CERTS` met je AD FS root CA PEM (prod); tijdelijk dev‑flag alleen voor testen
- `aud = urn:microsoft:userinfo`
  - Voeg `VITE_OIDC_RESOURCE=api://umc-webapp` toe en herstart Vite
  - Koppel in AD FS: Native → Web API (Permitted to access)
- `uiRole` blijft `user`
  - Voeg in AD FS Web API rules toe: Role = `admin` / `chirurg` uit group membership
  - Of gebruik group‑mapping en zorg dat parser niet op spaties splitst (alleen `,` of `;`)

Production tips

- TLS trust: configureer `NODE_EXTRA_CA_CERTS` met AD FS root CA (geen insecure flags)
- CORS: beperk `FRONTEND_URLS` tot echte origins
- Logging: minimaliseer PII in logs; log oorzaken van 401/403 beknopt

Samenvatting

- AD FS: Application Group (Native + Web API), Web API `api://umc-webapp`, rules → Role = `admin`/`chirurg`
- Frontend: `VITE_OIDC_RESOURCE=api://umc-webapp`, client_id ingesteld, callback op localhost
- Backend: issuer/audience correct, role/uiRole mapping actief, `/auth/me` aanwezig
- Resultaat: `umc-chirurgen` → `/chirurg/dashboard`, `Domain Admins` → `/admin/dashboard`

