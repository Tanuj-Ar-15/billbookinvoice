import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

/** Sends / to /app when logged in, otherwise /login */
const RootRedirect = () => {
  const token = useSelector((state) => state.auth.token)
  return <Navigate to={token ? '/app' : '/login'} replace />
}

export default RootRedirect
