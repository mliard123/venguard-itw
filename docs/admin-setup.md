# Admin Setup And Preflight

This document is for the evaluator or repo owner, not the candidate.

Its purpose is to document the self-setup model and make sure the exercise asks for the right level of setup work.

## What You Need To Prepare

1. A clear instruction that the candidate must use their own GitHub account.
2. A clear requirement that the candidate create a temporary repository with Issues enabled.
3. A clear requirement that the candidate create a fine-grained token scoped only to that repository.
4. A recommendation that the candidate optionally create a local Playwright `storageState` file.

## Recommended Repository Setup

Keep the environment intentionally simple.

1. Ask the candidate to keep repository settings and issue templates simple.
2. Require Issues to be enabled.
3. Do not require pull requests, branches, or code pushes.
4. Do not require them to share any token, password, or browser state.

## How To Get The Token

GitHub supports personal access tokens and app tokens.
For this exercise, the simplest option is a fine-grained personal access token scoped by the candidate to their temporary repository with Issues read/write permissions.

High level steps:

1. Create a fine-grained personal access token.
2. Scope it to the temporary repository created for the exercise.
3. Grant Issues read/write permissions.
4. Keep the token local and secret.

## How To Gather The Exercise Inputs

The candidate needs these values in their own local `.env` file or shell:

1. `GITHUB_OWNER`
2. `GITHUB_REPO`
3. `GITHUB_TOKEN`
4. `GITHUB_STORAGE_STATE` if they choose to use pre-authenticated browser state

## API Preflight Checklist

The candidate should run these checks locally before starting implementation.

If you prefer automation over manual curl commands, use:

```bash
npm run github:discover
npm run github:preflight
```

The discovery script verifies the candidate's authenticated user and repository metadata.

The preflight script creates an issue, updates it, comments on it, verifies the result, and closes it on the candidate's own repository.

### 1. Confirm the token can read the repository

```bash
curl --silent \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO"
```

Expected result:

1. The repository resolves.
2. Issues are enabled.

### 2. Confirm issue creation works

```bash
curl --silent \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues" \
  -d '{"title":"preflight issue","body":"preflight body"}'
```

Expected result:

1. An issue object is returned.
2. Save the returned issue number for the next checks.

### 3. Confirm issue update works

```bash
curl --silent \
  -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/$ISSUE_NUMBER" \
  -d '{"title":"preflight issue updated","body":"preflight body updated"}'
```

Expected result:

1. The returned issue reflects the updated title and body.

### 4. Confirm comment creation works

```bash
curl --silent \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/$ISSUE_NUMBER/comments" \
  -d '{"body":"preflight comment"}'
```

Expected result:

1. A comment object is returned.

### 5. Confirm comment history is readable

```bash
curl --silent \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/$ISSUE_NUMBER/comments"
```

Expected result:

1. The returned comments include the new preflight comment.

### 6. Confirm cleanup works by closing the issue

```bash
curl --silent \
  -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2026-03-10" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/$ISSUE_NUMBER" \
  -d '{"state":"closed"}'
```

Expected result:

1. The issue is closed successfully.

## UI Preflight Checklist

The candidate should do this once with their own account or session.

1. Open the candidate's temporary repository Issues tab.
2. Open an existing issue.
3. Edit the issue title.
4. Edit the issue body.
5. Add a comment.
6. Close the issue.

If any of those steps are blocked by permission issues, repository settings, 2FA prompts, or an unstable login path, the candidate should simplify the setup or create a valid local `storageState` file before continuing.

## What Makes The Exercise Feasible

The use cases are intentionally limited to features GitHub exposes cleanly in both UI and API:

1. Create an issue.
2. Read an issue.
3. Update an issue.
4. Add a comment.
5. Read issue comments.
6. Close the issue.

Those operations are documented in GitHub’s issues APIs and are sufficient for the candidate flows in this repo.

## Final Send Checklist

Before you send the repo to a candidate, confirm the instructions make these expectations explicit:

1. The candidate must use their own GitHub account and repository.
2. The candidate must not share any token with you.
3. The candidate must scope the token to their temporary repository.
4. The candidate should verify API access with `npm run github:preflight`.
5. The candidate should verify UI access with their own browser session.