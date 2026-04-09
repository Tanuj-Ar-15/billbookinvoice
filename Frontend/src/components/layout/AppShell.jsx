import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { fetchLoggedUser } from '../../redux/slices/authSlice'
import { AppLayoutProvider } from './AppLayoutContext'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

const AppShell = () => {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    if (token) {
      dispatch(fetchLoggedUser())
    }
  }, [dispatch, token])

  return (
    <AppLayoutProvider>
      <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopNavbar />
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </AppLayoutProvider>
  )
}

export default AppShell
