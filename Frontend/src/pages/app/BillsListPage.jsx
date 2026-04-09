import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import PaginationBar from '../../components/common/PaginationBar'
import { clearBillError, fetchBills } from '../../redux/slices/billSlice'

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

const localTodayYMD = () => {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const d = String(n.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const BillsListPage = () => {
  const dispatch = useDispatch()
  const { loading, error, list, pagination } = useSelector((state) => state.bill)

  const [localSearch, setLocalSearch] = useState('')
  const [paymentMode, setPaymentMode] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    paymentMode: '',
    from: '',
    to: '',
  })

  useEffect(() => {
    dispatch(clearBillError())
    dispatch(
      fetchBills({
        page: 1,
        search: '',
        paymentMode: '',
        from: '',
        to: '',
      }),
    )
  }, [dispatch])

  const buildQuery = () => {
    const from = todayOnly ? localTodayYMD() : dateFrom
    const to = todayOnly ? localTodayYMD() : dateTo
    return {
      search: localSearch.trim(),
      paymentMode: paymentMode || '',
      from: from || '',
      to: to || '',
    }
  }

  const applyFilters = () => {
    const q = buildQuery()
    setFilters(q)
    dispatch(fetchBills({ page: 1, ...q }))
  }

  const loadPage = (page) => {
    dispatch(fetchBills({ page, ...filters }))
  }

  const handleTodayChange = (checked) => {
    setTodayOnly(checked)
    if (checked) {
      const t = localTodayYMD()
      setDateFrom(t)
      setDateTo(t)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bills
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Search by bill number or product name. Filter by payment mode and
          date range, or show today&apos;s bills only. 50 bills per page.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 md:max-w-md"
              placeholder="Search bill # or item…"
            />
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800"
            >
              Search
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-[10rem]">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Pay method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="due">Due</option>
              </select>
            </div>
            <div className="min-w-[10rem]">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                From date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={todayOnly}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="min-w-[10rem]">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                To date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={todayOnly}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(e) => handleTodayChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Today&apos;s bills only
            </label>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 lg:ml-auto"
            >
              Apply filters
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4">Bill #</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Mode</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                list.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 pr-4 font-mono font-semibold">
                      #{row.billNumber}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 capitalize">{row.paymentMode}</td>
                    <td className="py-3 pr-4 font-semibold">{money(row.total)}</td>
                    <td className="py-3">
                      <Link
                        to={`/app/bills/${row._id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-blue-600 dark:border-slate-700"
                      >
                        <Eye size={14} />
                        Open
                      </Link>
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
          label="bills"
        />
      </div>
    </div>
  )
}

export default BillsListPage
