# Choosing the right ADFS Application Group template

When you rebuild your ADFS configuration for this project you should create **one Application Group** that contains both the SPA client and the protected API. The easiest way to achieve that is to use the built-in template **"Web browser accessing a web application"**. This template adds two entries at once:

1. **Web application (client)** – configure this as a *public* client because the Vite frontend runs entirely in the browser and cannot keep a secret. Use the SPA redirect URI (for example `https://192.168.174.128:5173/auth/callback`). You do not need a shared secret for this client.
2. **Web API (resource)** – register the API identifier (for example the GUID `20e03704-1730-459f-b870-79575741ac32`) so that access tokens issued for the SPA are scoped to your backend.

This single Application Group allows the SPA to authenticate users via ADFS and call the API with the same access token. You only need a **Native application** entry when you ship a desktop/mobile client that can use the system browser and store secrets locally. You only need a standalone **Server application** when you run a confidential backend that authenticates directly (client credentials).

If you must rotate the credentials for the API, add a certificate or client secret under the **Web API** section of the same Application Group—there is no need to create a separate Application Group for the API. This keeps management simple and matches the expectations of the code in this repository.
