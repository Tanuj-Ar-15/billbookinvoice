import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { axiosInstance } from '../../services/axiosInstance'

const initialState = {
  loading: false,
  error: '',
  list: [],
  pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  search: '',
}

export const fetchSizes = createAsyncThunk(
  'size/fetchSizes',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/item/fetch/size', {
        params: { page, limit: 50, search },
      })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load sizes.',
      )
    }
  },
)

export const createSize = createAsyncThunk(
  'size/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/item/create/size', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create size.',
      )
    }
  },
)

export const updateSize = createAsyncThunk(
  'size/update',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/item/size/${id}`, { name })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update size.',
      )
    }
  },
)

export const deleteSize = createAsyncThunk(
  'size/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/item/size/${id}`)
      return { ...data, id }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete size.',
      )
    }
  },
)

const sizeSlice = createSlice({
  name: 'size',
  initialState,
  reducers: {
    setSizeSearch: (state, action) => {
      state.search = action.payload
    },
    clearSizeError: (state) => {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSizes.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload?.data || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error'
      })
  },
})

export const { setSizeSearch, clearSizeError } = sizeSlice.actions
export default sizeSlice.reducer
