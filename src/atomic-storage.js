const protocol = 'pondersource.atomic.documents.v1'
const timeoutMs = 15000

function connectAtomic (onStatus) {
  return new Promise((resolve, reject) => {
    let origin
    try {
      origin = new URL(document.referrer).origin
    } catch {
      reject(new Error('Open Litewrite from Atomic to connect your storage.'))
      return
    }
    if (window.parent === window || origin === window.location.origin || origin === 'null') {
      reject(new Error('Open Litewrite from Atomic to connect your storage.'))
      return
    }

    const timeout = setTimeout(() => {
      window.removeEventListener('message', receive)
      reject(new Error('Atomic did not connect. Reopen Litewrite from Atomic.'))
    }, timeoutMs)
    window.addEventListener('message', receive)

    function receive (event) {
      if (event.source !== window.parent || event.origin !== origin ||
        event.data?.type !== protocol || event.ports.length !== 1) return

      clearTimeout(timeout)
      window.removeEventListener('message', receive)
      resolve(atomicDocuments(event.ports[0], onStatus))
    }
  })
}

function atomicDocuments (port, onStatus) {
  let nextId = 0
  let pendingWrites = 0
  const failedWrites = new Set()
  const pending = new Map()

  port.onmessage = ({ data }) => {
    const request = pending.get(data?.id)
    if (!request) return
    pending.delete(data.id)
    clearTimeout(request.timeout)
    if (typeof data.error === 'string') request.reject(new Error(data.error))
    else request.resolve(data.result)
  }

  window.addEventListener('pagehide', event => {
    if (!event.persisted) port.close()
  })

  function request (op, fields) {
    return new Promise((resolve, reject) => {
      const id = ++nextId
      const timeout = setTimeout(() => {
        pending.delete(id)
        reject(new Error('Atomic did not confirm the request.'))
      }, timeoutMs)
      pending.set(id, { resolve, reject, timeout })
      port.postMessage({ id, op, ...fields })
    })
  }

  async function write (op, key, fields) {
    ++pendingWrites
    onStatus('Saving to Atomic…')
    try {
      await request(op, { key, ...fields })
      failedWrites.delete(key)
    } catch (error) {
      failedWrites.add(key)
      throw error
    } finally {
      --pendingWrites
      if (pendingWrites === 0) {
        onStatus(failedWrites.size ? 'An edit was not confirmed. Edit the note again to retry.' : 'Saved to Atomic')
      }
    }
  }

  return {
    get: key => request('get', { key }),
    getAll: () => request('list'),
    set: (key, note) => write('put', key, { note }),
    remove: key => write('delete', key)
  }
}

module.exports = { connectAtomic }
