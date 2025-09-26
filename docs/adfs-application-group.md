# Choosing the right ADFS Application Group template

When you rebuild your ADFS configuration for this project you should create **one Application Group** that contains both the SPA client and the protected API. The easiest way to achieve that is to use the built-in template **"Web browser accessing a web application"**. This template adds two entries at once and keeps the redirect URI, audience and scopes in sync with the code base.

Follow these steps when recreating the Application Group:

1. **Create the group** – pick the *Web browser accessing a web application* template and give the group a descriptive name (for example `UMC Webapp`).
2. **Configure the web application** – note the generated client identifier and add every redirect URI you need (`https://192.168.174.128:5173/auth/callback` for local testing, plus any production hosts). Leave the client secret empty because the SPA is a public client.
3. **Configure the Web API** – set the identifier/audience to the GUID expected by the backend (`20e03704-1730-459f-b870-79575741ac32`). Add scopes such as `openid profile email` if they are not prefilled and keep the default token lifetime unless you have specific requirements.
4. **Assign permissions** – allow the SPA client to access the Web API entry. The built-in "Permit everyone" rule is fine for initial testing.
5. **(Optional) Rotate credentials** – if you need a secret or certificate for server-to-server communication, add it under the Web API entry of the same group.
6. **Copy the metadata values** – use the issuer (`https://adfs.umc.local/adfs`), JWKS URI and authorization/token endpoints from the federation metadata to populate your `.env` files.

- **Web application (client)** – configure this as a *public* client because the Vite frontend runs entirely in the browser and cannot keep a secret. Use the SPA redirect URI (for example `https://192.168.174.128:5173/auth/callback`). You do not need a shared secret for this client.
- **Web API (resource)** – register the API identifier (for example the GUID `20e03704-1730-459f-b870-79575741ac32`) so that access tokens issued for the SPA are scoped to your backend.

This single Application Group allows the SPA to authenticate users via ADFS and call the API with the same access token. You only need a **Native application** entry when you ship a desktop/mobile client that can use the system browser and store secrets locally. You only need a standalone **Server application** when you run a confidential backend that authenticates directly (client credentials).

If you must rotate the credentials for the API, add a certificate or client secret under the **Web API** section of the same Application Group—there is no need to create a separate Application Group for the API. This keeps management simple and matches the expectations of the code in this repository.
