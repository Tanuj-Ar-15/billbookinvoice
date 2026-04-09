import {
  FolderTree,
  Gauge,
  Layers,
  LayoutGrid,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppLayout } from './AppLayoutContext'

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
      : 'text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ')

const Sidebar = () => {
  const { sidebarCollapsed } = useAppLayout()

  return (
    <aside
      className={[
        'hidden shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur print:hidden transition-[width] duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900/90 md:flex md:overflow-hidden',
        sidebarCollapsed ? 'md:w-0 md:border-transparent' : 'w-64',
      ].join(' ')}
      aria-hidden={sidebarCollapsed ? true : undefined}
    >
      <div className="flex min-h-screen w-64 flex-col">
        <div className="border-b border-slate-200 px-5 py-6 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                BillBook
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Restaurant Suite
              </p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/app" end className={linkClass}>
            <Gauge size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/app/billing" className={linkClass}>
            <ShoppingCart size={18} />
            New Bill
          </NavLink>
          <NavLink to="/app/bills" className={linkClass}>
            <Receipt size={18} />
            Bills
          </NavLink>
          <NavLink to="/app/bill-settings" className={linkClass}>
            <Settings size={18} />
            Bill Setting
          </NavLink>
          <div className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Masters
          </div>
          <NavLink to="/app/masters/categories" className={linkClass}>
            <FolderTree size={18} />
            Categories
          </NavLink>
          <NavLink to="/app/masters/sizes" className={linkClass}>
            <Layers size={18} />
            Sizes
          </NavLink>
          <NavLink to="/app/masters/products" className={linkClass}>
            <Package size={18} />
            Products
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <LayoutGrid size={14} />
            <span>Structured billing & inventory</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
