/* global LITEWRITE_CSS, LITEWRITE_MARKUP */
import Litewrite from './litewrite.js'
import driveDocuments from './atomic-drive-storage.js'

export async function view ({ root, store }) {
  const style = document.createElement('style')
  style.textContent = LITEWRITE_CSS
  root.innerHTML = LITEWRITE_MARKUP
  root.prepend(style)

  const status = root.querySelector('#remotestorage-connect')
  const editor = root.querySelector('#editor')
  status.setAttribute('role', 'status')
  editor.disabled = true
  const showStatus = message => { status.textContent = message }

  showStatus('Loading Atomic notes…')
  const documents = await driveDocuments(store, showStatus)
  await new Promise((resolve, reject) => {
    const litewrite = new Litewrite({ documents, onError: reject, useHistory: false })
    litewrite.once('ready', () => {
      litewrite.open()
      editor.disabled = false
      if (status.textContent === 'Loading Atomic notes…') showStatus('Atomic storage connected')
      resolve()
    })
  })
}
