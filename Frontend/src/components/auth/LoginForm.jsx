import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { clearAuthError, loginUser } from '../../redux/slices/authSlice'

const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, message } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    if (error) {
      dispatch(clearAuthError())
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const resultAction = await dispatch(loginUser(formData))
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/verify')
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Email Address
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
          <Mail size={17} className="text-slate-500" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="restaurant@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full border-none py-3 text-sm text-slate-900 outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
          <LockKeyhole size={17} className="text-slate-500" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border-none py-3 text-sm text-slate-900 outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
        disabled={loading}
      >
        {loading ? 'Sending OTP...' : 'Login & Send OTP'}
      </button>

      <p className="text-center text-xs text-slate-500">
        You will receive a verification code on your email.
      </p>
    </form>
  )
}

export default LoginForm
