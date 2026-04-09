import { Navigate, Route, Routes } from 'react-router-dom'
import AdminEditorRoute from './components/admin/AdminEditorRoute'
import AdminGuestRoute from './components/admin/AdminGuestRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import CatchAllRedirect from './components/CatchAllRedirect'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'
import RootRedirect from './components/RootRedirect'
import AppShell from './components/layout/AppShell'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminRestaurantFormPage from './pages/admin/AdminRestaurantFormPage'
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage'
import LoginPage from './pages/LoginPage'
import VerificationPage from './pages/VerificationPage'
import BillDetailPage from './pages/app/BillDetailPage'
import BillSettingPage from './pages/app/BillSettingPage'
import BillingPage from './pages/app/BillingPage'
import BillsListPage from './pages/app/BillsListPage'
import CategoryMasterPage from './pages/app/CategoryMasterPage'
import DashboardHome from './pages/app/DashboardHome'
import ProductMasterPage from './pages/app/ProductMasterPage'
import SizeMasterPage from './pages/app/SizeMasterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <GuestRoute>
            <VerificationPage />
          </GuestRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <AdminGuestRoute>
            <AdminLoginPage />
          </AdminGuestRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminRestaurantsPage />} />
        <Route
          path="restaurants/new"
          element={
            <AdminEditorRoute>
              <AdminRestaurantFormPage />
            </AdminEditorRoute>
          }
        />
        <Route
          path="restaurants/:id/edit"
          element={
            <AdminEditorRoute>
              <AdminRestaurantFormPage />
            </AdminEditorRoute>
          }
        />
      </Route>
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="bill-settings" element={<BillSettingPage />} />
        <Route path="bills" element={<BillsListPage />} />
        <Route path="bills/:id" element={<BillDetailPage />} />
        <Route path="masters/categories" element={<CategoryMasterPage />} />
        <Route path="masters/sizes" element={<SizeMasterPage />} />
        <Route path="masters/products" element={<ProductMasterPage />} />
      </Route>
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  )
}

export default App
