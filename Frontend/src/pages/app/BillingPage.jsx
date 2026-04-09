import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BillReceiptCard, {
  money,
} from '../../components/billing/BillReceiptCard'
import { clearBillError, createBill } from '../../redux/slices/billSlice'
import { clearProductError } from '../../redux/slices/productSlice'
import { axiosInstance } from '../../services/axiosInstance'

const loadAllProducts = async () => {
  const acc = []
  let page = 1
  for (;;) {
    const { data } = await axiosInstance.get('/item/fetch', {
      params: { page, limit: 50, search: '' },
    })
    const items = data?.data || []
    acc.push(...items)
    const totalPages = data?.pagination?.totalPages || 1
    if (page >= totalPages) break
    page += 1
  }
  return acc
}

const BillingPage = () => {
  const dispatch = useDispatch()
  const restaurant = useSelector((state) => state.auth.restaurant)
  const billError = useSelector((state) => state.bill.error)

  const [catalogProducts, setCatalogProducts] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [searchByCode, setSearchByCode] = useState('')
  const [searchByName, setSearchByName] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [lines, setLines] = useState([])
  const [paymentMode, setPaymentMode] = useState('cash')
  const [notes, setNotes] = useState('')
  const [printBill, setPrintBill] = useState(null)
  const [billSuccess, setBillSuccess] = useState('')

  const leftPanelRef = useRef(null)
  const billBoxRef = useRef(null)
  const listRef = useRef(null)
  const firstBillLineRef = useRef(null)

  useEffect(() => {
    dispatch(clearProductError())
    dispatch(clearBillError())
  }, [dispatch])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCatalogLoading(true)
      try {
        const all = await loadAllProducts()
        if (!cancelled) setCatalogProducts(all.filter((p) => p.isActive))
      } catch {
        if (!cancelled) setCatalogProducts([])
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const code = searchByCode.trim().toLowerCase()
    const name = searchByName.trim().toLowerCase()
    return catalogProducts.filter((p) => {
      const codeOk =
        !code ||
        String(p.serialNumber ?? '')
          .toLowerCase()
          .includes(code)
      const nameOk =
        !name || (p.itemName || '').toLowerCase().includes(name)
      return codeOk && nameOk
    })
  }, [catalogProducts, searchByCode, searchByName])

  useEffect(() => {
    setHighlightedIndex((prev) =>
      filteredProducts.length === 0
        ? 0
        : Math.min(prev, filteredProducts.length - 1),
    )
  }, [filteredProducts])

  useEffect(() => {
    if (!listRef.current || filteredProducts.length === 0) return
    const el = listRef.current.querySelector(
      `[data-product-idx="${highlightedIndex}"]`,
    )
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [highlightedIndex, filteredProducts.length])

  const addProduct = useCallback((product) => {
    if (!product?.price?.length) return
    const entry = product.price[0]
    const sizeId = String(entry.size_id?._id || entry.size_id)
    const unitPrice = Number(entry.price)
    const sizeName = entry.size_id?.name || 'Size'
    const stableKey = `${product._id}-${sizeId}`

    setLines((prev) => {
      const idx = prev.findIndex(
        (l) =>
          String(l.itemId) === String(product._id) &&
          String(l.size_id) === sizeId,
      )
      if (idx !== -1) {
        return prev.map((l, i) => {
          if (i !== idx) return l
          const nextQty = l.quantity + 1
          return {
            ...l,
            quantity: nextQty,
            lineTotal: nextQty * l.unitPrice,
          }
        })
      }
      return [
        ...prev,
        {
          key: stableKey,
          itemId: product._id,
          itemName: product.itemName,
          size_id: sizeId,
          sizeName,
          quantity: 1,
          unitPrice,
          lineTotal: unitPrice,
          isVeg: !!product.isVeg,
        },
      ]
    })
  }, [])

  const addFirstFiltered = useCallback(() => {
    if (filteredProducts.length === 0) return
    addProduct(filteredProducts[highlightedIndex] || filteredProducts[0])
  }, [filteredProducts, highlightedIndex, addProduct])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'ArrowRight') return
      const left = leftPanelRef.current
      const bill = billBoxRef.current
      if (!left || !bill) return
      const active = document.activeElement
      if (left.contains(active) && !bill.contains(active)) {
        e.preventDefault()
        bill.focus()
        const firstLine = firstBillLineRef.current
        if (firstLine) firstLine.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!printBill) return
    const onAfterPrint = () => {
      setPrintBill(null)
      window.removeEventListener('afterprint', onAfterPrint)
    }
    window.addEventListener('afterprint', onAfterPrint)
    const t = window.setTimeout(() => window.print(), 100)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('afterprint', onAfterPrint)
    }
  }, [printBill])

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

  const removeLine = (key) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  const grandTotal = lines.reduce((s, l) => s + l.lineTotal, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (lines.length === 0) return
    dispatch(clearBillError())
    const payload = {
      paymentMode,
      notes,
      items: lines.map((l) => ({
        itemId: l.itemId,
        size_id: l.size_id,
        quantity: l.quantity,
      })),
    }
    const action = await dispatch(createBill(payload))
    if (createBill.fulfilled.match(action)) {
      const created = action.payload?.data
      setLines([])
      setNotes('')
      setBillSuccess('Bill generated')
      window.setTimeout(() => setBillSuccess(''), 6000)
      if (created) setPrintBill(created)
    }
  }

  const handleListKeyDown = (e) => {
    if (filteredProducts.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) =>
        Math.min(i + 1, filteredProducts.length - 1),
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const p = filteredProducts[highlightedIndex]
      if (p) addProduct(p)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    addFirstFiltered()
  }

  const receiptLinesFromApi = (bill) =>
    (bill?.items || []).map((item, idx) => ({
      key: `r-${idx}`,
      itemName: item.itemName,
      sizeName: item.sizeName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    }))

  return (
    <>
      <div className="print:hidden">
        <div className="grid gap-6 xl:grid-cols-2">
        <div ref={leftPanelRef} className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              New bill
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Filter by code or name; click a row or press Enter to add (same
              item increases qty). ↑↓ + Enter on the list. Press → to focus the
              bill lines; Tab moves through lines, then payment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Search by code
                </label>
                <input
                  value={searchByCode}
                  onChange={(e) => setSearchByCode(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Serial number…"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Search by name
                </label>
                <input
                  value={searchByName}
                  onChange={(e) => setSearchByName(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Product name…"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Products ({filteredProducts.length})
              </p>
              <div
                ref={listRef}
                role="listbox"
                tabIndex={0}
                aria-label="Product list"
                onKeyDown={handleListKeyDown}
                className="max-h-[min(28rem,55vh)] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-800 dark:bg-slate-950/50"
              >
                {catalogLoading && (
                  <p className="p-4 text-sm text-slate-500">Loading products…</p>
                )}
                {!catalogLoading && filteredProducts.length === 0 && (
                  <p className="p-4 text-sm text-slate-500">
                    No products match your search.
                  </p>
                )}
                {!catalogLoading &&
                  filteredProducts.map((p, idx) => {
                    const firstPrice = p.price?.[0]
                    const priceLabel = firstPrice
                      ? money(firstPrice.price)
                      : '—'
                    return (
                      <button
                        key={p._id}
                        type="button"
                        data-product-idx={idx}
                        role="option"
                        aria-selected={idx === highlightedIndex}
                        onClick={() => {
                          setHighlightedIndex(idx)
                          addProduct(p)
                        }}
                        className={[
                          'flex w-full items-center justify-between gap-3 border-b border-slate-200 px-3 py-2.5 text-left text-sm transition last:border-b-0 dark:border-slate-800',
                          idx === highlightedIndex
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                        ].join(' ')}
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            className={[
                              'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold tabular-nums',
                              idx === highlightedIndex
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
                            ].join(' ')}
                          >
                            #{p.serialNumber ?? '—'}
                          </span>
                          <span className="truncate font-medium">{p.itemName}</span>
                        </span>
                        <span
                          className={
                            idx === highlightedIndex
                              ? 'shrink-0 text-white/90'
                              : 'shrink-0 text-slate-600 dark:text-slate-400'
                          }
                        >
                          {priceLabel}
                        </span>
                      </button>
                    )
                  })}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Click a row or use ↑↓ + Enter to add (uses first size).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Bill
            </h2>
            <p className="text-sm text-slate-500">
              Line items, payment, then generate.
            </p>
          </div>

          <div
            ref={billBoxRef}
            tabIndex={-1}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500/40 dark:border-slate-800 dark:bg-slate-900"
          >
            {billSuccess && (
              <p
                className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-200"
                role="status"
              >
                {billSuccess}
              </p>
            )}
            {billError && (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                {billError}
              </p>
            )}

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Lines ({lines.length})
              </p>
              {lines.length === 0 && (
                <p className="text-sm text-slate-500">No items yet.</p>
              )}
              {lines.map((line, idx) => (
                <div
                  key={line.key}
                  ref={idx === 0 ? firstBillLineRef : undefined}
                  tabIndex={idx === 0 ? -1 : undefined}
                  data-bill-line={idx}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                        Qty {line.quantity}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {line.itemName}{' '}
                        <span className="font-normal text-slate-500">
                          ({line.sizeName})
                        </span>
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {money(line.unitPrice)} each · line total{' '}
                      {money(line.lineTotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                      onClick={() => updateQty(line.key, -1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                      onClick={() => updateQty(line.key, 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="ml-1 font-semibold tabular-nums">
                      {money(line.lineTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="rounded-lg border border-red-200 p-1 text-red-600 dark:border-red-900/50"
                      aria-label="Remove line"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <fieldset className="mt-4 border-0 p-0">
              <legend className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                Payment
              </legend>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'online', label: 'Online' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'due', label: 'Due' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={value}
                      checked={paymentMode === value}
                      onChange={() => setPaymentMode(value)}
                      className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                placeholder="Optional"
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <button
                type="submit"
                disabled={lines.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingBag size={18} />
                Generate bill & print · {money(grandTotal)}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>

      {printBill && (
        <div
          id="bill-print-root"
          className="fixed inset-0 z-[100] hidden bg-white print:block print:static"
          aria-hidden
        >
          <div className="flex min-h-screen items-start justify-center p-6 print:p-4">
            <BillReceiptCard
              restaurant={restaurant}
              lines={receiptLinesFromApi(printBill)}
              grandTotal={printBill.total}
              paymentMode={printBill.paymentMode}
              subtitle="Receipt"
              billNumber={printBill.billNumber}
              createdAt={printBill.createdAt}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default BillingPage
