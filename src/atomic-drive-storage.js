const CORE = 'https://atomicdata.dev/properties/'
const PARENT = CORE + 'parent'
const NAME = CORE + 'name'
const SHORTNAME = CORE + 'shortname'
const DESCRIPTION = CORE + 'description'
const CLASS = CORE + 'isA'
const PREFIX = 'litewrite-note/v1\n'
const READ_BATCH = 100
const MEMBER_LIMIT = 500

module.exports = async function driveDocuments (store, onStatus) {
  const { table, rowClass } = await store.getData()
  if (!table || !rowClass) throw new Error('Litewrite needs an Atomic Notes table.')

  let tail = Promise.resolve()
  let pending = 0
  const failed = new Set()

  function belongsToTable (row) {
    const classes = row.get(CLASS)
    return row.get(PARENT) === table && Array.isArray(classes) && classes.includes(rowClass)
  }

  function parseNote (row) {
    if (!belongsToTable(row)) return
    const value = row.get(DESCRIPTION)
    if (typeof value !== 'string' || !value.startsWith(PREFIX)) return
    const note = JSON.parse(value.slice(PREFIX.length))
    if (note.id !== row.get(SHORTNAME)) throw new Error('Atomic note ID mismatch.')
    return note
  }

  async function readRows (property, value) {
    const subjects = await store.query({ property, value })
    if (subjects.length >= MEMBER_LIMIT) throw new Error('Too many rows to load safely in this Atomic view.')
    const rows = []
    for (let offset = 0; offset < subjects.length; offset += READ_BATCH) {
      const batch = await store.getMany(subjects.slice(offset, offset + READ_BATCH))
      if (batch.some(row => row.error)) throw new Error('Atomic could not read a note.')
      rows.push(...batch)
    }
    return rows
  }

  async function getRow (id) {
    const rows = (await readRows(SHORTNAME, id)).filter(row =>
      belongsToTable(row) && row.get(SHORTNAME) === id
    )
    if (rows.length > 1) throw new Error('Duplicate Atomic note ID.')
    return rows[0]
  }

  function write (id, operation) {
    pending++
    onStatus('Saving to Atomic…')
    const result = tail.then(operation)
    tail = result.catch(() => {})
    return result.then(() => {
      failed.delete(id)
    }, error => {
      failed.add(id)
      throw error
    }).finally(() => {
      if (--pending === 0) onStatus(failed.size ? 'An edit was not saved. Edit the note again to retry.' : 'Saved to Atomic')
    })
  }

  return {
    async get (id) {
      await tail
      const row = await getRow(id)
      return row && parseNote(row)
    },
    async getAll () {
      await tail
      const notes = Object.create(null)
      for (const row of await readRows(PARENT, table)) {
        const note = parseNote(row)
        if (!note) continue
        if (Object.hasOwn(notes, note.id)) throw new Error('Duplicate Atomic note ID.')
        notes[note.id] = note
      }
      return notes
    },
    set (id, note) {
      return write(id, async () => {
        const row = await getRow(id)
        const props = {
          [NAME]: note.title || 'Note',
          [SHORTNAME]: id,
          [DESCRIPTION]: PREFIX + JSON.stringify(note)
        }
        if (!row) {
          await store.newResource({ parent: table, isA: [rowClass], propVals: props })
          return
        }
        if (!parseNote(row)) throw new Error('The Atomic row does not contain a Litewrite note.')
        for (const [property, value] of Object.entries(props)) row.set(property, value)
        await row.save()
      })
    },
    remove (id) {
      return write(id, async () => {
        const row = await getRow(id)
        if (!row) return
        if (!parseNote(row)) throw new Error('The Atomic row does not contain a Litewrite note.')
        await row.destroy()
      })
    }
  }
}
