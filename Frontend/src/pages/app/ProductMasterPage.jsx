import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PaginationBar from '../../components/common/PaginationBar'
import { fetchCategories } from '../../redux/slices/categorySlice'
import {
  clearProductError,
  createProduct,
  deleteProduct,
  fetchProducts,
} from '../../redux/slices/productSlice'
import { fetchSizes } from '../../redux/slices/sizeSlice'

const emptyPriceRow = () => ({ size_id: '', price: '' })

const ProductMasterPage = () => {
  const dispatch = useDispatch()
  const { loading, creating, error, list, pagination } = useSelector(
    (state) => state.product,
  )
  const categories = useSelector((state) => state.category.list)
  const sizes = useSelector((state) => state.size.list)

  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [isVeg, setIsVeg] = useState(true)
  const [category_id, setCategory_id] = useState('')
  const [priceRows, setPriceRows] = useState([emptyPriceRow()])

  const [localSearch, setLocalSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, search: '' }))
    dispatch(fetchSizes({ page: 1, search: '' }))
    dispatch(fetchProducts({ page: 1, search: '' }))
  }, [dispatch])

  const loadPage = (page) => {
    dispatch(fetchProducts({ page, search: appliedSearch }))
  }

  const applySearch = () => {
    const q = localSearch.trim()
    setAppliedSearch(q)
    dispatch(fetchProducts({ page: 1, search: q }))
  }

  const addPriceRow = () => setPriceRows((r) => [...r, emptyPriceRow()])

  const updatePriceRow = (index, field, value) => {
    setPriceRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )
  }

  const removePriceRow = (index) => {
    setPriceRows((rows) => rows.filter((_, i) => i !== index))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    dispatch(clearProductError())
    setValidationError('')
    if (!itemName.trim()) {
      setValidationError('Product name is required.')
      return
    }
    if (!category_id) {
      setValidationError('Please select a category.')
      return
    }
    const price = priceRows
      .filter((r) => r.size_id && r.price !== '')
      .map((r) => ({
        size_id: r.size_id,
        price: Number(r.price),
      }))
      .filter((row) => Number.isFinite(row.price) && row.price >= 0)
    if (price.length === 0) {
      setValidationError(
        'Add at least one size and valid price. Create sizes under Size master first.',
      )
      return
    }
    const resultAction = await dispatch(
      createProduct({
        itemName: itemName.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        isVeg,
        category_id,
        price,
      }),
    )
    if (createProduct.fulfilled.match(resultAction)) {
      setItemName('')
      setDescription('')
      setIsVeg(true)
      setCategory_id('')
      setPriceRows([emptyPriceRow()])
      dispatch(fetchProducts({ page: 1, search: appliedSearch }))
    }
  }

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this product?')) return
    await dispatch(deleteProduct(id))
    dispatch(fetchProducts({ page: pagination.page, search: appliedSearch }))
  }

  const clearErr = () => dispatch(clearProductError())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Product master
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Serial numbers auto-increment. Category, size, and price are required.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Product name</label>
            <input
              required
              value={itemName}
              onChange={(e) => {
                clearErr()
                setValidationError('')
                setItemName(e.target.value)
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              required
              value={category_id}
              onChange={(e) => {
                setValidationError('')
                setCategory_id(e.target.value)
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isVeg}
            onChange={(e) => setIsVeg(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Vegetarian (isVeg)
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Price by size
            </p>
            <button
              type="button"
              onClick={addPriceRow}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
            >
              <Plus size={14} />
              Add size
            </button>
          </div>
          {priceRows.map((row, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <select
                value={row.size_id}
                onChange={(e) =>
                  updatePriceRow(index, 'size_id', e.target.value)
                }
                className="min-w-[140px] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Size</option>
                {sizes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                placeholder="Price"
                value={row.price}
                onChange={(e) =>
                  updatePriceRow(index, 'price', e.target.value)
                }
                className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              {priceRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriceRow(index)}
                  className="rounded-lg border border-red-200 px-2 py-2 text-red-600 dark:border-red-900/50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {(validationError || error) && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {validationError || error}
          </p>
        )}

        <button
          type="submit"
          disabled={creating}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {creating ? 'Saving…' : 'Create product'}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 md:max-w-md"
            placeholder="Search by name, serial, description…"
          />
          <button
            type="button"
            onClick={applySearch}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-800"
          >
            Search
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Serial</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Veg</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2">Prices</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-6 text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                list.map((row, idx) => (
                  <tr
                    key={row._id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 pr-4 text-slate-500">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {row.serialNumber ?? '—'}
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                      {row.itemName}
                    </td>
                    <td className="py-3 pr-4">
                      {row.category_id?.name || '—'}
                    </td>
                    <td className="py-3 pr-4">{row.isVeg ? 'Yes' : 'No'}</td>
                    <td className="py-3 pr-4">
                      {row.isActive ? 'Yes' : 'No'}
                    </td>
                    <td className="py-3 align-top">
                      <ul className="space-y-1 text-xs">
                        {(row.price || []).map((p, i) => (
                          <li key={i}>
                            {p.size_id?.name || 'Size'}: ₹{p.price}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => deactivate(row._id)}
                        className="mt-2 text-xs font-semibold text-red-600"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          disabled={loading}
          onPageChange={loadPage}
          label="products"
        />
      </div>
    </div>
  )
}

export default ProductMasterPage
