function required (name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

module.exports = {
  APP_URL: process.env.APP_URL || 'http://localhost:8000',
  REMOTESTORAGE_URL: required('REMOTESTORAGE_URL'),
  TEST_USERNAME: required('TEST_USERNAME'),
  TEST_PASSWORD: required('TEST_PASSWORD'),
  TEST_EMAIL: required('TEST_EMAIL')
}
