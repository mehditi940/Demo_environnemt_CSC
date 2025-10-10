import { UserManager, WebStorageStateStore, Log } from "oidc-client-ts";
import { oidcConfig } from "./oidcConfig";

// Optional logging for debugging OIDC flows
if (import.meta.env.VITE_OIDC_DEBUG === "true") {
  Log.setLogger(console);
  Log.setLevel(Log.DEBUG);
}

const manager = new UserManager({
  ...oidcConfig,
  // Persist user/tokens in localStorage for SPA refreshes
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export async function loginWithAdfs() {
  try {
    if (import.meta.env.VITE_OIDC_DEBUG === "true") {
      // Useful to verify at runtime what we will use for redirect
      // eslint-disable-next-line no-console
      console.log("OIDC settings", manager.settings);
    }
    const resource = import.meta.env.VITE_OIDC_RESOURCE;
    // Ensure AD FS receives the 'resource' param on authorize request
    await manager.signinRedirect(
      resource ? { extraQueryParams: { resource } } : undefined
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("signinRedirect error", e);
    alert("Kon niet doorverwijzen naar AD FS. Open de console voor details.");
  }
}

export function dumpOidcEnv() {
  // Quick helper to inspect env-derived settings in the browser console
  // eslint-disable-next-line no-console
  console.log({
    VITE_OIDC_AUTHORITY: import.meta.env.VITE_OIDC_AUTHORITY,
    VITE_OIDC_CLIENT_ID: import.meta.env.VITE_OIDC_CLIENT_ID,
    VITE_OIDC_REDIRECT_URI: import.meta.env.VITE_OIDC_REDIRECT_URI,
    VITE_OIDC_AUTHORIZATION_ENDPOINT: import.meta.env.VITE_OIDC_AUTHORIZATION_ENDPOINT,
    VITE_OIDC_TOKEN_ENDPOINT: import.meta.env.VITE_OIDC_TOKEN_ENDPOINT,
    VITE_OIDC_END_SESSION_ENDPOINT: import.meta.env.VITE_OIDC_END_SESSION_ENDPOINT,
    VITE_OIDC_ISSUER: import.meta.env.VITE_OIDC_ISSUER,
    VITE_OIDC_JWKS_URI: import.meta.env.VITE_OIDC_JWKS_URI,
  });
}

export async function completeLogin() {
  const user = await manager.signinRedirectCallback();
  // Keep compatibility with existing API handler expecting localStorage key
  if (user?.access_token) {
    localStorage.setItem("authToken", user.access_token);
  }
  return user;
}

export async function getCurrentOidcUser() {
  return manager.getUser();
}

export async function logoutAdfs() {
  await manager.signoutRedirect({
    post_logout_redirect_uri:
      import.meta.env.VITE_OIDC_LOGOUT_REDIRECT_URI || window.location.origin,
  });
}

export default manager;
