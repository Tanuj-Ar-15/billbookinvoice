import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import adminAuthReducer from './slices/adminAuthSlice'
import dashboardReducer from './slices/dashboardSlice'
import categoryReducer from './slices/categorySlice'
import sizeReducer from './slices/sizeSlice'
import productReducer from './slices/productSlice'
import billReducer from './slices/billSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    dashboard: dashboardReducer,
    category: categoryReducer,
    size: sizeReducer,
    product: productReducer,
    bill: billReducer,
  },
})
