import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminAxiosInstance } from '../../services/adminAxiosInstance'

const tokenFromStorage = localStorage.getItem('billbook_admin_token')

const initialState = {
  loading: Boolean(tokenFromStorage),
  error: '',
  message: '',
  token: tokenFromStorage || '',
  admin: null,
}

export const loginAdmin = createAsyncThunk(
  'adminAuth/loginAdmin',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await adminAxiosInstance.post('/admin/auth/login', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to sign in. Please try again.',
      )
    }
  },
)

export const fetchAdminMe = createAsyncThunk(
  'adminAuth/fetchAdminMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminAxiosInstance.get('/admin/auth/me')
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Session expired.',
      )
    }
  },
)

export const logoutAdmin = createAsyncThunk(
  'adminAuth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await adminAxiosInstance.post('/admin/auth/logout')
      return true
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed.',
      )
    }
  },
)

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearAdminAuthError: (state) => {
      state.error = ''
    },
    logoutAdminLocal: (state) => {
      state.token = ''
      state.admin = null
      state.message = ''
      localStorage.removeItem('billbook_admin_token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = ''
        state.message = ''
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload?.message || ''
        state.token = action.payload?.data?.token || ''
        state.admin = action.payload?.data?.admin || null
        if (state.token) {
          localStorage.setItem('billbook_admin_token', state.token)
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed.'
      })
      .addCase(fetchAdminMe.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchAdminMe.fulfilled, (state, action) => {
        state.loading = false
        state.admin = action.payload?.data?.admin || null
      })
      .addCase(fetchAdminMe.rejected, (state) => {
        state.loading = false
        state.token = ''
        state.admin = null
        localStorage.removeItem('billbook_admin_token')
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.token = ''
        state.admin = null
        localStorage.removeItem('billbook_admin_token')
      })
      .addCase(logoutAdmin.rejected, (state) => {
        state.token = ''
        state.admin = null
        localStorage.removeItem('billbook_admin_token')
      })
  },
})

export const { clearAdminAuthError, logoutAdminLocal } = adminAuthSlice.actions

export default adminAuthSlice.reducer
