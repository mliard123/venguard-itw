# Candidate Brief — Playwright E2E Exercise

## Goal

Build a small, reliable end-to-end test suite against a real public product: [GitHub](https://github.com).

The objective is not to cover the entire product. The objective is to show sound engineering judgment in how you structure tests, create state, interact with the UI, and verify persisted behavior.

## Product Under Test

| Surface | URL |
|---|---|
| UI | https://github.com |
| API | https://api.github.com |
| API docs | https://docs.github.com/en/rest/issues/issues |

## Assignment

Implement a GitHub issue lifecycle flow.

Expected deliverables:

1. `helpers/github/helpers.js`
2. `tests/github/github_issues_.spec.js`
3. `tests/github/github_comments_.spec.js`

## Required Flows

### 1. Create issue via API, verify via UI

The test should:

1. Create a unique issue through the API in your own temporary repository.
2. Open the issue in the GitHub UI.
3. Verify the issue is visible in the repository UI.

### 2. Edit and close issue via UI, verify via API

The test should:

1. Create a unique issue through the API.
2. Open the issue in the UI.
3. Edit the issue title and body through the UI.
4. Close the issue through the UI.
5. Assert the updated issue via the API.

### 3. Create issue via API, comment via UI, verify via API

The test should:

1. Create a unique issue through the API.
2. Open the issue in the UI.
3. Add a comment through the UI.
4. Assert the comment through the API.

## Candidate Setup

Set up the exercise on your own GitHub account.

You should create or choose:

1. A temporary repository that you control.
2. Issues enabled on that repository.
3. A fine-grained token with Issues read/write access to that repository only.
4. Optionally, a Playwright `storageState` file for your authenticated GitHub browser session.

Recommended setup:

1. Keep your GitHub session language in English.
2. Keep the exercise focused on repository issues only.
3. Prefer a temporary repository so cleanup stays isolated.
4. Run `npm run github:preflight` locally before implementing the full suite.
5. Do not include your token, cookies, or storage-state artifacts in the submitted repository.

## Constraints

These constraints are intentional. Review will focus on whether you respected them.

1. Use flat top-level `test()` blocks only.
2. Do not use `describe()`, `beforeEach()`, or `afterEach()`.
3. Do not introduce a Page Object Model.
4. Put API logic in `helpers/github/helpers.js`, not inline in spec files.
5. Pair every network-triggering UI action with `Promise.all([waitForResponse, action])`.
6. Do not use `waitForTimeout()`.
7. Prefer semantic locators such as `getByRole`, `getByLabel`, and `getByPlaceholder`.
8. Use API assertions as the primary correctness check.
9. Do not spend time overengineering authentication if you can use a valid local storage state.

## What Good Looks Like

We are looking for clear priorities:

1. State is created through the API where appropriate.
2. UI is used for the user-critical behavior being tested.
3. Assertions verify persisted backend state, not only visible text.
4. Test data is unique and isolated.
5. Failures are easy to debug.
6. The implementation avoids brittle interaction patterns when a simpler one exists.

## Timebox

Target effort: 2 to 3 hours.

If you run out of time, prefer a smaller but clean and reliable solution over a larger incomplete one.

Keep setup overhead bounded. The exercise is not intended to test GitHub administration depth beyond creating a temporary repo, a scoped token, and optionally a browser storage state.

## Submission Notes

Include a short note in your submission covering:

1. Assumptions you made.
2. Tradeoffs you chose.
3. What you would improve with another hour.

## Evaluation

Review will focus on:

1. Test architecture and discipline.
2. Async correctness and absence of race conditions.
3. Locator quality.
4. Separation of API helper logic from spec logic.
5. Quality of assertions.
6. Overall reliability and readability.

## Notes

This exercise is intentionally scoped so a strong candidate can complete it within the timebox using only:

1. Issue creation through the GitHub API.
2. Issue editing, commenting, and closing through the GitHub UI.
3. Issue verification through GitHub issue and comment endpoints.

It does not require pull requests, projects, code review, Actions, or advanced GitHub administration.