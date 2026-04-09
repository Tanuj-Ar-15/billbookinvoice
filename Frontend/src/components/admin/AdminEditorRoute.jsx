import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const EDITOR_ROLES = ['super_admin', 'admin']

/** Viewers can only read; block create/edit routes. */
const AdminEditorRoute = ({ children }) => {
  const admin = useSelector((state) => state.adminAuth.admin)
  const role = admin?.role

  if (!role || !EDITOR_ROLES.includes(role)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default AdminEditorRoute
