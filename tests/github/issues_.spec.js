const { test, expect } = require('../../fixtures/fixtures.js');
const hlpPW = require('../../helpers/pw/helpers.js');
const hlpGitHub = require('../../helpers/github/helpers.js');

test('after creating an issue via UI, it should be visible in the UI', async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const issueTitle = `This is the issue's title ${suffix}`;
  const issueBody = `This is the issue's body ${suffix}`;

  await hlpGitHub.loginIntoGithub(page);
  await page.goto(`/${owner}/${repo}`);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/issues') && r.status() === 200
    ),
    page.getByRole('link', { name: 'Issues' }).last().click(),
  ]);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByRole('link', { name: 'New issue' }).click(),
  ]);

  await page.getByRole('textbox', { name: 'Add a title' }).fill(issueTitle);
  await page.getByRole('textbox', { name: 'Markdown value' }).fill(issueBody);

  // Create the issue
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByTestId('create-issue-button').click(),
  ]);

  await page.waitForURL(new RegExp(`/${owner}/${repo}/issues/\\d+`));
  await expect(page.getByRole('heading', { name: issueTitle })).toBeVisible();
  await expect(page.getByText(issueBody)).toBeVisible();

  // Extract issue number from URL
  const issueNumber = parseInt(page.url().match(/\/issues\/(\d+)/)[1]);
  ids.set({ issue_number: issueNumber });

  // GET the issue
  const issueData = await hlpGitHub._getIssueData(request, issueNumber);
  expect(issueData.title).toBe(issueTitle);
  expect(issueData.body).toBe(issueBody);
  expect(issueData.state).toBe('open');

  // Cleanup: close the issue
  await hlpGitHub._closeIssue(request, issueNumber);
});

test('after creating an issue via API, edit it and assert via API', async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const issueTitle = `This is the issue's title ${suffix}`;
  const issueTitleUpdated = `This is the updated issue's title ${suffix}`;
  const issueBody = `This is the issue's body ${suffix}`;
  const issueBodyUpdated = `This is the updated issue's body ${suffix}`;

  // Create issue via API
  const issue = await hlpGitHub.getIssueCreated(request, {
    title: `This is the issue's title ${suffix}`,
    body: `This is the issue's body ${suffix}`,
  });
  ids.set({ issue_number: issue.number });
  expect(issue.title).toBe(issueTitle);
  expect(issue.body).toBe(issueBody);
  expect(issue.state).toBe('open');
  expect(issue.number).toBe(issue.number);

  // GET the issue
  const getIssue = await hlpGitHub._getIssueData(request, issue.number);
  expect(getIssue.title).toBe(issueTitle);
  expect(getIssue.body).toBe(issueBody);
  expect(getIssue.state).toBe('open');
  expect(getIssue.number).toBe(issue.number);

  // Select the issue
  await hlpGitHub.loginIntoGithub(page);
  await page.goto(`/${owner}/${repo}`);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/issues') && r.status() === 200
    ),
    page.getByRole('link', { name: 'Issues' }).last().click(),
  ]);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/issues') && r.status() === 200
    ),
    page
      .getByRole('link', { name: `${issueTitle}` })
      .last()
      .click(),
  ]);

  // Edit issue title
  await page.getByRole('button', { name: 'Edit issue title' }).first().click();
  await page.getByTestId('issue-title-input').fill(issueTitleUpdated);
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByRole('button', { name: /^Save\b/ }).click(),
  ]);

  // Edit issue body
  await page.getByRole('button', { name: 'Issue body actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page
    .getByRole('textbox', { name: 'Markdown value' })
    .fill(issueBodyUpdated);
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByRole('button', { name: /^Save\b/ }).click(),
  ]);

  //GET the issue after update
  const getIssueAfterUpdate = await hlpGitHub._getIssueData(
    request,
    issue.number
  );
  expect(getIssueAfterUpdate.title).toBe(issueTitleUpdated);
  expect(getIssueAfterUpdate.body).toBe(issueBodyUpdated);
  expect(getIssueAfterUpdate.state).toBe('open');
  expect(getIssueAfterUpdate.number).toBe(issue.number);

  // Cleanup: close the issue
  await hlpGitHub._closeIssue(request, issue.number);
});

test('after creating an issue via API, close it and assert via API', async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const issueTitle = `This is the issue's title ${suffix}`;
  const issueBody = `This is the issue's body ${suffix}`;

  // Create issue via API
  const issue = await hlpGitHub.getIssueCreated(request, {
    title: `This is the issue's title ${suffix}`,
    body: `This is the issue's body ${suffix}`,
  });
  ids.set({ issue_number: issue.number });
  expect(issue.title).toBe(issueTitle);
  expect(issue.body).toBe(issueBody);
  expect(issue.state).toBe('open');
  expect(issue.number).toBe(issue.number);

  // GET the issue
  const getIssue = await hlpGitHub._getIssueData(request, issue.number);
  expect(getIssue.title).toBe(issueTitle);
  expect(getIssue.body).toBe(issueBody);
  expect(getIssue.state).toBe('open');
  expect(getIssue.number).toBe(issue.number);

  // Select the issue
  await hlpGitHub.loginIntoGithub(page);
  await page.goto(`/${owner}/${repo}`);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/issues') && r.status() === 200
    ),
    page.getByRole('link', { name: 'Issues' }).last().click(),
  ]);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/issues') && r.status() === 200
    ),
    page
      .getByRole('link', { name: `${issueTitle}` })
      .last()
      .click(),
  ]);

  // Delete the issue
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByRole('button', { name: 'Close issue' }).click(),
  ]);

  // GET the closed issue
  const getClosedIssue = await hlpGitHub._getIssueData(request, issue.number);
  expect(getClosedIssue.title).toBe(issueTitle);
  expect(getClosedIssue.body).toBe(issueBody);
  expect(getClosedIssue.state).toBe('open');
  expect(getClosedIssue.number).toBe(issue.number);
});
