import AuthLayout from '../components/layout/AuthLayout'
import VerifyOtpForm from '../components/auth/VerifyOtpForm'

const VerificationPage = () => {
  return (
    <AuthLayout
      title="Verify your login"
      subtitle="Enter the OTP sent to your registered email"
    >
      <VerifyOtpForm />
    </AuthLayout>
  )
}

export default VerificationPage
