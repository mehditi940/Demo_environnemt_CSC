# AR Viewer Monorepo UMC

### Apps and Packages

- `api`: An API
- `frontend`: A frontend application
- `hololens`: A Hololens application
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/types`: `typescript` configurations

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting

### Build

To build all apps and packages, run the following command:

```
cd ar-viewer
npm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd ar-viewer
npm run dev
```

## ADFS (Active Directory) Login

- This repo supports AD FS via OpenID Connect for authentication.
- Backend validates ADFS JWTs using JWKS; local DB remains for app data.
- See `docs/adfs-setup.md` for environment variables and setup steps.
