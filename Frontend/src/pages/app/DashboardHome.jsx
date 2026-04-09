import {
  Banknote,
  Clock,
  CreditCard,
  IndianRupee,
  Package,
  PackageCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { createElement, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../redux/slices/dashboardSlice'

const StatCard = ({ title, value, icon, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
      >
        {createElement(icon, { size: 22, className: 'text-white' })}
      </div>
    </div>
  </div>
)

const formatMoney = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

const DashboardHome = () => {
  const dispatch = useDispatch()
  const { loading, error, stats } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Snapshot of your restaurant performance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Items created"
          value={loading ? '…' : stats?.itemsCreated ?? 0}
          icon={Package}
          accent="bg-gradient-to-br from-blue-600 to-indigo-600"
        />
        <StatCard
          title="Active items"
          value={loading ? '…' : stats?.activeItems ?? 0}
          icon={PackageCheck}
          accent="bg-gradient-to-br from-emerald-600 to-teal-600"
        />
        <StatCard
          title="Total sales"
          value={loading ? '…' : formatMoney(stats?.totalSales)}
          icon={IndianRupee}
          accent="bg-gradient-to-br from-violet-600 to-fuchsia-600"
        />
        <StatCard
          title="Today’s sales"
          value={loading ? '…' : formatMoney(stats?.todaySales)}
          icon={TrendingUp}
          accent="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          title="Cash today"
          value={loading ? '…' : formatMoney(stats?.todayCash)}
          icon={Banknote}
          accent="bg-gradient-to-br from-lime-600 to-green-700"
        />
        <StatCard
          title="Online today"
          value={loading ? '…' : formatMoney(stats?.todayOnline)}
          icon={CreditCard}
          accent="bg-gradient-to-br from-sky-600 to-cyan-700"
        />
        <StatCard
          title="Due today"
          value={loading ? '…' : formatMoney(stats?.todayDues)}
          icon={Clock}
          accent="bg-gradient-to-br from-orange-600 to-amber-700"
        />
        <StatCard
          title="Total dues"
          value={loading ? '…' : formatMoney(stats?.totalDues)}
          icon={Wallet}
          accent="bg-gradient-to-br from-rose-600 to-red-600"
        />
      </div>
    </div>
  )
}

export default DashboardHome
