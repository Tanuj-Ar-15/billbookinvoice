import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const AdminGuestRoute = ({ children }) => {
  const token = useSelector((state) => state.adminAuth.token)

  if (token) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default AdminGuestRoute
