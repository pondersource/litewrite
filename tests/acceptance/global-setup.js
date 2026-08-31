const { REMOTESTORAGE_URL, TEST_USERNAME, TEST_PASSWORD, TEST_EMAIL } = require('./support/env')

// Provisions the single account the acceptance tests connect to. Signing up
// through the HTTP form (rather than touching the container's filesystem)
// keeps this independent of which remoteStorage server image is in use.
module.exports = async function globalSetup () {
  const response = await fetch(`${REMOTESTORAGE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  })

  const alreadyExists = response.status === 409
  if (!response.ok && !alreadyExists) {
    const body = await response.text()
    throw new Error(`Failed to provision remoteStorage test account: ${response.status} ${body}`)
  }
}
