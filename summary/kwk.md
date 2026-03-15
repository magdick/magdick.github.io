# vit_kwk-hosted-projects — Work Summary

Multi-brand Angular + PHP/Phalcon application serving KWK (customer-bring-customer) loyalty/bonus programmes for two brands: **freenet** and **klarmobil**. The project is a monorepo combining a Phalcon 5 PHP backend, a multi-project Angular frontend, and a Docker/Nginx container infrastructure.

---

## Backend

### Initial Application Setup & Architecture

Built the initial backend structure from scratch using the Phalcon 5 PHP framework. Implemented a layered architecture with controllers, services, validators, and models under `www/app/`. Configured CSRF protection using a session-based adapter rather than a plain session variable, and set up routing, bootstrapping, and CLI entry points.

### Azure AD SSO Integration (via vit_azure library)

Integrated the `vit_azure` Composer library to enable Azure Active Directory single sign-on. Built the `Authenticator` PHP class to handle the full OAuth2 flow: generating the authorization URL, managing state tokens, exchanging the auth code for an access token, and validating the returned token claims. Implemented a `SimpleJwt` helper for decoding JWT payloads locally. Added a `VitradoHttpClient` with an `HttpClientInterface` abstraction to proxy all calls to the appserver (v2 API), including forwarding authentication headers. Added a `PartnerProfileService` to fetch and manage the user's partner profile data.

### Appserver v2 Integration

Updated the backend to call the appserver v2 API instead of the original brewery endpoint. Changed the default URL routing to point at the correct v2 path and adjusted environment configurations for the stage environment accordingly.

### User & Personal Data Services

Implemented `UsersService` for fetching and updating user account data, and `PersonalDataService` for handling personal data separately from account data. Payment data (bank account, IBAN) is fetched directly from the source rather than proxied through appserver. Built backend validators for user data and personal data forms, including a rule that marks IBAN-like inputs starting with "XX" and ending with two digits as valid.

### Premiums (Prämien) Service

Created `PremiumService` and associated interfaces to support the bonus/premium programme integration. Exported the service through the shared service layer and integrated it into the backend routing and controller stack.

### Dashboard & Session Management

Implemented `DashboardService` for the main authenticated area. Added logic to force-logout any previous session when a new authentication token is received, ensuring stale sessions are invalidated on re-login. Handled `401 Unauthorized` responses from upstream APIs gracefully — triggering a logout flow rather than an unhandled error.

### Database SSL Configuration

Added SSL connection options to the database configuration to enforce encrypted connections.

---

## Frontend

### Multi-Brand Angular Monorepo Structure

Set up an Angular multi-project workspace (`www/frontend-app/`) with three projects: `freenet`, `klarmobil`, and a `shared` library. Both brand apps share all core components, services, and logic through the shared library, with per-brand entry points, environment configs, and assets.

### Authentication & Routing

Implemented the full authentication flow in Angular:
- `AuthGuard` updated to match the new Azure SSO-based logic.
- `UserGuard` added to automatically fetch user data on first load if the user already has a session.
- `ReturnLoginComponent` added to handle the OAuth2 callback URL, exchange the auth code for a session, and redirect the user.
- Login, logout, and user-menu components updated to work with the new session model.
- XSRF/CSRF handling refactored to use a session-based approach, with token forwarded on all state-changing requests.

### Layout, Homepage & Navigation

Built the main application layout component and homepage for both brands. Created a `MenuService` to centralise navigation state and menu items, separating concerns from the layout component. Added page URL constants to a shared constants file. Implemented the user-menu component with logout integration and a ping-based session validity check — if the user's session is no longer valid on the appserver side, they are logged out automatically.

### User Profile Page

Implemented the user profile page with form-based editing of personal data and payment/bank data. Applied brand-specific design overrides using SCSS. Rewrote validation messages for all form fields.

### Bonuses & Bonus Details

Built the bonuses list component and the bonus-details component for freenet and klarmobil, including traffic icons and associated styling. Updated the filter-form shared component with TypeScript types and accessibility improvements. Removed unused time fields from the datepicker.

### Shared Component Library

Contributed to and maintained the shared library (`projects/shared`), including:
- `filter-form` component with typed inputs and linting cleanup.
- `datepicker` and `datetimepicker` components — removed time display from the date-only picker.
- `attempt-login` component layout fix (centered text).
- `dialog-box` and `maintenance-page` components.
- Shared services: `UsersService`, `PremiumService`, `PersonalDataService`, `MenuService`, `LocalStorageService`, `RouteReuseService`, `CallService`.
- Shared interceptors and validators.

### Angular Migrations

Ran a full suite of Angular schematic migrations:
- `standalone` migration — converted all components to standalone.
- `inject` migration — replaced constructor injection with `inject()` function.
- Control flow syntax migration — replaced `*ngIf`/`*ngFor` with `@if`/`@for` blocks.
- Signal inputs migration — converted `@Input()` decorators to signal-based inputs.
- Self-closing tags migration — standardised template tags.
Updated SCSS and package dependencies to match.

---

## DevOps

### Docker Multi-Stage Container Setup

Built a Docker container setup with separate images: a PHP base image (`Dockerfile.base`) built on top of a shared Phalcon 5.9.3 / PHP 8.4 base, a PHP application image (`Dockerfile`), and an Nginx image (`Dockerfile.nginx`) which serves the pre-built Angular static files. Configured PHP-FPM pool settings, `php.ini`, and `opcache.ini` per environment (development, stage, production). Set correct file ownership for the application user (`zzzfoperator:www-data`).

### Local Development Environment

Maintained `docker-compose.yaml` for local development and `docker-compose.stage.yaml` for staging. Updated local container configurations to reflect infrastructure changes. Configured filesystem-based PHP sessions and corrected cookie settings in the local dev environment.

### Nginx Configuration

Managed the Nginx configuration for serving both brand frontends (`freenet`, `klarmobil`) and proxying PHP-FPM requests.

---

## CI/CD

### Container Builder Workflow

Set up the `container_builder.yml` workflow to build the PHP base, PHP application, and Nginx images on pushes to feature branches (excluding stage/production). Uses `filter_changes.yml` to detect which Dockerfiles or configs changed and only rebuilds affected images. Integrates with the shared `platform_builder` reusable workflow from `vit-workflow`. Supports both event-driven and manual `force-build` triggers via commit message keyword.

### Deploy Workflow

Built the `deploy.yml` pipeline triggered on pushes to `stage` and `production` branches. Orchestrates three parallel jobs: Angular build, PHP container build, and Nginx container build (which depends on the Angular artefact). After all three complete, deploys to the Kubernetes self-hosted runner environment. The Nginx build step embeds the Angular dist archive (`kwk-projects.tar.gz`) containing compiled output for both brands.

### Angular Build Workflow

Extracted the Angular build into its own reusable `build_angular.yml` workflow. Builds both `freenet` and `klarmobil` projects for the target environment (stage/production) using brand-specific npm scripts. Archives build output into a `.tar.gz` artefact, uploads it for use by the Nginx container builder step, and performs workspace cleanup after each run. Uses `@aikidosec/safe-chain` for supply-chain security during `npm install`.

### Aikido Security Scanning

Added the `@aikidosec/safe-chain` npm package to the install step in the Angular build workflow to protect against supply-chain attacks during CI builds. Also added Aikido scanning to the container builder workflow.

### Periodic Check & Vulnerability Scanning

Configured `periodic_check.yml` to run on a daily schedule and after every container builder run, scanning all images for vulnerabilities using a self-hosted Kubernetes runner.

### Filter Changes

Built the `filter_changes.yml` reusable workflow to detect changes in Dockerfiles, Nginx config, version files, and other tracked paths — outputting boolean flags consumed by the container builder to decide which images to rebuild.
