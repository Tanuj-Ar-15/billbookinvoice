import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { axiosInstance } from '../../services/axiosInstance'

const initialState = {
  loading: false,
  error: '',
  list: [],
  pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  search: '',
  current: null,
  currentLoading: false,
}

export const fetchBills = createAsyncThunk(
  'bill/fetchBills',
  async (
    {
      page = 1,
      search = '',
      paymentMode = '',
      from = '',
      to = '',
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit: 50, search }
      if (paymentMode) params.paymentMode = paymentMode
      if (from) params.from = from
      if (to) params.to = to
      const { data } = await axiosInstance.get('/bill/fetch', { params })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load bills.',
      )
    }
  },
)

export const fetchBillById = createAsyncThunk(
  'bill/fetchBillById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/bill/${id}`)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load bill.',
      )
    }
  },
)

export const createBill = createAsyncThunk(
  'bill/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/bill/create', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create bill.',
      )
    }
  },
)

export const updateBill = createAsyncThunk(
  'bill/update',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/bill/${id}`, body)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update bill.',
      )
    }
  },
)

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setBillSearch: (state, action) => {
      state.search = action.payload
    },
    clearBillError: (state) => {
      state.error = ''
    },
    clearCurrentBill: (state) => {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload?.data || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error'
      })
      .addCase(createBill.pending, (state) => {
        state.error = ''
      })
      .addCase(createBill.rejected, (state, action) => {
        state.error = action.payload || 'Failed to create bill.'
      })
      .addCase(fetchBillById.pending, (state) => {
        state.currentLoading = true
        state.error = ''
      })
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.currentLoading = false
        state.current = action.payload?.data || null
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.currentLoading = false
        state.error = action.payload || 'Error'
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.current = action.payload?.data || state.current
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.current = action.payload?.data || state.current
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update bill.'
      })
  },
})

export const { setBillSearch, clearBillError, clearCurrentBill } =
  billSlice.actions
export default billSlice.reducer
