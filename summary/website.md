# vitrado_website — Work Summary

The vitrado public website and CMS admin panel — a **PHP / Phalcon** backend serving the main `www.vitrado.de` site and a separate `cms.vitrado.de` Angular admin interface. The repo includes the PHP application, an Angular CMS admin app, a styleguide submodule, Nginx configuration, Docker container setup, and a full CI/CD pipeline.

---

## Backend

### Session & Authentication Security

Implemented proper session security at login: regenerated the session ID on login to prevent session fixation attacks (aligned with the approach used in the `bestellung` repo). Added a Redis session key prefix to namespace session data and avoid key collisions across apps. Changed logout to remove the old session and create a new session ID rather than just clearing session data.

### News Feature Flag

Added a backend feature flag to globally control access to the news section. When disabled, all news endpoints return 404 and the frontend skips rendering the news section entirely.

### Auth Guard Refactoring

Refactored the Angular auth guard to use a cleaner, more testable structure.

### Link Rel & Security Attributes

Audited and updated all external links across the CMS and frontend to include proper `rel` attributes (`noopener`, `noreferrer`). Extended the CMS editor to auto-inject `rel` values on link creation. Updated `vendor.js` (interact.js) to auto-add rel tags. Fixed WhatsApp URL definitions and footer links that were missing rel attributes.

### Composer & PHP Cleanup

Removed the dev composer configuration from the production codebase. Fixed formatting issues and added an `.editorconfig` to enforce consistent whitespace across the project.

### ACL Reset & Minification

The deploy pipeline runs `resetAcl` and `minification.php` CLI commands inside the PHP container post-deploy to rebuild access control lists and re-minify static assets after each deployment.

### Database Migrations

Maintained the Phalcon migrations infrastructure.

---

## Frontend

### Angular CMS Admin App (`admin-app`)

Maintained the CMS admin Angular application (`www/admin-app/`), which is built separately from the PHP-rendered public site and served under `cms.vitrado.de`.

**Angular version upgrades (sequential):**
- Upgraded Angular from v8 through v9, v10, v11, v12, v13, v14, all the way to **v17** and subsequently **v18** over multiple work items.
- Each upgrade included updating core packages, Angular Material, `tsconfig`, `browserslist`, and build paths.
- Ran the Angular Material MDC migration (component DOM structure changes).
- Ran `ng update` migrations for standalone components conversion.
- Removed deprecated `polyfills`. Added routing titles.
- Removed `protractor` (deprecated, near EOL) from the test setup.
- Updated `karma`, `karma-chrome-launcher`, `karma-jasmine`, `jasmine-core`, `@types/jasmine`, `@types/node`, `typescript`, `rxjs`, `tslib`, `ts-node` packages.
- Removed `tslint` and migrated to ESLint.
- Updated package build paths and `tsconfig` for the new project structure.
- Added `@aikidosec/safe-chain` to the Angular build workflow for supply-chain security on npm install.

**Filtering & sorting UI:**
- Implemented a sorting and multi-select filter component during the Angular upgrade work, replacing a legacy implementation.

**Styleguide vendor update:**
- Updated the `vitrado_styleguide` submodule vendor files.
- Updated the gitignore to exclude `node_modules` inside the styleguide.
- Documented the correct `sass` version required to regenerate vendor files.

**SVG Logo update:**
- Updated the SVG logo and logo colours in the admin app.

**Responsive fixes:**
- Fixed the glossary component and updated the multiselect style after the Material MDC migration.

---

## DevOps

### Docker Container Setup

Built and maintained a multi-container Docker setup for the website:
- `Dockerfile.base` — PHP base image.
- `Dockerfile.phalcon` — Phalcon PHP application image (dev and prod/stage variants).
- `Dockerfile.nginx` — Nginx image serving both `www.vitrado.de` (PHP-rendered) and `cms.vitrado.de` (Angular SPA).

Maintained per-environment Docker Compose files (`docker-compose.yaml`, `docker-compose.stage.yaml`, `docker-compose.production.yaml`).

