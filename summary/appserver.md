# vit_appserver — Work Summary

`vit_appserver` is the central PHP application server for the vitrado platform. It handles partner management, KWK (Kunden-werben-Kunden / referral) program logic, MICOS user authentication, statistics generation, newsletter sending, IBAN/bank data validation, ad content serving, and integration with external services (AWIN, Azure SharePoint, SFTP/FTP, SQS). It is a legacy PHP codebase running on a custom framework with Smarty templating, gradually modernised during this period.

---

## Backend (PHP)

### Full mysqli → PDO Migration
- Migrated the entire appserver codebase from raw `mysqli` to PDO prepared statements across all major files: `ads.php`, `database.php`, `newsletter`, `sanitize_statistics.php`, `BaseAdvertiserStrategy`, `remove-offensive-subids`, and all utility methods
- Refactored `exec_query` callers to use PDO-native execution throughout
- Replaced all `getPdoConnection()` usages with a unified connection method and removed secondary/tertiary legacy database references
- Added SSL/PDO connection switch: enabled encrypted DB connections via config flag
- Set DB connection timeout to 10 seconds to handle latency without hard crashes
- Moved SQL building outside of loops to reduce per-iteration execution overhead
- Optimised `rebuild_views` to prepare statements once outside the loop rather than per iteration
- Removed empty parameter arrays passed unnecessarily to prepared statement execution
- Fixed charset handling after PDO migration; fixed return type on view calculation method
- Cleaned up all commented-out `exec_query` and `get_connection` legacy remnants after migration

### KWK (Referral Program) — Partner & Login Flow
- Removed the old KWK magic link endpoint and all legacy KWK login methods after the v2 migration
- Added MICOS user lookup to the login check response: appserver now returns MICOS data directly on authentication rather than requiring a secondary call
- Built the appserver middleware layer so KWK calls route through it correctly
- Added support for multiple PDF documents in the KWK partner sync flow
- Added null/empty-array guard on MICOS sync: if MICOS returns nothing, sync stops rather than processing empty state

### Partner & Advertiser Management
- Authenticated advertiser context when storing contact data to ensure data is scoped correctly
- Added partner email change JSON method for correct response handling from the services gateway
- Added response type return for `servicesGW` calls for consistent API contract
- Added program URL to the KWK email process and partner signup; marked the old method as deprecated
- Built and maintained the partner tracking link fetching with improved reliability
- Removed binary conversion from the partner update query that was causing encoding issues
- Added chrome emulation in curl requests for more accurate response status codes from external services
- Formatted curl logs for easier debugging of outbound requests

### Statistics & Reporting
- Rebuilt the statistics regeneration system: enqueues per-sale statistics recalculation jobs with each sale's date, processed by a secondary appserver instance
- Added commission date-based selection logic and converted dates to timestamps for consistent queuing
- Added cronjob to run the statistics regeneration queue
- Added caching of AWIN data via a dedicated Redis database to reduce external API load
- Cleaned up the export data Excel method; removed unused `phpExcelCreator` library
- Removed unused statistics JSON files from the codebase; enabled cleanup cron
- Added log-analyzer folder for structured access log processing
- Added DEM (digital media) logs to Docker volume with compression support

### IBAN / Bank Data Validation
- Built a dedicated IBAN lookup method: checks IBAN validity, retrieves bank name and BIC, and handles non-DE IBANs where BIC is not mandatory
- Added BIC suffix padding for non-DE BICs shorter than 11 characters
- Set bank name to `TBA` when IBAN is valid but no bank name is returned by the lookup service
- Removed redundant BIC validity check during bank data retrieval
- Cleaned up old IBAN/BIC methods replaced by the new lookup
- Made account holder field optional in bank data storage

### Deeplink & Ad URL Handling
- Extended `fieldOverride` to accept `target` and `rel` attributes; extracted deeplink URL and built the link if present
- Applied the same deeplink URL logic uniformly across all ad types
- Reordered deeplink edit/view fields for better usability in the CMS
- Disabled redundant backend URL validation when a deeplink URL is already set

### Maintenance Mode & Deployment Utility
- Implemented `enable` / `disable` maintenance mode in `IndexController` backed by a Redis cache flag
- Added `BASE_CACHE` constant to centralise the cache key prefix
- Added domain validation and CLI detection utility functions to the Redis availability check
- Enhanced Redis V2 availability check to be more robust before attempting cache operations

