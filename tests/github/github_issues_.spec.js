const { test, expect } = require('../../fixtures/fixtures.js')
const hlpPW = require('../../helpers/pw/helpers.js')
const hlpGitHub = require('../../helpers/github/helpers.js')

test.skip('template: after creating an issue via API, it should be visible in the UI', async ({ request, page, ids }) => {
  const issue = await hlpGitHub._getIssueCreated(request)
  const { owner, repo } = hlpGitHub.getRepoContext()

  ids.set({ issue_number: issue.number })

  await page.goto(`/${owner}/${repo}/issues/${issue.number}`)
  await expect(page.getByText(issue.title)).toBeVisible()

  await hlpGitHub._closeIssue(request, issue.number)
})

test.skip('template: after editing and closing an issue via UI, the persisted state should be asserted via API', async ({ request, page, ids }) => {
  // Assumes you already authenticated GitHub locally, either with GITHUB_STORAGE_STATE or a manual headed login flow.
  const issue = await hlpGitHub._getIssueCreated(request)
  const { owner, repo } = hlpGitHub.getRepoContext()
  const suffix = await hlpPW.getRandomLetters(6)
  const nextTitle = `Updated ${suffix}`
  const nextBody = `Updated body ${suffix}`

  ids.set({ issue_number: issue.number })

  await page.goto(`/${owner}/${repo}/issues/${issue.number}`)

  // TODO: implement the real UI edit and close flow against your own temporary repository using semantic locators discovered from the live GitHub DOM.
  // Expected outcome:
  // 1. issue title becomes nextTitle
  // 2. issue body becomes nextBody
  // 3. issue state becomes closed

  const persisted = await hlpGitHub._getIssueData(request, issue.number)

  expect(persisted.title).toBe(nextTitle)
  expect(persisted.body).toBe(nextBody)
  expect(persisted.state).toBe('closed')
})