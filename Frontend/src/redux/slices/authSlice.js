import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { axiosInstance } from '../../services/axiosInstance'

const tokenFromStorage = localStorage.getItem('billbook_token')

const initialState = {
  loading: false,
  error: '',
  message: '',
  loginEmail: '',
  token: tokenFromStorage || '',
  restaurant: null,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to login. Please try again.',
      )
    }
  },
)

export const verifyLoginOtp = createAsyncThunk(
  'auth/verifyLoginOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/verify-login', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'OTP verification failed.',
      )
    }
  },
)

export const fetchLoggedUser = createAsyncThunk(
  'auth/fetchLoggedUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/auth/read/login/restaurant')
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Session expired.',
      )
    }
  },
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/logout')
      return true
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed.',
      )
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = ''
    },
    logoutLocal: (state) => {
      state.token = ''
      state.restaurant = null
      state.loginEmail = ''
      state.message = ''
      localStorage.removeItem('billbook_token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = ''
        state.message = ''
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload?.message || 'OTP sent successfully.'
        state.loginEmail = action.payload?.email || ''
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Unable to login.'
      })
      .addCase(verifyLoginOtp.pending, (state) => {
        state.loading = true
        state.error = ''
        state.message = ''
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload?.message || 'Login successful.'
        state.token = action.payload?.data?.token || ''
        state.restaurant = action.payload?.data?.retaurant || null
        if (state.token) {
          localStorage.setItem('billbook_token', state.token)
        }
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'OTP verification failed.'
      })
      .addCase(fetchLoggedUser.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLoggedUser.fulfilled, (state, action) => {
        state.loading = false
        state.restaurant = action.payload?.restaurant || null
      })
      .addCase(fetchLoggedUser.rejected, (state) => {
        state.loading = false
        state.token = ''
        state.restaurant = null
        localStorage.removeItem('billbook_token')
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = ''
        state.restaurant = null
        state.loginEmail = ''
        state.message = ''
        localStorage.removeItem('billbook_token')
      })
      .addCase(logoutUser.rejected, (state) => {
        state.token = ''
        state.restaurant = null
        localStorage.removeItem('billbook_token')
      })
  },
})

export const { clearAuthError, logoutLocal } = authSlice.actions

export default authSlice.reducer
