// OIDC (AD FS) configuration for the SPA. Uses Vite env vars.
// Note: Never put a client secret in the frontend.

const fallbackRedirect = (() => {
  if (import.meta.env.VITE_OIDC_REDIRECT_URI) {
    return import.meta.env.VITE_OIDC_REDIRECT_URI;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin.replace(/\/$/, "")}/auth/callback`;
  }
  return "https://192.168.174.128:5173/auth/callback";
})();

export const oidcConfig = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY || "https://adfs.umc.local/adfs",
  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID ||
    "20e03704-1730-459f-b870-79575741ac32",
  redirect_uri: fallbackRedirect,
  response_type: "code",
  scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile email",
  loadUserInfo: true,
};

