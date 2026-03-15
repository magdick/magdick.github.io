# vit-nginx — Work Summary

Shared base Nginx Docker image repository for all vitrado services that require Nginx. The repo produces a versioned, multi-architecture Nginx image published to the GitHub Container Registry, consumed as `FROM` base by every other project's Nginx Dockerfile.

---

## DevOps

### Custom Nginx Base Image

Built a custom Nginx base image on top of `nginx:1.26.1-alpine-slim` with the following additions:

- **Timezone**: Set to `Europe/Berlin` via `tzdata`.
- **Multi-architecture package installation**: The build handles both officially supported architectures (`x86_64`, `aarch64`) — installing Nginx from the Alpine upstream package repo — and unsupported architectures, where it compiles Nginx from source using `pkg-oss`, with SHA-512 checksum verification of the source tarball before compilation.
- **`envsubst` utility**: Installed via `gettext`, extracted and preserved so the Alpine `gettext` package can be removed afterwards, keeping the image lean.
- **Log forwarding**: `access.log` and `error.log` symlinked to `/dev/stdout` and `/dev/stderr` for Docker-native log collection.
- **Self-signed TLS certificate**: A self-signed RSA 2048-bit certificate and key are generated at build time and placed at `/etc/ssl/cert.crt` and `/etc/ssl/cert.key` for use in local development and staging environments without external certificate dependencies.
- **Base package upgrades**: `ssl_client` and `busybox` upgraded in the same layer to address known Alpine CVEs.
- **Docker entrypoint scripts**: Copied and made executable — `docker-entrypoint.sh` plus four entrypoint hook scripts (`10-listen-on-ipv6-by-default.sh`, `15-local-resolvers.envsh`, `20-envsubst-on-templates.sh`, `30-tune-worker-processes.sh`) — mirroring the official Nginx image's modular startup pattern.
- **Config validation step**: `nginx -t` is run at build time to catch any bundled config errors, with a non-fatal fallback so the build surface is visible in logs without blocking the image push.

---

## CI/CD

### Multi-Architecture Container Builder

Built a two-workflow CI/CD pipeline to produce and publish the Nginx base image for three architectures (`amd64`, `arm64`, `arm64/v8`):

**`container_builder.yml`** — Entry point workflow, triggered on every push and via manual dispatch. Calls the reusable `platform_builder.yml` to perform the actual build and publish.

**`platform_builder.yml`** — Reusable workflow (`workflow_call`) that:

- Runs a build-and-push matrix across all three architectures, each on its dedicated runner (`k8s` for `amd64`, `Linux_ARM_1` for ARM variants).
- Uses the shared `create_containers` composite action from `vit-workflow` to build and push each architecture-tagged image (`latest-amd64`, `latest-arm64`, `latest-arm64v8`) to `ghcr.io`.
- After all architecture builds complete, creates and pushes a Docker multi-architecture **manifest** (`nginx:1.26`) that combines all three platform images — consumers pulling the image without a tag suffix get the correct image for their host architecture automatically.
- Removes any pre-existing manifest before recreating it to avoid push conflicts on re-runs.
- Performs workspace cleanup at the end of each run.

### Build Iteration & Debugging

Worked through a series of issues when establishing the multi-architecture build pipeline:
- Resolved environment variable handling — removed runtime `ENV` usage from manifest creation steps where variables were not being interpolated correctly, switching to hardcoded values where needed.
- Fixed ARM runner availability and routing — correctly identified that `Linux_ARM_1` self-hosted runners are available and routed ARM builds there.
- Debugged image name passing — fixed the image name not being correctly forwarded to the container creation action.
- Resolved `branch-ignore` vs trigger interaction — adjusted the trigger configuration to ensure the workflow fires correctly across all branches without conflicting ignore rules.
- Enabled ARM builds after initial `amd64`-only testing confirmed the pipeline was stable.
