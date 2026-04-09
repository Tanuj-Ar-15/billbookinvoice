import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { clearAuthError, verifyLoginOtp } from '../../redux/slices/authSlice'

const VerifyOtpForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, message, loginEmail, token } = useSelector(
    (state) => state.auth,
  )
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(30)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const timer = setInterval(() => {
      setSecondsLeft((previous) => previous - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  if (token) {
    return <Navigate to="/app" replace />
  }

  if (!loginEmail) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const resultAction = await dispatch(verifyLoginOtp({ email: loginEmail, otp }))
    if (verifyLoginOtp.fulfilled.match(resultAction)) {
      navigate('/app')
    }
  }

  const handleOtpChange = (event) => {
    setOtp(event.target.value)
    if (error) {
      dispatch(clearAuthError())
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <BadgeCheck size={18} className="mt-0.5 text-blue-600" />
          <p>
            OTP sent to <strong>{loginEmail}</strong>
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="otp"
          className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"
        >
          <ShieldCheck size={16} className="text-slate-500" />
          Verification Code (OTP)
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={handleOtpChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          required
        />
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{otp.length}/6 digits</span>
          <span>
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'You can request a new OTP'}
          </span>
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
        {loading ? 'Verifying...' : 'Verify & Login'}
      </button>

      <p className="text-center text-xs text-slate-500">
        For security, this code expires shortly.
      </p>
    </form>
  )
}

export default VerifyOtpForm
