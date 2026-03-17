# venguard-itw — Playwright E2E Interview Test

## Context

[GitHub](https://github.com) is a real production platform with a stable web UI and a documented REST API.
For this exercise, the product under test is the GitHub Issues flow on a repository the candidate creates and controls.

| | URL |
|---|---|
| **UI** | https://github.com |
| **API base** | https://api.github.com |
| **API reference** | https://docs.github.com/en/rest/issues/issues |

---

## The exercise

Write an E2E test suite for an **issue lifecycle flow** on GitHub.

Candidate-facing brief: [docs/candidate-brief.md](docs/candidate-brief.md)

Scoring rubric: [docs/scoring-rubric.md](docs/scoring-rubric.md)

Owner notes for the self-setup model: [docs/admin-setup.md](docs/admin-setup.md)

Local setup validation:

- `npm run github:discover`
- `npm run github:preflight`

Starter skeleton is intentionally provided in:

- `helpers/github/helpers.js`
- `tests/github/github_issues_.spec.js`
- `tests/github/github_comments_.spec.js`

---

## Deliverables

### 1. `helpers/github/helpers.js`

A domain helper file with at minimum:

| Function | Description |
|---|---|
| `_getIssueCreated(request, data)` | Creates a GitHub issue in the configured repository. Returns the created issue object. |
| `_getIssueData(request, issueNumber)` | Fetches an issue via `GET /repos/{owner}/{repo}/issues/{issue_number}`. |
| `_updateIssue(request, issueNumber, data)` | Updates an issue title, body, or state. |
| `_getIssueComments(request, issueNumber)` | Fetches issue comments for verification. |
| `_addIssueComment(request, issueNumber, body)` | Adds a comment through the API when needed for setup or cleanup. |
| `_closeIssue(request, issueNumber)` | Closes the issue for cleanup. |

### 2. `tests/github/github_issues_.spec.js`

Two tests minimum:

- **Test 1** — Create an issue via the API, verify it appears in the UI
- **Test 2** — Edit an issue via the UI and close it via the UI, assert the persisted state via API

### 3. `tests/github/github_comments_.spec.js`

One test:

- Create an issue via the API, add a comment via the UI, assert the comment exists via API

### 4. Configuration for the exercise

The candidate should configure these environment variables locally:

| Variable | Description |
|---|---|
| `GITHUB_OWNER` | Candidate-owned repository owner |
| `GITHUB_REPO` | Candidate-owned repository name |
| `GITHUB_TOKEN` | Candidate-owned token with issues read/write access on that repo |

Preferred UI-auth option:

| Variable | Description |
|---|---|
| `GITHUB_STORAGE_STATE` | Path to a Playwright storage state file for the candidate's authenticated GitHub session |

Strongly recommended for consistency:

1. Use an English-language GitHub session.
2. Use a temporary dedicated repository with Issues enabled.
3. Run `npm run github:preflight` locally before starting the full implementation.

---

## Architecture — non-negotiable rules

This project follows a **flat, zero-overhead architecture**. Every convention below is enforced during review.

### Structure

```js
// ✅ Correct
const { test, expect } = require('../../fixtures/fixtures.js')
const hlpPW   = require('../../helpers/pw/helpers.js')
const hlpXxx  = require('../../helpers/xxx/helpers.js')

test('after visiting [...] and doing X, Y should be Z', async ({ request, page, ids }) => {
  // 1. Create state via API
  // 2. Reuse your authenticated browser session
  // 3. Navigate
  // 4. UI interaction — always paired with waitForResponse
  // 5. Assert via API
})
```

```js
// ❌ Wrong — never use these
describe('...', () => {})
beforeEach(async () => {})
class GitHubPage {}          // no Page Object Model
```

### Waiting — always pair network-triggering actions with `waitForResponse`

```js
// ✅ Correct — atomic, race-free
await Promise.all([
  page.waitForResponse(r => r.url().includes('/issues') && r.status() === 200),
  page.getByRole('button', { name: 'Save' }).click()
])

// ❌ Wrong — race condition
await page.getByRole('button', { name: 'Save' }).click()
await page.waitForResponse('/issues')

// ❌ Never
await page.waitForTimeout(2000)
```

### Locators — semantic priority order

| Priority | Method | Use when |
|---|---|---|
| 1 | `getByRole(role, { name })` | Buttons, links, inputs, headings, dialogs |
| 2 | `getByLabel('...')` | Form fields with a `<label>` |
| 3 | `getByPlaceholder('...')` | Inputs with a placeholder but no label |
| 4 | `getByText('...')` | Non-interactive display elements |
| 5 | `getByTestId('...')` | Elements with `data-testid` |
| last | `locator('[class*="..."]')` | **Never** — classes change |

```js
// ✅
page.scanDOM()
page.getByRole('button', { name: '...' })
page.getByPlaceholder('...')
page.getByRole('link', { name: 'Issues' })

// ❌
page.locator('.js-issue-row')
page.locator('button:has-text("Save")')
page.locator('>> nth=0')     // use .first() instead
```

### Assertions — always via API, never via UI

```js
// ✅ Stable — API contract
const issue = await hlpGitHub._getIssueData(request, issueNumber)
expect(issue.title).toBe('My New Issue')
expect(issue.state).toBe('closed')

// ❌ Fragile — UI text changes
await expect(page.getByText('My New Issue')).toBeVisible()
```

### Helpers — never duplicate API logic

```js
// ✅ Reuse
const issue = await hlpGitHub._getIssueCreated(request, data)

// ❌ Never inline API calls in test files
const res = await request.post('https://api.github.com/repos/OWNER/REPO/issues')
```

---

## Available utilities

### `helpers/pw/helpers.js`

```js
const hlpPW = require('../../helpers/pw/helpers.js')

const letters = await hlpPW.getRandomLetters(10)   // e.g. 'xkqmwfrbjz' — use for unique test data
const num     = await hlpPW.getRandomNumber(1, 100) // e.g. 42
```

### `plugins/index.js`

Pre-configured [dayjs](https://day.js.org/) instance with utc, timezone, customParseFormat, duration, isBetween.

```js
const dayjs = require('../../plugins/index.js')
dayjs.utc('2025-01-01').format('DD/MM/YYYY')  // '01/01/2025'
```

### `fixtures/fixtures.js`

Extended `test` with two additional fixtures:

**`page.scanDOM()`** — call it anywhere in a test, run, copy the printed locators, remove the call.

```js
await page.goto('/')
await page.scanDOM()   // prints all links, buttons, inputs, testIds to stdout
```

**`ids`** — annotates resource IDs for debugging on failure.

```js
test('...', async ({ request, page, ids }) => {
  const issue = await hlpGitHub._getIssueCreated(request, data)
  ids.set({ issue_number: issue.number })   // shows up in test report on failure
})
```

---

## Running tests

```bash
npm install
npm run install:browsers
npm run run                         # all tests
export GITHUB_OWNER='your-github-login-or-org'
export GITHUB_REPO='your-temporary-exercise-repo'
export GITHUB_TOKEN='your-local-scoped-token'
export GITHUB_STORAGE_STATE='path/to/your/storage-state.json'  # optional
npm run github:discover
npm run github:preflight
npx playwright test tests/github/github_issues_.spec.js   # single file
npx playwright test --headed        # with browser visible
```

---

## Evaluation criteria

| Criterion | What we look for |
|---|---|
| Architecture | Flat `test()`, no `describe`, no POM, inline setup |
| Async | `Promise.all([waitForResponse, action])` — no `waitForTimeout` |
| Locators | Semantic (`getByRole`, `getByLabel`, `getByPlaceholder`) |
| Assertions | API-based (`_getIssueData`, `_getIssueComments`) — not `toBeVisible()` |
| Helpers | Domain logic in `helpers/github/helpers.js`, not inline |
| Auth | Sensible handling of the candidate's own GitHub token and browser session |
| Cleanup | Issues closed via API at end of each test |

Detailed scoring sheet: [docs/scoring-rubric.md](docs/scoring-rubric.md)
