const { test, expect } = require('../../fixtures/fixtures.js')
const hlpPW = require('../../helpers/pw/helpers.js')
const hlpGitHub = require('../../helpers/github/helpers.js')

test.skip('template: after creating an issue via API and commenting via UI, the comment should be asserted via API', async ({ request, page, ids }) => {
  // Assumes you already authenticated GitHub locally, either with GITHUB_STORAGE_STATE or a manual headed login flow.
  const issue = await hlpGitHub._getIssueCreated(request)
  const { owner, repo } = hlpGitHub.getRepoContext()
  const commentBody = `Playwright comment ${await hlpPW.getRandomLetters(8)}`

  ids.set({ issue_number: issue.number })

  await page.goto(`/${owner}/${repo}/issues/${issue.number}`)

  // TODO: implement the real UI comment flow against your own temporary repository using semantic locators discovered from the live GitHub DOM.
  // Expected outcome: a new comment with commentBody is persisted on the issue.

  const comments = await hlpGitHub._getIssueComments(request, issue.number)
  expect(comments.some(comment => comment.body === commentBody)).toBe(true)

  await hlpGitHub._closeIssue(request, issue.number)
})