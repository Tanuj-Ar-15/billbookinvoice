import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Store,
} from 'lucide-react'
import { adminAxiosInstance } from '../../services/adminAxiosInstance'

const AdminRestaurantsPage = () => {
  const admin = useSelector((s) => s.adminAuth.admin)
  const canEdit = ['super_admin', 'admin'].includes(admin?.role)

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await adminAxiosInstance.get('/admin/restaurants', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchDebounced || undefined,
        },
      })
      if (data.success) {
        setItems(data.data.restaurants || [])
        setPagination((prev) => ({
          ...prev,
          ...data.data.pagination,
        }))
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load restaurants.')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchDebounced])

  useEffect(() => {
    load()
  }, [load])

  const handleToggleActive = async (id, nextActive) => {
    if (!canEdit) return
    setTogglingId(id)
    try {
      await adminAxiosInstance.patch(`/admin/restaurants/${id}/active`, {
        isActive: nextActive,
      })
      setItems((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isActive: nextActive } : r)),
      )
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update status.')
    } finally {
      setTogglingId(null)
    }
  }

  const goPage = (p) => {
    if (p < 1 || p > pagination.pages) return
    setPagination((prev) => ({ ...prev, page: p }))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Restaurants
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create and manage restaurant accounts. Inactive restaurants cannot sign in.
          </p>
        </div>
        {canEdit ? (
          <Link
            to="/admin/restaurants/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add restaurant
          </Link>
        ) : null}
      </div>

      <div className="mb-4">
        <label htmlFor="admin-search" className="sr-only">
          Search restaurants
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {error ? (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-500">
            <Store className="h-10 w-10 opacity-40" aria-hidden />
            <p>No restaurants match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {r.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {r.email}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 sm:hidden">{r.phone}</div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 dark:text-slate-300 sm:table-cell">
                      {r.phone}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <button
                          type="button"
                          disabled={togglingId === r._id}
                          onClick={() => handleToggleActive(r._id, !r.isActive)}
                          className={[
                            'inline-flex min-h-[36px] min-w-[100px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition',
                            r.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200',
                          ].join(' ')}
                        >
                          {togglingId === r._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : r.isActive ? (
                            'Active'
                          ) : (
                            'Inactive'
                          )}
                        </button>
                      ) : (
                        <span
                          className={
                            r.isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500'
                          }
                        >
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canEdit ? (
                        <Link
                          to={`/admin/restaurants/${r._id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Edit
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && items.length > 0 ? (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev
            </button>
            <button
              type="button"
              onClick={() => goPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-slate-700"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminRestaurantsPage
