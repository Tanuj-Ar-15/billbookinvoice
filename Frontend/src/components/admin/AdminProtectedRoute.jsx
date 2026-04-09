import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { fetchAdminMe } from '../../redux/slices/adminAuthSlice'

const AdminProtectedRoute = ({ children }) => {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.adminAuth.token)
  const admin = useSelector((state) => state.adminAuth.admin)
  const loading = useSelector((state) => state.adminAuth.loading)
  const location = useLocation()

  useEffect(() => {
    if (token && !admin) {
      dispatch(fetchAdminMe())
    }
  }, [dispatch, token, admin])

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (token && !admin && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <span>Loading session…</span>
      </div>
    )
  }

  if (token && !admin && !loading) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

export default AdminProtectedRoute
