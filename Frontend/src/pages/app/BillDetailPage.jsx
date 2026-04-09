import { Pencil, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  clearBillError,
  clearCurrentBill,
  fetchBillById,
  updateBill,
} from '../../redux/slices/billSlice'

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

const BillDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const restaurant = useSelector((state) => state.auth.restaurant)
  const { current, currentLoading, error } = useSelector((state) => state.bill)

  const [editing, setEditing] = useState(false)
  const [paymentMode, setPaymentMode] = useState('cash')
  const [lines, setLines] = useState([])

  useEffect(() => {
    dispatch(clearBillError())
    dispatch(fetchBillById(id))
    return () => {
      dispatch(clearCurrentBill())
    }
  }, [dispatch, id])

  const total = useMemo(
    () => lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0),
    [lines],
  )

  const updateQty = (key, delta) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== key) return line
        const nextQty = Math.max(1, line.quantity + delta)
        return {
          ...line,
          quantity: nextQty,
          lineTotal: nextQty * line.unitPrice,
        }
      }),
    )
  }

  const save = async () => {
    const payload = {
      paymentMode,
      items: lines.map((l) => ({
        itemId: l.itemId,
        size_id: l.size_id,
        quantity: l.quantity,
      })),
    }
    const action = await dispatch(updateBill({ id, ...payload }))
    if (updateBill.fulfilled.match(action)) {
      setEditing(false)
      dispatch(fetchBillById(id))
    }
  }

  if (currentLoading || !current) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {currentLoading ? 'Loading bill…' : 'Bill not found.'}
      </div>
    )
  }

  const displayRows = editing ? lines : current.items

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/app/bills"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to bills
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Bill #{current.billNumber}
          </h1>
          <p className="text-sm text-slate-500">
            {new Date(current.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800"
          >
            <Printer size={16} />
            Reprint
          </button>
          <button
            type="button"
            onClick={() => {
              if (editing) {
                setEditing(false)
              } else if (current) {
                setPaymentMode(current.paymentMode)
                setLines(
                  (current.items || []).map((item, idx) => ({
                    key: `${item.itemId}-${idx}`,
                    itemId: item.itemId,
                    size_id: String(item.size_id),
                    quantity: item.quantity,
                    itemName: item.itemName,
                    sizeName: item.sizeName,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                  })),
                )
                setEditing(true)
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Pencil size={16} />
            {editing ? 'Cancel edit' : 'Edit bill'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div
        id="bill-print"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-none print:shadow-none"
      >
        <div className="text-center">
          <p className="text-xl font-bold">{restaurant?.name}</p>
          <p className="text-sm text-slate-500">{restaurant?.address}</p>
          <p className="text-sm text-slate-500">Ph: {restaurant?.phone}</p>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Bill #{current.billNumber}
          </p>
        </div>

        <div className="my-6 border-t border-dashed border-slate-200" />

        <div className="space-y-3">
          {displayRows.map((row, idx) => (
            <div
              key={editing ? row.key : idx}
              className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3 text-sm last:border-0 dark:border-slate-800"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {row.itemName}{' '}
                  <span className="text-slate-500">({row.sizeName})</span>
                </p>
                <p className="text-xs text-slate-500">
                  {row.quantity} × {money(row.unitPrice)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editing && (
                  <>
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700"
                      onClick={() => updateQty(row.key, -1)}
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold">{row.quantity}</span>
                    <button
                      type="button"
                      className="rounded border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700"
                      onClick={() => updateQty(row.key, 1)}
                    >
                      +
                    </button>
                  </>
                )}
                <p className="font-bold">{money(row.lineTotal)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-bold dark:border-slate-800">
          <span>Total</span>
          <span>{money(editing ? total : current.total)}</span>
        </div>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Payment:{' '}
          {editing ? (
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="due">Due</option>
            </select>
          ) : (
            <span className="font-semibold capitalize">{current.paymentMode}</span>
          )}
        </div>

        {current.notes && (
          <p className="mt-3 text-sm text-slate-500">Notes: {current.notes}</p>
        )}

        {editing && (
          <button
            type="button"
            onClick={save}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white print:hidden"
          >
            Save changes
          </button>
        )}
      </div>
    </div>
  )
}

export default BillDetailPage
