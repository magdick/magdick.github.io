import { Component } from'@angular/core';

export interface DevOpsProject {
 title: string;
 summary: string;
 highlights: string[];
 tech: string[];
 category:'ci-cd' |'docker' |'infra' |'security';
}

@Component({
 standalone: true,
 selector:'app-devops',
 templateUrl:'./devops.component.html',
 styleUrl:'./devops.component.scss'
})
export class DevopsComponent {
 projects: DevOpsProject[] = [
 {
 title:'Reusable Docker Compose CI Test Workflow',
 summary:'Created a reusable GitHub Actions workflow (test_docker_compose) that other repos can call to spin up docker-compose, wait for health checks, and verify all containers are healthy before deployment. Iteratively fixed runner, token, env variable passing, and checkout action across 20+ commits.',
 highlights: [
'Reusable workflow callable from any repo via workflow_call',
'Added option to skip the job via inputs',
'Uses its own GitHub token for checkout authentication',
'Renamed steps and job for clarity across callers',
'Base docker-compose.yml shared across staging/production',
'Integrated into checkout deployment pipeline as pre-deploy check',
'Fixed env vars passing, sparse checkout, and bake action updates'
 ],
 tech: ['GitHub Actions','docker-compose','Reusable Workflows','Health Checks','CI'],
 category:'ci-cd'
 },
 {
 title:'Platform Builder + Docker Bake Evolution',
 summary:'Built and evolved the centralised Docker Bake platform_builder workflow used by all services. Added docker-bake HCL support, secret injection via buildkit, tag rewriting from the workflow, extra prefix support, and APP_ENV standardisation so that"prod" and"production" branches map to the same image tag.',
 highlights: [
'Migrated from per-repo Dockerfiles to centralised docker bake HCL',
'Added secret injection via buildkit --secret',
'Tag rewriting from workflow so callers don\'t need to define tags',
'Added support for extra prefix on image names',
'APP_ENV set consistently for both prod and production branches',
'Iterated buildx, token cloning, and HCL path resolution across 15+ commits'
 ],
 tech: ['GitHub Actions','Docker Bake','HCL','Buildkit Secrets','Multi-tag','Reusable Workflows'],
 category:'ci-cd'
 },
 {
 title:'Multi-arch Docker Builds — ARM64 + AMD64',
 summary:'Set up multi-architecture Docker image builds for the custom Phalcon PHP image and the custom Nginx base image. Configured QEMU emulation, buildx, and manifest creation. Switched from Kubernetes runner to VM runner for manifest step. Removed imagick extension for ARM compatibility.',
 highlights: [
'Enabled ARM64 build via docker/setup-qemu-action',
'Created and pushed multi-arch manifest for both images',
'Switched runner from k8s to VM for manifest creation step',
'Removed imagick (not cross-compatible) from Phalcon build',
'Fixed image tag references and branch filter logic',
'Dropped ENV usage in manifest for reproducible builds',
'Custom Nginx image now consumed by all services'
 ],
 tech: ['Docker','GitHub Actions','QEMU','Buildx','ARM64','Manifests','Phalcon','Nginx'],
 category:'docker'
 },
 {
 title:'Ad Tracking Server — Full Production Pipeline',
 summary:'Built the complete production deployment pipeline for the ad tracking server from scratch. Includes Nginx config tuning, load balancer re-enablement, Docker resource increases, log path fixes, symlink rights, PHP container volume mounts, and static ppro log configuration. Deployed on p1 first, then p2 after validation.',
 highlights: [
'Full CI/CD pipeline: build → test → deploy to p1 then p2',
'Increased Docker resource limits for the ad server container',
'Fixed static ppro (partner program) Nginx log paths',
'Added symlink (ln) rights to post-deploy steps',
'Mounted PHP container volume for ads folder cleanup',
'Re-enabled load balancer after pipeline was stable',
'Fixed pvx and nginx deviceStorage missing file issue'
 ],
 tech: ['GitHub Actions','Docker','Nginx','PHP-FPM','Load Balancer','CI/CD'],
 category:'ci-cd'
 },
 {
 title:'Company Website — Full CI/CD Modernisation',
 summary:'Complete CI/CD modernisation for the company website: set up the initial auto-deployment pipeline, fixed docker-compose volume mapping between PHP and Nginx containers, modernised the full deployment process to docker compose v2 commands, and integrated the new custom Nginx base image.',
 highlights: [
'Initial deployment pipeline with angular build, minification, and aikido scan',
'Fixed volume mapping and UID/GID between PHP and Nginx containers',
'Switched to docker compose v2, manual volume mounts, nginx logs mapping',
'Full deployment modernization — removed vagrant leftovers',
'Integrated custom Nginx base image base image',
'Fixed www-data user UID conflict between host and container',
'Updated CSP headers for the company website'
 ],
 tech: ['GitHub Actions','Docker','docker-compose v2','Nginx','PHP-FPM','Aikido','CI/CD'],
 category:'ci-cd'
 },
 {
 title:'Local Dev Infrastructure — Docker + DNS',
 summary:'Built the shared development Docker infrastructure from scratch: MariaDB and Redis with resource limits, a Bind9 DNS server for local domain resolution across all services, auto-start on reboot configuration, sample data extraction from production databases. Also set up a partner management service as a git-submodule based project with Podman/Docker cross-compatible volume mounts.',
 highlights: [
'MariaDB 11.5 + Redis in docker-compose with resource limits',
'Bind9 DNS with local domain entries for all services',
'Auto-start on boot for DB and Redis containers',
'Sample data extracted and documented from production databases',
'Users, rights, functions, and procedures recreated from SQL files',
'Partner management service set up as git submodule',
'Direct volume mounts for Podman + Docker cross-compatibility'
 ],
 tech: ['Docker','docker-compose','MariaDB 11.5','Redis','Bind9 DNS','Podman','Git Submodules'],
 category:'infra'
 },
 {
 title:'Ad Tracking Server — Tuning, Logs & Domains',
 summary:'Series of operational improvements to the ad tracking server: (1) click tracking randomisation (etag/viewId entropy + GUID in debug log, tar file option); (2) log folder remapping for logrotation compatibility; (3) server status enabled on a single health subdomain only; (4) domain + environment variable cleanup so no env vars are reset unintentionally.',
 highlights: [
'Added randomness to click etag, viewId, and included GUID in debug log',
'Option to not delete tar archive files after processing',
'Remapped log folders for logrotation compatibility',
'Server status page (mod_status) limited to health subdomain only',
'Domain config cleanup — env vars not reset on re-runs',
'Removed unused legacy Nginx configs',
'Added new advertiser subdomains with access restriction logic'
 ],
 tech: ['PHP','Nginx','Docker','Logrotation','mod_status','ENV'],
 category:'infra'
 },
 {
 title:'Aikido Security Scanning in CI',
 summary:'Integrated Aikido security scanning into the Angular build workflow for the company website and partner portal. Added the Aikido step to run on every build and fail the pipeline on detected vulnerabilities. Also added it into the partner portal container builder check-and-deploy flow.',
 highlights: [
'Added aikido/aikido-action to the Angular build pipeline',
'Added aikido scan to the partner portal container build workflow',
'Scan runs on every push to protected branches',
'Pipeline fails automatically on vulnerability detection',
'No secrets exposed — token managed via GitHub repository secrets',
'Also stopped both old and new container versions during deploy'
 ],
 tech: ['GitHub Actions','Aikido','SAST','Security Scanning','CI/CD'],
 category:'security'
 },
 {
 title:'Email Container + DNS Domain Management',
 summary:'Early infrastructure work: created the email container for development, added DNS entries to Bind9 for all local services, added new local domain for DNS, and removed the DNS server from the shared service once a standalone setup was preferred.',
 highlights: [
'Created email (MailHog/similar) container for local dev',
'Added local DNS entries to named configuration',
'Added new local domain for upcoming services',
'Removed DNS from shared-service — moved to standalone',
'Updated container image names for stability',
'Added partner management database to shared service'
 ],
 tech: ['Docker','Bind9 DNS','docker-compose','MailHog','MariaDB'],
 category:'infra'
 },
 {
 title:'Automated PR Creation with Jira Integration',
 summary:'Built a reusable pr_creation_template workflow consumed by all repos. On every branch push it fetches the Jira ticket summary via the Jira REST API, composes the PR title as"<TICKET> <Jira title>", checks for an existing open PR with that exact title (idempotent — no duplicates on force-push), creates a draft PR with the Jira URL in the body, and assigns it to the pusher. Also maintains tag_and_release.yml which auto-bumps semver tags on every push to main or feature branches.',
 highlights: [
'Fetches Jira ticket title via REST API — PR title auto-composed',
'Deduplication check: skips creation if PR with same title already exists',
'Creates draft PR with Jira ticket URL as body',
'Assigns PR to the user who triggered the push',
'Idempotent: safe to re-trigger on force-push or re-run',
'tag_and_release.yml bumps semver tag on every commit to main'
 ],
 tech: ['GitHub Actions','Jira REST API','Reusable Workflows','GitHub API','Semver Tagging'],
 category:'ci-cd'
 }
 ];

 getCategoryLabel(cat: string): string {
 return {'ci-cd':'CI/CD','docker':'Docker','infra':'Infrastructure','security':'Security' }[cat] ?? cat;
 }
}
