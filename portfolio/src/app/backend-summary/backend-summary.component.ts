import { Component } from'@angular/core';

export interface BackendProject {
 title: string;
 summary: string;
 fixes: string[];
 tech: string[];
}

@Component({
 standalone: true,
 selector:'app-backend-summary',
 templateUrl:'./backend-summary.component.html',
 styleUrl:'./backend-summary.component.scss'
})
export class BackendSummaryComponent {
 projects: BackendProject[] = [
 {
 title:'Full mysqli → PDO Migration',
 summary:'Migrated the entire backend codebase from raw mysqli to PDO prepared statements — one of the largest backend refactors. Replaced exec_query() everywhere, added exec_prepared(), refactored BaseAdvertiserStrategy, remove-offensive-subids, sanitize_statistics.php, and many more files to use parameterised queries. Removed secondary/tertiary DB connections and unified to a single PDO connection.',
 fixes: [
'Replaced all direct mysqli calls with PDO prepared statements',
'Added exec_prepared method and refactored fetch to FETCH_ASSOC',
'Refactored BaseAdvertiserStrategy and sanitize_statistics.php',
'Removed secondary and third database connections',
'Moved SQL building outside loops for reduced execution time',
'Added handling for delete-categories and multiple result sets'
 ],
 tech: ['PHP 8','PDO','Prepared Statements','MariaDB','Security']
 },
 {
 title:'SQS Daemon — Go Microservice',
 summary:'Built a production Go daemon that reads failed tracking events from AWS SQS and re-sends them. Implemented as a system service with sudoers integration, CLI commands, self-recovery on crash, structured logging, and architecture documentation (SQS-QUICK-START). Uses enums for all client commands and responses.',
 fixes: [
'SQS client with enum-based commands and responses',
'Failed messages stored to disk and automatically retried',
'Self-recovery on crash, supervised by process manager',
'CLI commands for manual queue control',
'Sudoers configured for environment variable passing',
'Architecture doc written: SQS-QUICK-START.md'
 ],
 tech: ['Go','AWS SQS','systemd','sudoers','CLI','enums']
 },
 {
 title:'SFTP / FTP Error Handling Refactor',
 summary:'Deep refactor of FTP and FetchFilesService: improved type hints, streamlined file deletion logic, fixed error message formatting, renamed SSH key filename constants for clarity. Refactored to return Response objects instead of raw values. All changes covered with updated PHPUnit mock responses.',
 fixes: [
'Fixed SSH2_SFTP resource detection after ssh2_sftp failure',
'Removed leading colon from SFTP read-failure error messages',
'Renamed SSH key filename constants in AdvertiserConstants',
'Refactored FTP class to return Response objects',
'Improved documentation and logging for SSH key loading errors',
'Updated all PHPUnit Ftp mock responses to match new behaviour'
 ],
 tech: ['PHP 8','SSH2 / SFTP','PHPUnit','Response Objects']
 },
 {
 title:'DeletePartners Job + Backup Management',
 summary:'Implemented the DeletePartners background job to remove outdated partner accounts with staged backup table management. Used subqueries instead of direct queries to stay within MySQL memory limits, optimised deletion batches (1k → 5k → 10k after tuning), and wrote comprehensive unit tests for UsersService and the new job class.',
 fixes: [
'DeletePartners cron job with automatic backup table rotation',
'Replaced direct queries with subqueries to reduce PHP memory footprint',
'Refactored Utils class — removed unnecessary dependency injection parameter',
'Fixed maintenance mode method naming inconsistency',
'Added unit tests for UsersService (DeletePartners scenarios)',
'Tuned batch size from 1k → 5k → 10k based on production behaviour'
 ],
 tech: ['PHP 8','Phalcon','MariaDB','Cron Jobs','PHPUnit','Subqueries']
 },
 {
 title:'PHP 7 → 8.x Upgrade + Rector',
 summary:'Upgraded the reporting service through PHP 8.0 → 8.1 → 8.3 → 8.4. Used Rector for automated code migration, manually corrected all edge cases, updated composer packages, updated Docker PHP image for each version, added Xdebug in the correct path, and fixed Docker and logrotation configuration for each PHP version.',
 fixes: [
'Ran Rector for PHP 8.0/8.1/8.3/8.4 migration rules',
'Replaced deprecated type casting with correct PHP 8 syntax',
'Removed unused Mailjet dependency',
'Fixed controller return type for PHP 8 strict mode',
'Updated Docker PHP image for each version + Xdebug path',
'Disabled dev logrotation, fixed Oracle instantclient for ARM'
 ],
 tech: ['PHP 8.4','Rector','Docker','Composer','Xdebug']
 },
 {
 title:'Partner Login Flow & Auto-Disable',
 summary:'Implemented the full partner portal login flow in the backend: directly reads partner data from the partner management system, auto-disables portal memberships when the partner account is deactivated, logs failed API calls, and adds PHP unit tests. Also removed the old deprecated magic link endpoint from the backend.',
 fixes: [
'Directly read partner data from the partner management system regardless of local status',
'Auto-disable portal membership when the partner account is deactivated',
'Log failed API calls to bash for debugging',
'Added PHPUnit tests for partner login flow',
'Removed old deprecated magic link endpoint from the backend',
'Cleaned up old login method in the backend'
 ],
 tech: ['PHP 8','Partner API','JWT','PHPUnit']
 },
 {
 title:'Affiliate Program Deeplinks + Regex Tests',
 summary:'Added deeplink saving to the affiliate program list management. Implemented regex validation for deeplink URLs with comprehensive PHPUnit test coverage. Fixed two minor issues in ProgramsValidator after initial implementation.',
 fixes: [
'Added deeplink field to affiliate program list (frontend + backend)',
'Implemented regex validation for deeplink URL format',
'Fixed validator regex patterns through two iterations',
'Added PHPUnit tests covering all deeplink validation cases',
'Fixed small formatting issues in ProgramsValidator'
 ],
 tech: ['PHP 8','Phalcon','Regex','PHPUnit','Angular (frontend)']
 },
 {
 title:'Offer Prices & Crash-Tarife Domain Routing',
 summary:'Two checkout improvements: (1) added offer price display on overview pages with a second batch of fixes; (2) added crash-tarife domains to Nginx configuration and updated routing logic in OverviewPagesGuard to use injected ENV_SETTINGS, with CSP script URL corrections.',
 fixes: [
'Added offer prices to overview pages',
'Second batch of small fixes for offer price display',
'Added crash-tarife domains to Nginx domain config',
'Updated OverviewPagesGuard to inject ENV_SETTINGS',
'Fixed CSP script URLs for new domains',
'Updated environment variable reference for crash tariff'
 ],
 tech: ['PHP','Nginx','CSP','Angular Guard','ENV']
 },
 {
 title:'SSL/TLS PDO Database Connections (all services)',
 summary:'Added SSL/TLS support to PDO database connections across all four services. Configured certificate paths, SSL options array, and set connection timeout to 10 seconds on each. Ensured compatibility with the managed MariaDB 11.5.1 cluster and added an environment-controlled SSL switch so staging/production differ.',
 fixes: [
'Added PDO SSL options (ca-cert, ssl-mode) to all four services',
'Set DB connection timeout to 10s to prevent hanging connections',
'Environment switch for SSL: on in prod, off in dev',
'Updated MariaDB container image to 11.5.1 (shared service)',
'Fixed PDO parameter binding errors exposed during SSL rollout',
'Added SSL options for partner portal hosted database connections'
 ],
 tech: ['PHP','PDO','MariaDB 11.5','SSL/TLS','Docker','ENV']
 },
 {
 title:'Azure SharePoint Composer Library',
 summary:'Created a standalone reusable PHP Composer library for Azure/SharePoint integration. Refactored to be project-agnostic, updated config boilerplate, cleaned naming conventions, and documented usage. Added fixes: nullable offerskey and graceful fallback when no SharePoint is configured.',
 fixes: [
'Created standalone Azure AD integration Composer package',
'Refactored to make all code reusable across multiple projects',
'Made offerskey nullable to handle missing SharePoint config',
'Fixed edge case when SharePoint integration is disabled',
'Updated config boilerplate and naming conventions',
'Added full developer documentation and cleanup'
 ],
 tech: ['PHP 8','Composer','Azure REST API','SharePoint','OAuth2']
 },
 {
 title:'Receipt Date Formats + Cron TP Date Fix',
 summary:'Two date-handling improvements: (1) added multi-format date parsing for receipts with proper timezone conversion, added transaction_date access rights; (2) fixed cron jobs to use the transaction processing timestamp (tp) as the date/hour rather than the current time, applied only to daily crons.',
 fixes: [
'Added multi-format date validity check with single-format output',
'Timezone-aware date parsing for receipt documents',
'Changed date format direction from advertiser perspective',
'Added right access for receipt transaction date field',
'Fixed cron to use tp (transaction processing time) for daily runs',
'Reverted tp changes for non-daily crons to preserve behaviour'
 ],
 tech: ['PHP 8','Phalcon','Cron','Date/Time','Timezone','ACL']
 },
 {
 title:'CSP, Nginx Gzip & Domain Header Fixes',
 summary:'Resolved font loading issues caused by conflict between gzip and woff2 serving in Nginx. Updated Content Security Policy across multiple Nginx configs. Streamlined domain header logic, prevented initSec from running in parallel, and fixed an internal service Cloudflare URL.',
 fixes: [
'Disabled gzip specifically for woff2 fonts in Nginx',
'Updated CSP to allow self-hosted font origins across all configs',
'Fixed race condition by de-parallelizing initSec calls',
'Added fallback to main domain if subdomain cannot resolve',
'Reverted a service URL to its previous value due to Cloudflare routing',
'Streamlined domain header logic and improved debug logging'
 ],
 tech: ['Nginx','CSP','gzip','PHP','Docker','Cloudflare']
 },
 {
 title:'Maintenance Mode + Deployment Automation',
 summary:'Implemented a full maintenance mode system in IndexController: cache-backed flag, enable/disable methods, error handling, and a deploy workflow that activates maintenance mode before deployment, waits 30 s, then disables it. Refactored cache service usage by introducing a BASE_CACHE constant. Fixed spelling across all controller methods.',
 fixes: [
'Implemented enable/disable maintenance mode via cache flag',
'Updated deployment workflow to toggle maintenance mode around deploy steps',
'Added 30-second wait after maintenance activation before running deploy',
'Refactored cache service into BASE_CACHE constant for consistency',
'Fixed typo in maintenance mode method names across IndexController',
'Updated ssh-action to v1.2.5 in deployment workflow'
 ],
 tech: ['PHP 8','Phalcon','GitHub Actions','Cache','CI/CD','Deploy']
 },
 {
 title:'Reporting Service Setup + New Tariff Cronjobs',
 summary:'Full production hardening of the reporting service: (1) set session to 1 hour, corrected php.ini location, adjusted CSP, pointed docker-compose to the right image; (2) added Unlimited Mobile tariff to the report; (3) introduced MegaSim"activate later" and Unlimited Mobile cronjobs with proper www-data shell config.',
 fixes: [
'Set PHP session lifetime to 1 hour in production',
'Corrected php.ini and CSP configuration for production Nginx',
'Pointed docker-compose production to correct service image',
'Added Unlimited Mobile tariff as a new report category',
'Added MegaSim activate-later cronjob',
'Updated all crons to run under www-data shell for correct permissions'
 ],
 tech: ['PHP 8','Phalcon','Docker','Cron','Nginx','CSP','php.ini']
 },
 {
 title:'Ad Tracking Server — Per-Advertiser Access Control',
 summary:'Extended the ad tracking server with per-advertiser HTTP access restriction: new subdomains added, localhost reconfigured, and a flag introduced so specific advertisers can restrict traffic by IP or token. Scoped health checks to a single subdomain to reduce exposure. Fixed a JSON encoding bug in the ad tracking server event output.',
 fixes: [
'Added new subdomains for advertiser-specific routing',
'Reconfigured localhost Nginx block for internal traffic isolation',
'Added per-advertiser access restriction flag to the server config',
'Scoped /health endpoint to a single subdomain only',
'Fixed JSON encode error in the Go ad server event debug log',
'Cleaned up mount_nginx.sh script for reproducible container builds'
 ],
 tech: ['Go','Nginx','Docker','Access Control','JSON']
 },
 {
 title:'Partner Loyalty Portal — Phalcon Backend from Scratch',
 summary:'Built the entire PHP/Phalcon 5 backend for the partner loyalty portal from scratch. Integrated Azure AD SSO via the Azure AD integration with a custom Authenticator class and SimpleJwt helper. Layered architecture: controllers, services (UsersService, PersonalDataService, PremiumService), validators with IBAN logic, and session-based CSRF. Added force-logout on new token, graceful 401 handling, and direct bank-data fetching.',
 fixes: [
'Phalcon 5 app bootstrapped with routing, CLI, and session-based CSRF',
'Azure AD SSO — full OAuth2 flow via Azure AD: auth URL, state tokens, token exchange',
'UsersService + PersonalDataService with IBAN validator (XX + 2-digit rule)',
'PremiumService and interfaces for the Prämien bonus programme',
'Force-logout previous session on new authentication token',
'Graceful 401 upstream handling — triggers logout instead of crash'
 ],
 tech: ['PHP 8','Phalcon 5','Azure AD','OAuth2','JWT','IBAN Validation','CSRF']
 },
 {
 title:'REST API Token Authentication System',
 summary:'Designed and implemented a bearer-token REST API authentication layer for external API integrations. Created ApiConstants, a TokenGenerator utility, and a RestApiAuthenticator middleware. Built endpoints for token generation, listing, and deletion with a superuser-only token type and separate ACL registration. Added a database migration for the token table and XSRF bypass for token deletion.',
 fixes: [
'RestApiAuthenticator middleware validates bearer tokens on every API request',
'TokenGenerator creates signed tokens with configurable expiry',
'ApiConstants class with all token-related constants',
'Superuser-only token type with separate ACL entry',
'Endpoints: generate, list, delete — all behind ACL',
'Database migration for the token storage table'
 ],
 tech: ['PHP 8','Phalcon','JWT','Bearer Tokens','ACL','Middleware','MariaDB']
 },
 {
 title:'Redis Session Decoupling',
 summary:'Decoupled the session layer by sharing state through Redis (RedisAdapter). Moved session start from services into middleware so controllers no longer manage sessions. Implemented upstream session cookie auto-expiry: when the upstream session expires, the system detects it, creates a new one, and refreshes the session ID — no re-login required. Added XSRF token reset on logout and ensured stale session cookies are cleared.',
 fixes: [
'RedisAdapter integrates Redis as the PHP session backend',
'Middleware-level session start — removed from all services and controllers',
'Auto-detects expired upstream session and renews it without re-login',
'XSRF cookie cleared on session destroy / logout',
'DI container access refactored from direct property to method call',
'HTTP status code constants added to replace magic numbers'
 ],
 tech: ['PHP 8','Phalcon','Redis','Session Management','Middleware','XSRF']
 }
 ];
}
