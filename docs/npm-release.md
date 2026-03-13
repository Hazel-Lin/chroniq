# npm Release Checklist

Chroniq publishes to npm as `@hazellin/chroniq` while keeping the CLI commands `chroniq` and `cq`.

## One-time setup

```bash
npm whoami
git remote -v
```

Expected:

- npm account is `hazellin`
- Git remote points to `Hazel-Lin/chroniq`

Choose one CI publishing method before relying on GitHub Actions:

### Option A: npm trusted publishing (recommended)

On npm package settings for `@hazellin/chroniq`, add a trusted publisher with:

- GitHub user/org: `Hazel-Lin`
- Repository: `chroniq`
- Workflow filename: `release.yml`

Notes:

- Trusted publishing for GitHub Actions requires GitHub-hosted runners.
- npm CLI must be `11.5.1+`, so the workflow upgrades npm before publish.

### Option B: `NPM_TOKEN` fallback

Add repository secret `NPM_TOKEN` with npm publish access. This is only needed if trusted publishing is not configured.

## Release steps

1. Update `package.json` version.
2. Run the release gate:

```bash
pnpm install
pnpm release:check
```

3. Publish to npm:

```bash
npm publish --access public
```

4. Verify the package:

```bash
npm view @hazellin/chroniq version
npm install -g @hazellin/chroniq
chroniq --help
```

## What `release:check` verifies

- TypeScript type check passes
- Test suite passes
- `npm pack --dry-run` only includes fresh build output

## Notes

- The unscoped package name `chroniq` is already taken on npm, so publishing uses the scoped package name.
- `prepack` rebuilds `dist/` before packaging to avoid shipping stale compiled files.
- GitHub Actions release publishing now supports either npm trusted publishing or a fallback `NPM_TOKEN`.
