const hlpPW = require('../pw/helpers.js')
const { loadEnvFiles } = require("../../tools/github/shared.js");

loadEnvFiles();

// These helpers intentionally target the candidate's own temporary GitHub repository.
const getRequiredEnv = (name) => {
  const value = process.env[name]

  if (!value) throw new Error(`Missing required env var: ${name}`)

  return value
}

const getRepoContext = () => ({
  owner: getRequiredEnv('GITHUB_OWNER'),
  repo: getRequiredEnv('GITHUB_REPO'),
})

const getAuthHeaders = () => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${getRequiredEnv('GITHUB_TOKEN')}`,
  'X-GitHub-Api-Version': '2026-03-10',
})

const loginIntoGithub = async (page) => {
  const login = getRequiredEnv('GITHUB_LOGIN')
  const password = getRequiredEnv('GITHUB_PASSWORD')

  await page.goto('https://github.com/login')
  await page.getByLabel('Username or email address').fill(login)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL('https://github.com/')
}

const getIssuePayload = async (data = {}) => {
  const suffix = await hlpPW.getRandomLetters(8)

  return {
    title: data.title || `Playwright issue ${suffix}`,
    body: data.body || `Playwright body ${suffix}`,
  }
}

const getIssueCreated = async (request, data = {}) => {
  const { owner, repo } = getRepoContext()
  const payload = await getIssuePayload(data)
  
  const response = await request.post(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    headers: getAuthHeaders(),
    data: payload,
  })
  
  if (!response.ok()) {
    throw new Error(`Failed to create issue: ${response.status()} ${await response.text()}`)
  }
  
  return await response.json()
}

const getIssueData = async (request, issueNumber) => {
  const { owner, repo } = getRepoContext()
  
  const response = await request.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
    headers: getAuthHeaders(),
  })
  
  if (!response.ok()) {
    throw new Error(`Failed to get issue: ${response.status()} ${await response.text()}`)
  }
  
  return await response.json()
}

const _updateIssue = async (request, issueNumber, data) => {
  const { owner, repo } = getRepoContext()
  
  const response = await request.post(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
    headers: getAuthHeaders(),
    data,
  })
  
  if (!response.ok()) {
    throw new Error(`Failed to update issue: ${response.status()} ${await response.text()}`)
  }
  
  return await response.json()
}

const _getIssueComments = async (request, issueNumber) => {
  const { owner, repo } = getRepoContext()
  
  const response = await request.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    headers: getAuthHeaders(),
  })
  
  if (!response.ok()) {
    throw new Error(`Failed to get issue comments: ${response.status()} ${await response.text()}`)
  }
  
  return await response.json()
}

const _addIssueComment = async (request, issueNumber, body) => {
  const { owner, repo } = getRepoContext()
  
  const response = await request.post(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    headers: getAuthHeaders(),
    data: { body },
  })
  
  if (!response.ok()) {
    throw new Error(`Failed to add issue comment: ${response.status()} ${await response.text()}`)
  }
  
  return await response.json()
}

const _closeIssue = async (request, issueNumber) => {
  const { owner, repo } = getRepoContext()
  
  const response = await request.patch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
    headers: getAuthHeaders(),
    data: { state: 'closed' },
  })
  
  if (!response.ok()) {
    throw new Error(`Failed to close issue: ${response.status()} ${await response.text()}`)
  }
  
  return await response.json()
}

module.exports = {
  getRequiredEnv,
  getRepoContext,
  getAuthHeaders,
  loginIntoGithub,
  getIssuePayload,
  getIssueCreated,
  getIssueData,
  _updateIssue,
  _getIssueComments,
  _addIssueComment,
  _closeIssue,
}