import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PaginationBar from '../../components/common/PaginationBar'
import {
  clearSizeError,
  createSize,
  deleteSize,
  fetchSizes,
  updateSize,
} from '../../redux/slices/sizeSlice'

const SizeMasterPage = () => {
  const dispatch = useDispatch()
  const { loading, error, list, pagination } = useSelector((state) => state.size)

  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  useEffect(() => {
    dispatch(fetchSizes({ page: 1, search: '' }))
  }, [dispatch])

  const loadPage = (page) => {
    dispatch(fetchSizes({ page, search: appliedSearch }))
  }

  const applySearch = () => {
    const q = localSearch.trim()
    setAppliedSearch(q)
    dispatch(fetchSizes({ page: 1, search: q }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await dispatch(createSize({ name: name.trim() }))
    setName('')
    dispatch(fetchSizes({ page: 1, search: appliedSearch }))
  }

  const startEdit = (row) => {
    setEditId(row._id)
    setEditName(row.name)
  }

  const saveEdit = async () => {
    if (!editId || !editName.trim()) return
    await dispatch(updateSize({ id: editId, name: editName.trim() }))
    setEditId(null)
    dispatch(fetchSizes({ page: pagination.page, search: appliedSearch }))
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this size?')) return
    await dispatch(deleteSize(id))
    dispatch(fetchSizes({ page: pagination.page, search: appliedSearch }))
  }

  const clearErr = () => dispatch(clearSizeError())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Size master
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Define portion sizes used in your menu pricing.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            New size name
          </label>
          <input
            value={name}
            onChange={(e) => {
              clearErr()
              setName(e.target.value)
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="e.g. Large"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Add
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 md:max-w-md"
            placeholder="Search sizes…"
          />
          <button
            type="button"
            onClick={applySearch}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800"
          >
            Search
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="py-6 text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                list.map((row, idx) => (
                  <tr
                    key={row._id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 pr-4 text-slate-500">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                      {editId === row._id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {editId === row._id ? (
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(row._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 dark:border-red-900/50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          disabled={loading}
          onPageChange={loadPage}
          label="sizes"
        />
      </div>
    </div>
  )
}

export default SizeMasterPage
