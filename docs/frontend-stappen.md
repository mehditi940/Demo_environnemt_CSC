# Frontend stappen

1. Pak de map `joris_frontend` en zet alle bestanden in `apps/frontend` (laat `.env.local` staan).
2. Controleer of `apps/frontend/package.json` deze versies heeft:
   - `three`: `^0.174.0`
   - `@react-three/fiber`: `^9.1.0`
   - `@react-three/drei`: `^10.0.4`
   - `oidc-client-ts`: `^3.0.1`
3. Zet in `.env.local` of `env.example` de AD FS gegevens:
   - `VITE_API_URL`
   - `VITE_OIDC_AUTHORITY`
   - `VITE_OIDC_CLIENT_ID`
   - `VITE_OIDC_REDIRECT_URI`
4. Voer in de map `apps/frontend` uit:
   - `npm install`
   - `npm run build` (controle)
   - `npm run dev` (starten)
5. Bij AD FS inloggen: gebruik de knop “Inloggen met AD (ADFS)”.
6. Als de build klaagt over grote bundles, laat het zo of voeg later code-splitting toe.
