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
  await manager.signinRedirect();
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

