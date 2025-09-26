// OIDC (AD FS) configuration for the SPA. Uses Vite env vars.
// Note: Never put a client secret in the frontend.

export const oidcConfig = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY || "https://adfs.umc.local/adfs",
  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID ||
    "20e03704-1730-459f-b870-79575741ac32",
  redirect_uri:
    import.meta.env.VITE_OIDC_REDIRECT_URI ||
    "https://192.168.174.128:5173/auth/callback",
  response_type: "code",
  scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile email",
  loadUserInfo: true,
};

