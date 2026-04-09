import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Store,
  X,
} from 'lucide-react'
import { fetchAdminMe, logoutAdmin } from '../../redux/slices/adminAuthSlice'

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
      : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-200 dark:hover:bg-slate-800/80',
  ].join(' ')

const AdminLayout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state) => state.adminAuth.token)
  const admin = useSelector((state) => state.adminAuth.admin)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (token) {
      dispatch(fetchAdminMe())
    }
  }, [dispatch, token])

  const handleLogout = async () => {
    await dispatch(logoutAdmin())
    navigate('/admin/login', { replace: true })
  }

  const canEdit = ['super_admin', 'admin'].includes(admin?.role)

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0 md:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-semibold tracking-tight"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
              <LayoutDashboard className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg">BillBook Admin</span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink
            to="/admin"
            end
            className={navClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Store className="h-5 w-5 shrink-0" aria-hidden />
            Restaurants
          </NavLink>
          {canEdit ? (
            <NavLink
              to="/admin/restaurants/new"
              className={navClass}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-white/20 text-xs font-bold">
                +
              </span>
              Add restaurant
            </NavLink>
          ) : null}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {admin?.name || 'Admin'}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {admin?.email}
          </p>
          <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {admin?.role?.replace('_', ' ') || '—'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
          <Link
            to="/"
            className="mt-2 block text-center text-xs text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          >
            Back to restaurant app
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold">Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
