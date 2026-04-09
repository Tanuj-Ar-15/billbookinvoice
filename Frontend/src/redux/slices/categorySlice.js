import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { axiosInstance } from '../../services/axiosInstance'

const initialState = {
  loading: false,
  error: '',
  list: [],
  pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  search: '',
}

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async ({ page = 1, search = '' }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/item/fetch/catgories', {
        params: { page, limit: 50, search },
      })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load categories.',
      )
    }
  },
)

export const createCategory = createAsyncThunk(
  'category/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/item/create/category', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create category.',
      )
    }
  },
)

export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/item/category/${id}`, { name })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update category.',
      )
    }
  },
)

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/item/category/${id}`)
      return { ...data, id }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete category.',
      )
    }
  },
)

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategorySearch: (state, action) => {
      state.search = action.payload
    },
    clearCategoryError: (state) => {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload?.data || []
        state.pagination = action.payload?.pagination || state.pagination
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error'
      })
      .addCase(createCategory.fulfilled, () => {})
      .addCase(updateCategory.fulfilled, () => {})
      .addCase(deleteCategory.fulfilled, () => {})
  },
})

export const { setCategorySearch, clearCategoryError } = categorySlice.actions
export default categorySlice.reducer
