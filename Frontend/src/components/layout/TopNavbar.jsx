import { LogOut, Menu, Moon, PanelLeft, PanelRight, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { logoutUser } from '../../redux/slices/authSlice'
import { useAppLayout } from './AppLayoutContext'

const mobileLink =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'

const TopNavbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const restaurant = useSelector((state) => state.auth.restaurant)
  const [open, setOpen] = useState(false)
  const { sidebarCollapsed, setSidebarCollapsed } = useAppLayout()

  const handleLogout = async () => {
    setOpen(false)
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur print:hidden dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-lg border border-slate-200 p-2 md:hidden dark:border-slate-700"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <button
              type="button"
              className="hidden rounded-lg border border-slate-200 p-2 md:inline-flex dark:border-slate-700"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelRight size={20} className="text-slate-700 dark:text-slate-200" />
              ) : (
                <PanelLeft size={20} className="text-slate-700 dark:text-slate-200" />
              )}
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {restaurant?.name || 'Restaurant'}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {restaurant?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3" onClick={() => setOpen(false)}>
              <NavLink to="/app" end className={mobileLink}>
                Dashboard
              </NavLink>
              <NavLink to="/app/billing" className={mobileLink}>
                New Bill
              </NavLink>
              <NavLink to="/app/bills" className={mobileLink}>
                Bills
              </NavLink>
              <NavLink to="/app/bill-settings" className={mobileLink}>
                Bill Setting
              </NavLink>
              <NavLink to="/app/masters/categories" className={mobileLink}>
                Categories
              </NavLink>
              <NavLink to="/app/masters/sizes" className={mobileLink}>
                Sizes
              </NavLink>
              <NavLink to="/app/masters/products" className={mobileLink}>
                Products
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default TopNavbar
