const { test, expect } = require('../../fixtures/fixtures.js');
const hlpPW = require('../../helpers/pw/helpers.js');
const hlpGitHub = require('../../helpers/github/helpers.js');
const dayjs = require('../../plugins/index.js');

test('after creating a comment via UI, it should be visible via API', async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const issueTitle = `This is the issue's title ${suffix}`;
  const issueBody = `This is the issue's body ${suffix}`;
  const issueBodyComment = `This is the issue's comment ${suffix}`;

  // Login
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

  // Add a comment
  await page
    .getByPlaceholder('Use Markdown to format your comment')
    .fill(issueBodyComment);
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes('/_graphql') &&
        r.request().method() === 'POST' &&
        r.status() === 200
    ),
    page.getByRole('button', { name: 'Comment', exact: true }).click(),
  ]);

  // GET the issue
  const issueData = await hlpGitHub.getIssueData(request, issueNumber);
  expect(issueData.title).toBe(issueTitle);
  expect(issueData.body).toBe(issueBody);
  expect(issueData.comments).toBe(1);
  expect(issueData.state).toBe('open');

  const issueComment = await hlpGitHub._getIssueComments(request, issueNumber);
  expect(issueComment[0].body).toBe(issueBodyComment);

  // Cleanup: close the issue
  await hlpGitHub._closeIssue(request, issueNumber);
});

test('after creating a comment via API, edit it and assert via API', async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const issueTitle = `This is the issue's title ${suffix}`;
  const issueBody = `This is the issue's body ${suffix}`;
  const issueBodyComment = `This is the issue's comment ${suffix}`;
  const issueBodyCommentUpdated = `This is the updated issue's comment ${suffix}`;

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
  const getIssue = await hlpGitHub.getIssueData(request, issue.number);
  expect(getIssue.title).toBe(issueTitle);
  expect(getIssue.body).toBe(issueBody);
  expect(getIssue.state).toBe('open');
  expect(getIssue.number).toBe(issue.number);

  // Add a comment
  const issueComment = await hlpGitHub._addIssueComment(
    request,
    issue.number,
    issueBodyComment
  );
  const date = dayjs(issueComment.created_at)
    .tz(dayjs.tz.guess())
    .format('h:mm A');

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

  // Edit issue comment
  await page.getByTestId('comment-header-hamburger').click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByLabel('Markdown value').fill(issueBodyCommentUpdated);
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByRole('button', { name: 'Update comment' }).click(),
  ]);

  // GET the issue after update
  const issueData = await hlpGitHub.getIssueData(request, issue.number);
  expect(issueData.title).toBe(issueTitle);
  expect(issueData.body).toBe(issueBody);
  expect(issueData.comments).toBe(1);
  expect(issueData.state).toBe('open');

  const issueCommentAfterUpdate = await hlpGitHub._getIssueComments(
    request,
    issue.number
  );
  expect(issueCommentAfterUpdate[0].body).toBe(issueBodyCommentUpdated);

  // Cleanup: close the issue
  await hlpGitHub._closeIssue(request, issue.number);
});

test('after creating a comment via API, delete it and assert via API', async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const issueTitle = `This is the issue's title ${suffix}`;
  const issueBody = `This is the issue's body ${suffix}`;
  const issueBodyComment = `This is the issue's comment ${suffix}`;

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
  const getIssue = await hlpGitHub.getIssueData(request, issue.number);
  expect(getIssue.title).toBe(issueTitle);
  expect(getIssue.body).toBe(issueBody);
  expect(getIssue.state).toBe('open');
  expect(getIssue.number).toBe(issue.number);

  // Add a comment
  const issueComment = await hlpGitHub._addIssueComment(
    request,
    issue.number,
    issueBodyComment
  );
  const date = dayjs(issueComment.created_at)
    .tz(dayjs.tz.guess())
    .format('h:mm A');

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

  // Delete issue comment
  await page.getByTestId('comment-header-hamburger').click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/_graphql') && r.status() === 200
    ),
    page.getByRole('button', { name: 'Delete', exact: true }).click(),
  ]);

  // GET the issue after update
  const issueData = await hlpGitHub.getIssueData(request, issue.number);
  expect(issueData.title).toBe(issueTitle);
  expect(issueData.body).toBe(issueBody);
  expect(issueData.comments).toBe(0);
  expect(issueData.state).toBe('open');

  const issueCommentAfterDelete = await hlpGitHub._getIssueComments(
    request,
    issue.number
  );
  expect(issueCommentAfterDelete).toEqual([]);

  // Cleanup: close the issue
  await hlpGitHub._closeIssue(request, issue.number);
});
