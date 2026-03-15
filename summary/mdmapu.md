# vit_mdmapu — Work Summary

Infrastructure and orchestration repository for the **mdmapu** (partner-feed / md.de document management) application. This repo does not contain application source code itself — it manages the two application submodules (`mdmapu` and `mdmapu_jobs`), wires them together via Docker Compose, and owns all container build, Nginx, and CI/CD configuration.

---

## DevOps

### Git Submodule Architecture

Structured the repository as a multi-submodule monorepo: `mdmapu` (the main PHP web application) and `mdmapu_jobs` (the cronjob PHP worker) are registered as Git submodules. The orchestration repo pins specific commits of each submodule and updates those references across environments. All subsequent reference updates (multiple commits) reflect submodule pointer bumps as the underlying applications evolved.

### Docker Compose Orchestration

Designed and maintained `docker-compose.yaml`, `docker-compose.stage.yaml`, and `docker-compose.production.yaml` using `extends` to compose services from each submodule's own compose file. The orchestration layer adds shared named volumes (`mdmapu-logs`), Nginx domain and config volume mounts, and a `dev-network` external network. Docker secrets are used for the GitHub token required for pulling private images locally.

Key services orchestrated:
- `php-mdmapu` — PHP-FPM container for the web application, with application code and a Composer cache volume.
- `nginx-mdmapu` — Nginx container serving static files and proxying PHP-FPM, with per-environment domain and defaults config mounted as volumes.
- `cron-mdmapu` — PHP cronjob worker container using its own crontab and `php.ini` mounted as volumes.

Volume mounts are defined using direct host-path binds rather than named volumes for application assets (`assets/doc`, `assets/tmp-doc`) to ensure compatibility with both Docker and Podman in local development.

### Docker Image Build Setup (Initial)

Fully configured the container build pipeline from scratch. Created three Dockerfiles:
- `Dockerfile.base` — PHP base image (PHP 8.4, Phalcon 5) with all system dependencies, PHP extensions, and opcache baked in.
- `Dockerfile.php` — Application image extending the base, with development, stage, and production variants (separate `php.ini` and `opcache.ini` per environment, PHP-FPM pool config).
- `Dockerfile.nginx` — Nginx image with per-environment domain configs and entrypoint scripts.

Environment-specific `php.ini` (development, stage, production), `opcache.ini`, and PHP-FPM pool configs (`docker.conf`, `zz-port.conf`) written for each tier. Nginx configuration written for development, stage, and production environments with domain-specific virtual host files, shared `defaults.conf`, `fastcgi_params`, `common.conf`, and `error_handling.conf`.

### Nginx Configuration

Wrote Nginx virtual host configs for `mdmapu.lo` (local development) and `partner-feed.md.de` (stage/production). Configured PHP-FPM proxying, static file serving, and per-environment tuning. Fixed an initial misconfiguration that caused the development environment to be incorrectly treated as stage.

### Traefik Reverse Proxy

Set up Traefik as the local development reverse proxy with dynamic configuration files for development and staging environments. Traefik config was used temporarily and later removed when the setup was simplified.

### Major Infrastructure Cleanup & Simplification

Performed a large-scale cleanup removing all infrastructure that had been superseded by the submodule-native setup:
- Removed all Dockerfiles, `php.ini`, `opcache.ini`, Nginx config, cron files, and startup scripts from the orchestration repo — these now live inside each submodule.
- Removed Traefik reverse proxy configuration entirely.
- Removed `package.json` / `package-lock.json` (Node tooling no longer needed at orchestration level).
- Removed the backend startup script.
- Rewrote `docker-compose.yaml` to use `extends` from each submodule's compose file, reducing duplication to near zero.
- Updated README with correct volume setup commands, permission fix instructions, and Podman-compatible usage.

---

## CI/CD

### Container Builder Workflow

Built the `container_builder.yml` GitHub Actions workflow to build and publish all three container images (base PHP, PHP application, Nginx) to the GitHub Container Registry (`ghcr.io`). Key features:

- Change detection via the reusable `filter_changes.yml` workflow — only rebuilds images when their respective Dockerfile or config paths are touched.
- Supports `force-build` via commit message keyword or manual workflow dispatch.
- Uses `docker/setup-qemu-action` and `docker/setup-buildx-action` for multi-platform builds.
- Builds prod, stage, and dev variants of the PHP application image from the same `Dockerfile.php` using build args.
- Re-authenticates to `ghcr.io` between image build steps to avoid token expiry on long builds.

### Vulnerability Scanning & Issue Creation

Integrated Trivy image scanning directly in the container builder:
- Custom `scan_image` composite action scans both the base PHP image and the Nginx image after each build.
- Scan results are uploaded to a GitHub Gist for visibility.
- If vulnerabilities are detected and no open issue already exists, the workflow automatically opens a GitHub issue with links to the Gist results and assigns it to the team.

### Filter Changes Workflow

Authored the reusable `filter_changes.yml` composite workflow (tagged as `filter_changes_v1.0`) used by the container builder. Outputs boolean flags (`base_container_changed`, `container_changed`, `nginx_container_changed`, `version_changed`) based on which paths changed in the push, allowing selective image rebuilds. This workflow is consumed by other repositories via the public tag reference.

### Custom GitHub Actions

Created three composite GitHub Actions used by the container builder:
- `create_containers/action.yml` — wraps Docker Buildx build-and-push with GHCR login and parameterised image name/prefix/version.
- `scan_image/action.yml` — wraps Trivy vulnerability scan, uploads results to Gist, and outputs the vulnerability count.
- `filter_changes/action.yml` — path-based change detection powering the filter workflow.

### Submodule Reference Updates

Made repeated submodule pointer updates across both `mdmapu` and `mdmapu_jobs` to keep the orchestration repo tracking the latest tested commits of each application submodule, including a targeted update to align both submodules to a new reference baseline.
