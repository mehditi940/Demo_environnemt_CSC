// OIDC (AD FS) configuration for the SPA. Uses Vite env vars.
// Note: Never put a client secret in the frontend.

// Optional: allow bypassing metadata discovery (common AD FS CORS issue)
const metadataUrl = import.meta.env.VITE_OIDC_METADATA_URL;
// If explicit endpoints provided, supply full metadata to avoid any network fetch
const metadata = (() => {
  const authorization_endpoint = import.meta.env.VITE_OIDC_AUTHORIZATION_ENDPOINT;
  const token_endpoint = import.meta.env.VITE_OIDC_TOKEN_ENDPOINT;
  const end_session_endpoint = import.meta.env.VITE_OIDC_END_SESSION_ENDPOINT;
  const issuer = import.meta.env.VITE_OIDC_ISSUER || import.meta.env.VITE_OIDC_AUTHORITY;
  const jwks_uri = import.meta.env.VITE_OIDC_JWKS_URI;
  if (authorization_endpoint && token_endpoint && issuer) {
    return {
      authorization_endpoint,
      token_endpoint,
      end_session_endpoint,
      issuer,
      jwks_uri,
    };
  }
  return undefined;
})();

export const oidcConfig = {
  // For AD FS, authority should include '/adfs' so discovery resolves to '/adfs/.well-known/openid-configuration'
  authority: import.meta.env.VITE_OIDC_AUTHORITY || "https://adfs.umc.local/adfs",
  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID || "f4d9aaf4-ee50-47c0-b19c-f6e913332eb7",
  redirect_uri:
    import.meta.env.VITE_OIDC_REDIRECT_URI || "http://localhost:5173/auth/callback",
  // Authorization Code + PKCE (vereist door oidc-client-ts)
  response_type: "code",
  scope: import.meta.env.VITE_OIDC_SCOPE || "openid profile",
  // AD FS often blocks discovery CORS; provide metadata or metadataUrl
  ...(metadata ? { metadata } : {}),
  ...(metadataUrl && !metadata ? { metadataUrl } : {}),
  // AD FS userinfo endpoint may be unavailable; allow opt-out via env
  loadUserInfo: (import.meta.env.VITE_OIDC_LOAD_USERINFO || "false").toLowerCase() === "true",
  // Silent renew blijft mogelijk via authorize endpoint
  automaticSilentRenew: true,
};

