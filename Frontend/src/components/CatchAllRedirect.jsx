import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

/** Unknown paths: /app for logged-in users, /login otherwise */
const CatchAllRedirect = () => {
  const token = useSelector((state) => state.auth.token)
  return <Navigate to={token ? '/app' : '/login'} replace />
}

export default CatchAllRedirect