### Email & Newsletters
- Built email template for accounts created via v2 to maintain transactional consistency
- Fixed environment name being printed into the email body instead of being suppressed
- Made dev environment emails route through a mock service to prevent accidental sends
- Refactored newsletter and `create-nl` flows to use PDO exclusively
- Added program URL context to the KWK partner signup email

### Composer & Dependency Management
- Updated composer dependencies across the codebase; pinned `amqplib` to a compatible version
- Rebuilt `composer.lock` for PHP 7.4 compatibility; later updated for PHP 8.x
- Added the `crypt` extension and removed unused packages after audit
- Removed the XLS export format; standardised on CSV and applied form styling accordingly

### Session & Config Management
- Added config switch to choose between Redis-backed and file-backed PHP sessions
- Moved session host configuration to `config.local` for per-environment control
- Fixed session deserialization: v2 serializes user data differently; added compatibility reader
- Added `abtest_url` config default when not set to prevent undefined variable warnings
- Updated `config.local` path resolution to handle different mount points
- Added switches to toggle between new and old URL paths during migrations

### URL & Domain Configuration
- Updated mobile program URL to use the correct domain across development, staging, and production configs
- Changed freenet mobile URL from `freenet-mobilfunk` to `www.freenet`
- Defined domain and config values based on environment and used them in signup URL generation

### Miscellaneous Backend
- Added null check across all `cleanString` calls to prevent errors on null input
- Added lock to jobs that may run more than once per hour to prevent duplicate execution
- Added try-catch around all rollback operations so a DB outage doesn't trigger cascading errors
- Added logging when rollback encounters an unexpected state
- Added user agent to `tp` and `tp_ftp` events; included in `dataEvent` reporting
- Increased SOAP memory limits for processing large XML responses; cleaned whitespace from PHP start files
- Added `content-length` header adjustment and early execution stop for specific response paths
- Removed master password and IP-based access limits from the old superuser path
- Removed old superuser magic link endpoint
- Added partner program activity check before processing partner-related operations
- Added `SalesCallbackJob` with support for mapping any params sent to internal field names
- Updated sales callback URL parsing to handle parameterised callbacks
- Added widget config data extraction improvement
- Formatted source files and added `editorconfig` for consistent code style

---

## DevOps & Infrastructure

### Docker Architecture
- Built and maintained the multi-container Docker setup: PHP-FPM, Nginx, worker, cron containers across dev, stage, and production compose files
- Configured external Docker volume for `appserver-resources` shared between containers
- Removed the driver definition for the external volume that was causing conflict
- Added Docker registry mirror to the container build action to improve reliability
- Updated Nginx to remove the hardcoded `localhost` reference to allow dynamic routing
- Added CORS origin rules to Nginx for the v2 frontend integration
- Added PHP and PHP-FPM logs directly as Docker volume mounts for visibility
- Handled Nginx mount points and ownership correctly for in-container file serving
- Added per-server and per-environment `config.local` path switching
- Updated cron.php with the correct application base directory

### Nginx
- Built and maintained domain-specific Nginx configs for development, staging, and production environments
- Updated CSP headers across environments; added nonce testing; re-enabled `nosniff` header
- Added CORS origin headers for the v2 domain integration
- Improved Nginx rules for better request routing and static file handling
- Attempted and iterated MIME type checking configuration; disabled strict MIME on problematic paths
- Got JS build files served correctly from the Nginx container
- Configured `dem` logs in the Nginx container with proper volume paths
- Fixed wrong redirect path discovered during migration testing

### Logging
- Added nginx logs folder to Docker volume mounts
- Added PHP-FPM and PHP error logs as direct volume paths for container-level visibility
- Added `dem` (campaign) log compression and archiving via Docker volume
- Structured more detailed access and error logging across Nginx configs

---

## CI/CD

### Container Builder Workflow
- Integrated appserver into the shared `container_builder` reusable workflow for consistent image builds
- Updated container build action to use Docker registry mirror
- Added `platform_builder` reusable workflow integration; migrated from per-repo build steps to the centralized builder

### Deployment Workflow
- Built and maintained the `deploy.yml` workflow for appserver
- Added version pin for the ssh-action used in deployment steps
- Used `filter_changes` workflow to skip deployment when no relevant files changed
- Updated stage action to perform a build and auto-restart containers after deployment
- Added `force-build` trigger support via commit message flag

### Periodic Check
- Maintained `periodic_check.yml` for detecting container drift and ensuring running containers match expected image versions
