# bestellung — Work Summary

`bestellung` is the main freenet Group checkout and order management platform. It serves as the primary ordering flow for mobile tariffs across brands including **freenet**, **klarmobil**, **MegaSim**, and **mdmapu**. The codebase is a monorepo containing a **PHP/Phalcon backend**, a **multi-project Angular frontend** (checkout, CMS, shared library), and full **Docker + CI/CD** infrastructure.

---

## Frontend (Angular)

### Checkout Flow
- Built and maintained the complete multi-step checkout: personal data, SIM selection, payment, summary, and confirmation steps
- Implemented multi-brand support — separate SCSS theming, logos, and branding configurations for freenet, klarmobil, MegaSim, and mdmapu
- Added and refined offer display: tariff cards, price grids, period pricing, old price formatting, inclusive features, and discount handling
- Built and iterated the IBAN/BIC validation: backend-validated IBAN, conditional BIC display, account holder field, length enforcement
- Implemented SIM type selection (Triple SIM, eSIM, Both) with autochecking when only one option is available
- Added device unlock code input to the checkout flow; fixed crash when field was empty
- Built multicard (multi-contract) add-on selection component, including validation preventing step progression without full selection
- Implemented consent management: voucher consent, ad consent, GDPR consent templates, configurable popup timer with guard against back-navigation
- Added placeholder support per EECC provider and separate placeholder text per advertiser
- Built the exit-intent component and infobox components for the checkout pages
- Implemented linkout/forwarding URLs in checkout with sanitization
- Added recaptcha/Turnstile integration for phone number verification and form protection
- Built nationality dropdown with autocomplete and backend validation with shortcode auto-selection
- Refactored personal data, ID card, address, SIM card, and summary components to use the new shared library
- Implemented offer countdown timer (configurable enable/disable, popup-style, route guard preventing back)
- Added `tabindex` for keyboard accessibility on interactive elements
- Fixed form navigation: prevented back-step when current form is invalid

### CMS Panel
- Built and maintained the admin CMS for offers, advertisers, and orders
- Implemented full offer creation/editing: standard offers, virtual offers, business offers, and clone/duplicate
- Added drag-and-drop group reordering on the overview page and resolved group image upload persistence
- Built the recommended offers module with favorites and drag-to-top support
- Implemented additional options (add-on products): frontend dropdown/filter component, CMS offer integration, summary display, ACL rights, and datalayer events
- Added offer translation support: multilanguage fields on price grid, standard offer, and voucher translations with locale storage
- Built offer image handling: upload, resize, delete, S3 storage, WebP pipe in checkout, max-size validation
- Implemented offer expiry date display in CMS offer listings and edit view
- Added configurable fields: campaign code from additional options to EECC, bypass discounts attribute, custom footer links, tabbed page flags
- Built the recommended offers image auto-fetch from service code when no image is set
- Added admin logs with granularity and offer save validation reporting
- Extended filter-form component to support multiselect arrays; added filters for orders
- Implemented offer and order observable architecture — shared component observers for user change, offer updates, and order state

### Shared Library
- Refactored and extracted shared components into a standalone library consumed by checkout, CMS, and future projects
- Created entry points for interfaces used across all Angular projects
- Built reusable components: address form, ID card form, product image display, SIM card form, summary block, utility pipes
- Implemented padding/flex mixins and CSS variable system for consistent theming across brands
- Maintained Angular Material theming config for each brand (freenet, klarmobil, MegaSim)

### Angular Upgrades & Tooling
- Multiple Angular version upgrades (Material MDC migration, strict TypeScript flags, ESLint setup)
- Configured ESLint across all Angular projects with auto-lint script scoped to source paths
- Migrated from `tslint` to `eslint`, removed deprecated `protractor`, updated `karma`, `jasmine`, and `@types`
- Enabled lazy route loading for all feature modules; refactored route-based component loading
- Added `crossorigin` to Angular build config; updated hash generation for build outputs

---

## Backend (PHP / Phalcon)

### Order Processing
- Built and maintained the core order processing pipeline: status management, order creation, duplication, fraud checks, and approval flow
- Implemented configurable order creation limits per offer; added per-offer max-order checks
- Added order history URL to confirmation emails
- Implemented auto-confirmation logic (only if non-fraudulent and within 2-day window)
- Built order CSV processing pipeline: download from remote FTP/SFTP, parse, map fields to internal schema, apply state transitions, respond back to partner
- Refactored order statuses as named constants throughout the pipeline
- Built lockfile-to-job migration: replaced file-based locking with proper job-queue locking for all cron-triggered workers
- Added retry logic for failed FTP file processing, tracking attempt count and reset conditions
- Implemented multi-file and multi-order processing with resource usage caps (limited per-run counts, memory-safe subqueries)
- Built a job to reprocess offers that need reimport with flag management for fetched/sent states
- Added response generation for all CSV/FTP flow conditions (missing, failed, not-ready)

### Offer Management
- Extended offer model with many configurable fields: tariff variants, multicard config, bypass pricing, additional options, voucher settings, identity options, image resources, placeholder texts
- Built `VariantId` class and variant fetching service integrated into offer saving
- Added offer cloning with reset of multicard parameters when cloning standard → virtual
- Implemented offer archiving field and related filtering
- Built offer additional options (add-on products) as a separate DB table (`offer_additional_options`), with full model, service, adapter, and migration
- Added support for service code-based logo fetching within offers
- Extended `OffersService` with multicard data methods, adapters, and unit tests
- Added revenue calculation for one-time discounted prices
- Implemented multi-format price string handling (comma decimal formatting, period removal)

