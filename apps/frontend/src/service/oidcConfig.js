// OIDC (AD FS) configuration for the SPA. Uses Vite env vars.
// Note: Never put a client secret in the frontend.

export const oidcConfig = {
  // For AD FS, authority should include '/adfs' so discovery resolves to '/adfs/.well-known/openid-configuration'
  authority: import.meta.env.VITE_OIDC_AUTHORITY || "https://adfs.umc.local/adfs",
  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID || "288ad0b2-91c9-42ab-aec0-19bf846af35f",
  redirect_uri:
    import.meta.env.VITE_OIDC_REDIRECT_URI || "http://localhost:5173/auth/callback",
  response_type: "code",
  scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile",
  loadUserInfo: true,
};

