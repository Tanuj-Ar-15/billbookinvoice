import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

/** Renders children only when not authenticated; otherwise redirects to /app */
const GuestRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token)

  if (token) {
    return <Navigate to="/app" replace />
  }

  return children
}

export default GuestRoute
