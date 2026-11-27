const CORE = 'https://atomicdata.dev/properties/'
const PARENT = CORE + 'parent'
const NAME = CORE + 'name'
const SHORTNAME = CORE + 'shortname'
const DESCRIPTION = CORE + 'description'
const CLASS = CORE + 'isA'
const PREFIX = 'litewrite-note/v1\n'
const PAGE_SIZE = 100

module.exports = async function driveDocuments (store, onStatus) {
  const { table, rowClass } = await store.getData()
  if (!table || !rowClass) throw new Error('Litewrite needs an Atomic Notes table.')

  const filters = [{ property: CLASS, value: rowClass }]
  let tail = Promise.resolve()
  let pending = 0
  const failed = new Set()

  function parseNote (row) {
    if (row.error || row.get(PARENT) !== table || !row.hasClasses(rowClass)) return
    const value = row.get(DESCRIPTION)
    if (typeof value !== 'string' || !value.startsWith(PREFIX)) return
    const note = JSON.parse(value.slice(PREFIX.length))
    if (note.id !== row.get(SHORTNAME)) throw new Error('Atomic note ID mismatch.')
    return note
  }

  async function getRow (id) {
    const subjects = await store.query({
      property: PARENT,
      value: table,
      filters: [...filters, { property: SHORTNAME, value: id }],
      page: 0,
      pageSize: 2
    })
    if (subjects.length > 1) throw new Error('Duplicate Atomic note ID.')
    return subjects.length ? store.getResource(subjects[0]) : undefined
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
      let page = 0
      let subjects
      do {
        subjects = await store.query({ property: PARENT, value: table, filters, page, pageSize: PAGE_SIZE })
        for (const row of await store.getMany(subjects)) {
          if (row.error) throw new Error('Atomic could not read a note.')
          const note = parseNote(row)
          if (!note) continue
          if (Object.hasOwn(notes, note.id)) throw new Error('Duplicate Atomic note ID.')
          notes[note.id] = note
        }
        page++
      } while (subjects.length === PAGE_SIZE)
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
