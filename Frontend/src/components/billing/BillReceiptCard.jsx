const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

/**
 * Printable receipt block (restaurant header + lines + total).
 * Use inside a container with id for print targeting.
 */
const BillReceiptCard = ({
  restaurant,
  lines = [],
  grandTotal = 0,
  paymentMode = 'cash',
  subtitle = 'Preview',
  billNumber,
  createdAt,
  className = '',
}) => {
  return (
    <div
      className={`mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm print:border-none print:shadow-none ${className}`}
    >
      <div className="text-center">
        <p className="text-lg font-bold">{restaurant?.name || 'Restaurant'}</p>
        <p className="text-xs text-slate-500">{restaurant?.address}</p>
        <p className="text-xs text-slate-500">Ph: {restaurant?.phone}</p>
        {billNumber != null && (
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Bill #{billNumber}
          </p>
        )}
        {createdAt && (
          <p className="text-xs text-slate-500">
            {new Date(createdAt).toLocaleString()}
          </p>
        )}
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {subtitle}
        </p>
      </div>
      <div className="my-4 border-t border-dashed border-slate-200" />
      {lines.length === 0 ? (
        <p className="text-center text-sm text-slate-500">
          Add products to see the bill preview.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          {lines.map((line) => (
            <div
              key={line.key || `${line.itemName}-${line.sizeName}-${line.lineTotal}`}
              className="flex items-start justify-between gap-2"
            >
              <div>
                <p className="font-medium">
                  {line.itemName}{' '}
                  <span className="text-slate-500">({line.sizeName})</span>
                </p>
                <p className="text-xs text-slate-500">
                  {line.quantity} × {money(line.unitPrice)}
                </p>
              </div>
              <p className="font-semibold">{money(line.lineTotal)}</p>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{money(grandTotal)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Payment: <strong className="capitalize">{paymentMode}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillReceiptCard
export { money }