### Advertiser & Partner Management
- Extended advertiser model with template name, identity settings, FTP password placeholder (masked in listings), and image upload config
- Added per-advertiser domain list in config for easy switching
- Built the identity module: request/verify flow, message interpretation, customisable identity fields per advertiser
- Added campaign code dialogs, additional parameter parsers, and EECC offer validator extensions
- Implemented per-advertiser access restriction flag for traffic control
- Built the exclusion model and backend enforcement for excluded offer combinations

### FTP / SFTP Integration
- Refactored FTP/SFTP download service: abstracted fetch into own service, added connection health checks, garbage collection, error continuation on partial failures
- Added support for FTP lib key-based authentication (key content instead of key file path)
- Implemented `fetched_ftp` / `sent_ftp` state tracking as string columns for precision
- Added column mapping support: same incoming column mapped to multiple local fields

### Database & Migrations
- Authored all DB migrations for the above features: new columns, new tables, index updates, droppable/restorable revision table
- Configured Phinx for migration management
- Added SSL/PDO connection switch for all database connections
- Added model relationships and service methods for new entities throughout

### Email & Notifications
- Built and maintained transactional email templates: confirmation, reminder, identity, consent, legal notes
- Added locale/order language to confirmation emails with translated content
- Implemented reminder email scheduling and admin disable-reminder control
- Added `mailto` unsubscribe link handling; extended email queries

### Unit Testing
- Authored and maintained unit tests across: `OffersService` (multicard, adapters), `FetchFiles`, `PersonalDataService`, backup management utilities, `UsersService`, job classes, and validator methods
- Fixed cache clearing between tests, mock injection, and test isolation issues

---

## DevOps & Infrastructure

### Docker
- Designed and maintained the multi-container Docker setup for `bestellung`: PHP/Phalcon backend, Angular CMS frontend, Nginx, Redis, worker containers
- Split docker-compose into separate files for local development and production
- Configured Nginx Dockerfiles and mount scripts for reproducible container builds
- Added PM2 to the Angular serve container to prevent crash-loop overload
- Built the Angular Dockerfile and integrated it into the docker-compose; configured separate environments (local, stage, production)
- Added `docker-sync` file for macOS dev environments; configured `node_modules` to be excluded from sync
- Maintained PHP base images: added/removed extensions (iconv, bcmath, imagick), updated Phalcon base image usage
- Configured cron container and worker auto-restart on reboot
- Added `php.ini` tuning for production (body size, post values)
- Migrated from self-managed Nginx to containerised Nginx with configurable domain routing
- Added `.gitignore` rules scoped to Docker-specific folders to prevent environment leaks

### Nginx
- Maintained domain-specific Nginx configs for all environments: freenet, klarmobil, MegaSim, mdmapu, geschaeftskunden subdomains
- Added service worker (`sw`) config and font serving with proper `rel` preloading
- Configured nginx caching for static assets
- Fixed gzip compression conflict with `woff2` font serving (disabled gzip for woff2 explicitly)
- Added GIF serving support; configured image handler in Nginx
- Updated Nginx rules for inclusive features limits increases
- Added and maintained CSP headers per domain in Nginx configs; added Cloudflare-specific CSP entries
- Configured Traefik as reverse proxy for local development with per-project routing
- Added nginx syntax check as a container build step

### Content Security Policy (CSP)
- Managed and extended CSP across all environments: checkout, CMS, domain-specific overrides
- Added Cloudflare entries, Google Tag Manager domains, custom script/image/frame-src entries
- Added CSP for local/dev environment
- Fixed CSP for font self-hosting and external CDN cross-origin resources
- Progressively hardened CSP across all Nginx domain configs

### Local Development Setup
- Built `start-backend.sh` with documentation, environment switching (stage/prod), and kill switches for error states
- Set up Traefik configuration with per-subdomain routing for all bestellung services
- Configured proxy files per environment and proxy config for Angular local dev
- Added DNS entries and folder structure auto-creation for public paths
- Built `package.json` scripts for project setup, linting, and environment preparation

---

## CI/CD

### GitHub Actions Workflows
- Designed and built the container builder workflow from scratch: multi-stage Docker builds, GitHub Container Registry push, environment detection, trivy security scanning, SARIF upload, auto GitHub issue creation on scan failure
- Added QEMU and Buildx for multi-architecture support within the pipeline (ARM64 + AMD64)
- Integrated reusable container builder called from per-service workflows
- Configured skip-check logic (manual run bypass, change detection)
- Implemented periodic check workflow for container drift detection
- Separated security scan from build action for independent scheduling
- Updated action to use `force-build` trigger via commit message flag
- Added auto-cancel for outdated runs, cleanup steps, and Gist-based build summary output
- Fixed action execution order, token management, and environment variable consistency
- Added deployment workflow: staged takedown of old containers → build → deploy → auto-restart on each server sequentially
- Integrated Angular build step into CI: configured `build_angular` workflow with environment-aware hash output
- Added Aikido security scanning to the Angular build workflow
- Maintained stage and production deployment scripts with deployment environment names and secrets
- Switched to Node 24 for Angular build in CI; updated deploy action to latest ssh-action version
- Updated runner types; adjusted action composition for consistency across workflows
