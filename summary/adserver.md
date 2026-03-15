# vit_adserver — Work Summary

`vit_adserver` is the legacy PHP ad-serving engine responsible for delivering banner ads, tracking clicks and views, processing GDPR consent, and handling advertiser pixel callbacks. It runs entirely server-side with no frontend framework — raw PHP serving ad HTML, images, text snippets, and tracking tags directly. The infrastructure is Docker-based with a custom Nginx configuration and a Go-based SQS daemon for asynchronous event processing.

---

## Backend (PHP)

### Database Migration — mysqli → PDO
- Refactored the entire adserver codebase from raw `mysqli` to PDO
- Added SSL connection support via a config-level switch enabling encrypted DB connections
- Increased DB connection timeout to handle latency spikes without hard failures
- Applied small compatibility tweaks after the PDO migration (type handling, query adjustments)

### Per-Advertiser Access Restriction
- Added logic to restrict adserver access on a per-advertiser basis: specific advertisers can be locked to allowed IPs or token-based access
- Added new subdomains to the routing configuration for advertiser-specific traffic isolation
- Reconfigured the localhost Nginx block to separate internal and external traffic paths

### Ad Tracking & Event Processing
- Added more randomness to click IDs, eTags, and view IDs to reduce collision probability in high-traffic scenarios
- Added GUID to debug log output for full request traceability
- Fixed request method interpretation that was being read incorrectly in some edge cases
- Fixed timezone handling: removed timezone offset from log timestamps to use UTC consistently
- Removed redundant `eventId` reference in hook log messages when no event is decoded
- Refactored the hook method for readability and removed unnecessary whitespace accumulation
- Improved hook log output with additional context fields
- Errors from the debugger rerouted to the debug log rather than the tracking log to reduce noise

### Debug & Logging
- Added archive system for access and error logs including static ppro logs
- Added debug logging throughout: log archiver, tracking log, and logrotation processes
- Changed lock file names to be more random with shorter lock duration to reduce contention
- Added option to retain tar archives rather than always deleting after compression
- Made `eventId` log output conditional — only emitted when an event is actually decoded
- Fixed debug folder creation order issue that caused missing directory errors on startup

### PHP Deprecation Cleanup (Rector)
- Added Rector and ran it across the codebase to resolve PHP deprecations
- Replaced `floor()` and `pow()` usages with deprecation-safe equivalents
- Removed deprecation notices, strict warnings, and notices in production `php.ini`
- Addressed remaining deprecations across utility methods iteratively

### SQS Daemon (Go)
- Built a Go-based SQS daemon (`SQSClient`) to consume messages from an AWS SQS queue and deliver them to the adserver asynchronously
- Added daemon self-recovery: automatic restart after failures with configurable retry logic
- Implemented failed message storage and re-send queue: messages that fail delivery are persisted and retried
- Refactored `SQSClient` to use enums for commands and responses for type safety
- Added CLI commands for daemon control (start, stop, status)
- Added improved rights management and sudoers configuration for the daemon process
- Added integration examples and SQS quick-start documentation
- Added the daemon to `sudoers` so it can be managed without root access to the container shell
- Formatted Go source with `gofmt` for consistency

### Miscellaneous Backend
- Added AWS access key for S3/SQS integration
- Improved `CommLayer` and curl client for outbound requests
- Added `NFS` mount support for the ads folder on stage (shared storage across containers)

---

## DevOps & Infrastructure

### Docker Architecture
- Designed and built the full Docker setup for the adserver from scratch: PHP container, Nginx container, worker, and cron containers
- Split docker-compose into separate files for local development, staging, and production
- Removed MySQL and Redis from the adserver compose and linked them via external Docker networks
- Configured NFS mounts for the ads folder on staging (shared across replicas); marked as external to prevent recreation
- Added healthchecks to all containers for load balancer integration
- Added `restart: always` policy to all containers for auto-recovery on failure
- Configured container resource limits (CPU/memory) to avoid starving other services on the host
- Added `dcron` for in-container cron management; tuned cron startup sequence
- Removed physical cron jobs in favour of `logrotation` for log management
- Added `rsyslog` and `su` capabilities to support logging from within containers
- Mounted Nginx folder as the Nginx user to avoid permission errors on startup
- Adjusted body size limits in Nginx and PHP (`php.ini`) to handle larger ad payloads (up to 12 MB)
- Added `sudoers` entries for the SQS daemon and other process management commands

### Nginx Configuration
- Built and maintained domain-specific Nginx configs for all environments (development, staging, production)
- Added and configured subdomain routing for per-advertiser traffic isolation
- Configured static file serving for ppro logs and ad assets (GIFs, images, JS)
- Added server-status endpoint for monitoring; later scoped health check endpoint to a single subdomain to reduce exposure
- Added `deny` rules to restrict access to sensitive status endpoints
- Fixed NFS mount requirement for Nginx container (ads folder needed by both PHP and Nginx)
- Fixed file path issues for `pvx` and `deviceStorage` serving
- Tuned Nginx for performance: cache headers, body limits, connection handling
- Cleaned up duplicate and outdated Nginx domain configs across environments

### Logrotation
- Built logrotation configuration for Nginx access and error logs
- Added debug logging inside the logrotation script for troubleshooting rotation failures
- Configured log archiving (gzip/tar) for access, error, and static ppro logs
- Remapped log folder paths to ensure logrotation worked correctly across Nginx folders
- Fixed folder creation order so log directories exist before logrotation runs

### Multi-Domain & Environment Management
- Added new domains to the adserver routing for staging and production environments
- Tweaked logic to use the `environment` variable instead of hardcoded paths, making domain config reusable
- Added freenet-mobilfunk domain name fix (incorrect domain format in Nginx config)
- Cleaned up unused config files and outdated domain entries across environments
- Added correct env variable injection for production cron jobs

---

## CI/CD

### Deployment Pipeline
- Built the full deployment workflow for the adserver from scratch
- Implemented zero-downtime deployment: disable load balancer → deploy to p1 → enable → deploy to p2 → enable, with configurable wait time between steps
- Added AWS load balancer enable/disable steps as part of the deployment sequence
- Added staging deployment with renamed file paths scoped to the staging environment
- Introduced `force-build` commit message flag to trigger rebuilds without code changes
- Switched from direct Docker commands to the centralized `platform_builder` reusable workflow for image building
- Renamed workflows for consistency with naming conventions across the monorepo

### Container Builder & Image Management
- Integrated the adserver into the shared container builder workflow for consistent multi-service image builds
- Updated Docker images to the latest base versions as part of pipeline integration
- Added mirror configuration for Docker registry fallback
- Fixed healthcheck in the container builder step that was causing false negatives during build verification
- Updated `mount_nginx.sh` to create the Nginx folder as the Nginx user, preventing container start failures

### Security Scanning
- Integrated Aikido security scanning into the CI pipeline for dependency and container vulnerability detection
- Separate scan step added to the container builder to scan only the base image (not generated images)

### Renovate
- Configured Renovate for automated dependency update PRs
- Later removed Renovate configuration after evaluating the noise-to-value ratio for this repo
