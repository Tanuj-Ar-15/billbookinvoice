import { Printer } from 'lucide-react'
import { useSelector } from 'react-redux'
import BillReceiptCard from '../../components/billing/BillReceiptCard'

const SAMPLE_LINES = [
  {
    key: 'sample-1',
    itemName: 'Sample dish',
    sizeName: 'Regular',
    quantity: 2,
    unitPrice: 120,
    lineTotal: 240,
  },
  {
    key: 'sample-2',
    itemName: 'Another item',
    sizeName: 'Large',
    quantity: 1,
    unitPrice: 180,
    lineTotal: 180,
  },
]

const SAMPLE_TOTAL = SAMPLE_LINES.reduce((s, l) => s + l.lineTotal, 0)

const BillSettingPage = () => {
  const restaurant = useSelector((state) => state.auth.restaurant)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bill Setting
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Preview how your printed receipt looks. This matches the layout used
          when you print from New Bill or bill details.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-inner print:border-none dark:border-slate-700 dark:bg-slate-900">
        <div id="bill-preview-settings">
          <BillReceiptCard
            restaurant={restaurant}
            lines={SAMPLE_LINES}
            grandTotal={SAMPLE_TOTAL}
            paymentMode="cash"
            subtitle="Sample preview"
          />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 print:hidden"
        >
          <Printer size={16} />
          Print preview
        </button>
      </div>
    </div>
  )
}

export default BillSettingPage
