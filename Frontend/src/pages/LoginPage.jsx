import AuthLayout from '../components/layout/AuthLayout'
import LoginForm from '../components/auth/LoginForm'

const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome to BillBook"
      subtitle="Login with your restaurant email and password"
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage
