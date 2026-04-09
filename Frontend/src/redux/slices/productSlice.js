import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { axiosInstance } from '../../services/axiosInstance'

const initialState = {
  loading: false,
  creating: false,
  error: '',
  list: [],
  pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  search: '',
}

const getApiError = (error) => {
  const data = error.response?.data
  if (!data) return error.message || 'Request failed.'
  if (typeof data.message === 'string') return data.message
  if (data.message && typeof data.message === 'object') {
    return JSON.stringify(data.message)
  }
  if (typeof data.error === 'string') return data.error
  return 'Failed to create product.'
}

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/item/fetch', {
        params: { page, limit: 50, search },
      })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load products.',
      )
    }
  },
)

export const createProduct = createAsyncThunk(
  'product/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/item/create', payload)
      return data
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  },
)

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/item/${id}`, body)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product.',
      )
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/item/${id}`)
      return { ...data, id }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to deactivate product.',
      )
    }
  },
)

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProductSearch: (state, action) => {
      state.search = action.payload
    },
    clearProductError: (state) => {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload?.data || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error'
      })
      .addCase(createProduct.pending, (state) => {
        state.creating = true
        state.error = ''
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.creating = false
        state.error = ''
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || 'Failed to create product.'
      })
  },
})

export const { setProductSearch, clearProductError } = productSlice.actions
export default productSlice.reducer