Fixed user UID conflicts in Docker image builds: updated the `foperator`/`www-data` user UID to avoid conflicts with the host system, tried multiple approaches before finding the correct fix with existing user UID changes. Added deployment scripts to set up users correctly.

Mapped shared volumes between the PHP and Nginx containers for serving static files. Added an explicit public folder creation in the Dockerfile to avoid missing directory errors. Added a volume for externally managed files (partner assets).

Migrated from `vagrant`-based local setup to Docker Compose for local development. Cleaned up leftover Vagrant config files and references.

Switched deployment commands from `docker-compose` (v1) to `docker compose` (v2 plugin syntax).

### Nginx Configuration

Maintained separate Nginx virtual host configs for development, staging, and production environments, covering:
- `www.vitrado.de` — PHP-FPM proxied public website with static asset serving.
- `cms.vitrado.de` — Angular SPA (`admin-app`) with HTML5 pushstate routing fallback.
- A shared `call/service/` location block for PHP API calls served on both domains.

**Content Security Policy (CSP) — extensive work:**
- Iteratively built and tightened the CSP policy for the website across many iterations.
- Added `nonce`-based CSP for inline scripts and styles, tested Angular nonce injection.
- Added `img-src`, `style-src`, `script-src`, subfilter directives, and sub-filter-based nonce injection via Nginx.
- Removed nonce from styles after testing showed it was unnecessary.
- Added and tuned additional HTTP security headers (`Referrer-Policy`, `X-Frame-Options`, etc.).
- Removed server tokens and headers that leak version information.
- Disabled folder navigation in Nginx.

Applied the new base Nginx image (`vit-nginx`) from the shared `vit-nginx` repository, replacing the old image reference.

Added Nginx logs volumes. Added the Nginx logs folder entry in Docker Compose.

Fixed the Nginx `APP_ENV` environment variable to be correctly set per environment.

Updated the v2 URL reference in the Nginx config to point at the correct v2 service endpoint.

Updated the program description page and removed an outdated hover image. Updated the CSP policy to reflect these content changes.

---

## CI/CD

### Container Builder Workflow

Built `container_builder.yml` using the shared `vit-workflow` `platform_builder` reusable workflow for the base, dev PHP, and Nginx images. Triggered on feature branch pushes to changed Dockerfile/Nginx config paths. Supports `force-build` via commit message keyword and manual dispatch.

### Deploy Workflow

Built `deploy.yml` triggered on pushes to `stage` and `production` branches. Pipeline steps:
1. Build Angular admin app via `build_angular.yml`, producing a `website-projects.tar.gz` artefact with the `admin` build.
2. Build PHP container (parallel with Angular).
3. Build Nginx container (depends on Angular artefact, extracts `admin` target).
4. Deploy over SSH:
   - Stop and remove existing containers using the environment-specific compose file.
   - Pull latest Git changes on the server via a shared `pull_changes` composite action.
   - Pull new Docker images, bring up containers with `docker compose up -d`.
   - Prune old images.
   - Run post-init scripts inside the PHP container: `resetAcl` and `minification.php`.
   - Fix file ownership on the public folder (`chown www-data`).
   - Workspace cleanup.

Worked through extensive iteration to get the initial deployment pipeline functioning: debugging image name passing, manifest creation, multi-platform ARM builds (x86_64 and arm64/v8), secret inheritance, container startup ordering, and volume mounting. Added the production deployment job after confirming stage worked.

### Angular Build Workflow

Maintained `build_angular.yml` to build the `admin-app` Angular project for the target environment, archive it as `website-projects.tar.gz`, upload it as a GitHub Actions artefact, and pass the artefact name to the Nginx container build step. Added `@aikidosec/safe-chain` to protect npm install from supply-chain attacks during CI.

### Periodic Check

Configured `periodic_check.yml` for scheduled daily vulnerability scanning of container images.

### Filter Changes

Maintained `filter_changes.yml` for change-based selective rebuilds of each image type.
