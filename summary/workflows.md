# vit-workflow — Work Summary

Shared GitHub Actions repository containing reusable workflows and composite actions consumed by all other vitrado repositories. Every project in the organisation (`vitrado_v2`, `bestellung`, `vitrado_website`, `vit_kwk-hosted-projects`, `vit_superreport`, `vit_mdmapu`, and others) references this repo via `uses: freenet-group/vit-workflow/.github/workflows/...@<tag>` or `uses: freenet-group/vit-workflow/.github/actions/...@<tag>`. All changes here are released as semver-tagged versions and immediately affect every consumer.

---

## CI/CD

### `platform_builder.yml` — Core Reusable Build Workflow

The central reusable workflow used by every project's container builder and deploy pipeline to build and push Docker images to the GitHub Container Registry (`ghcr.io`).

**Original implementation:**
Built the workflow using a matrix runner strategy (per-architecture jobs) combined with a separate manifest creation job that assembles a multi-arch Docker manifest after all per-platform builds complete. Used custom `create_containers` composite action for the build-and-push step.

**Migration to Docker Bake:**
Replaced the matrix + manifest approach with a single **Docker Bake** build step using the `docker/bake-action`. This architectural change:
- Eliminates the separate manifest job — `docker bake` with `linux/amd64,linux/arm64` platforms produces a single multi-arch manifest in one step.
- Moves the Bake HCL definition file (`docker-bake.hcl`) into the workflow repository itself, checked out as a sub-path (`.workflow-repo/`) during the caller's build.
- The `create_containers` composite action is removed entirely — its responsibilities are absorbed by the bake step.
- Iteratively debugged HCL path resolution, `docker buildx` setup, GHCR token injection as a Docker build secret, and sparse vs full checkout behaviour.

**Inputs supported:**
- `extract_targets` — Space-separated list of Angular project folders to extract from the frontend build archive into the Nginx image.
- `image_prefix` — `dev`, `stage`, `prod`, `production`.
- `dockerfile_path` — Path to the Dockerfile to build.
- `image_type` — `php` or `nginx` (determines image name variable).
- `artefact_name` / `frontend_build_archive` — Download and extract a frontend build artefact before the Docker build when building Nginx images that embed Angular bundles.
- `make_build` — Boolean guard; skips all build steps if `false`, runs a no-op job instead, allowing callers to conditionally skip builds without workflow failures.
- `enable_cache` — Toggle registry-based layer cache (`cache-from`/`cache-to` via GHCR).
- `build_platforms` — Target platforms (default: `linux/amd64,linux/arm64`).
- `extra_prefix` — Optional additional prefix in the image name for multi-image repos.

**`APP_ENV` derivation:**
Added automatic `APP_ENV` mapping from image prefix: `prod`/`production` → `production`, `stage` → `staging`, anything else → `development`. Passed as both a Docker build arg and a Bake env variable, removing the need for callers to manage this mapping.

**Tags support (`extra_prefix`):**
Added `extra_prefix` input to support repos that publish multiple distinct images (e.g., a repo building both a PHP image and a separate cron image with different name prefixes).

### `docker-bake.hcl` — Multi-Arch Build Definition

Authored the Docker Bake HCL configuration used by `platform_builder.yml`:
- Defines a single `app` target with parameterised `DOCKERFILE`, `PLATFORMS`, `REGISTRY`, `REPOSITORY`, `IMAGE_PREFIX`, `IMAGE_NAME`, `VERSION`, `APP_ENV`, and `EXTRA_PREFIX` variables.
- Produces two tags per build: a versioned tag (`:<VERSION>`) and `:latest`.
- Injects the GitHub token as a Docker build secret (`id=GITHUB_TOKEN,env=GHCR_TOKEN`) for pulling private base images during the build.
- Configures registry-based layer caching (`cache-from` / `cache-to`).

### `test_docker_compose.yml` — Reusable Container Health Test Workflow

Built a new reusable `workflow_call` workflow for integration-testing a Docker Compose stack after a deploy:
- Pulls and starts all services defined in a named compose file (`docker-compose.test.<env>.yaml`) using all profiles.
- Optionally enables maintenance mode on the PHP and cron containers before the test run (touching the maintenance flag file inside the container).
- Waits 60 seconds for containers to initialise.
- Iterates over all running containers, checks `State.Status` (must be `running`) and `State.Health.Status` (must not be `unhealthy`).
- Prints health check logs for any unhealthy container.
- Tears down all containers at the end.
- Exits with code 1 if any container is unhealthy or not running, failing the workflow.
- `run` boolean input allows callers to conditionally skip the test step.
- Uses its own `GITHUB_TOKEN` (not the caller's PAT) to authenticate to GHCR for pulling images.
- Iteratively debugged action versions (`actions/checkout`, `docker/setup-docker-action`), authentication approach, and test timing.

### `tag_and_release.yml` — Automatic Version Tagging

Maintains a workflow that automatically bumps the semver tag and creates a GitHub release on every push to `main` or any `VITDEV-*` branch, using `mathieudutour/github-tag-action`. This enables per-commit versioning so consumer repos can pin to exact workflow versions.

### `pr_creation_template.yml` — Automated PR Creation

Built a reusable `workflow_call` workflow for automated pull request creation:
- Takes `ticket_number`, `base_branch`, and `pushed_by` as inputs.
- Fetches the Jira ticket title via the Jira REST API using a `JIRA_ACCESS_TOKEN` secret — PR title is auto-composed as `"<ticket_number> <Jira summary>"`.
- Checks for an existing open PR with the same title before creating a new one (idempotent — prevents duplicate PRs on force-pushes).
- Creates the PR as a draft with a body containing the Jira ticket URL.
- Assigns the PR to the user who triggered the push.

---

## DevOps (Composite Actions)

### `extract_builds` — Frontend Archive Extraction

Composite action for extracting a frontend build archive (`.tar.gz`) into an Nginx container build context:
- Accepts `ARCHIVE_NAME`, `PUBLIC_FOLDER`, `EXTRACTION_FOLDER`, and `EXTRACT_TARGETS`.
- Extracts the archive, then `rsync`s each named target folder from the extracted content into the destination, with `--delete` to remove stale files.
- Cleans up the archive and temporary extraction folder after processing.
- Gracefully skips targets that are not present in the archive.

### `scan_image` — Trivy Container Vulnerability Scanning

Composite action wrapping Trivy image scanning:
- Authenticates to GHCR, runs `trivy` in `image` scan mode against the named image.
- Scans for `HIGH` and `CRITICAL` severity CVEs.
- Outputs scan results to the GitHub Actions step summary.
- Continues on error so a scan failure does not block the build.
- Returns a `vulnerabilities` output count for callers to act on (e.g., open a GitHub issue).

### `filter_changes` — Path-Based Change Detection

Composite action wrapping `dorny/paths-filter` with a configurable filter YAML input. Callers pass their own filter definitions; the action outputs one boolean per filter, consumed by container builder workflows to decide which images to rebuild.

### `pull_changes` — Remote Git Pull over SSH

Composite action for pulling the latest commit on a remote server via SSH:
- Connects via `appleboy/ssh-action`.
- Runs `git restore --staged ./`, `git checkout ./`, and `git pull` in the configured working directory.
- Resets any local modifications before pulling, preventing merge conflicts from leftover state on the server.
