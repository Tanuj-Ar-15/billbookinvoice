import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { adminAxiosInstance } from '../../services/adminAxiosInstance'

const empty = {
  name: '',
  email: '',
  address: '',
  phone: '',
  password: '',
  GSTIN: '',
  isActive: true,
}

const AdminRestaurantFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await adminAxiosInstance.get(`/admin/restaurants/${id}`)
        if (data.success && data.data.restaurant) {
          const r = data.data.restaurant
          if (!cancelled) {
            setForm({
              name: r.name || '',
              email: r.email || '',
              address: r.address || '',
              phone: r.phone || '',
              password: '',
              GSTIN: r.GSTIN || '',
              isActive: r.isActive !== false,
            })
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Could not load restaurant.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  const update = (field) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: v }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        const payload = {
          name: form.name,
          email: form.email,
          address: form.address,
          phone: form.phone,
          GSTIN: form.GSTIN || null,
          isActive: form.isActive,
        }
        if (form.password.trim()) {
          payload.password = form.password
        }
        await adminAxiosInstance.patch(`/admin/restaurants/${id}`, payload)
      } else {
        await adminAxiosInstance.post('/admin/restaurants', {
          name: form.name,
          email: form.email,
          address: form.address,
          phone: form.phone,
          password: form.password,
          GSTIN: form.GSTIN || null,
        })
      }
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        Loading…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to list
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {isEdit ? 'Edit restaurant' : 'Add restaurant'}
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {isEdit
          ? 'Update details or reset password. Leave password blank to keep the current one.'
          : 'Creates a restaurant account they can use to log in (with OTP) like a self-registered venue.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {error ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="r-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="r-name"
            required
            value={form.name}
            onChange={update('name')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="r-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="r-email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="r-phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <input
            id="r-phone"
            required
            value={form.phone}
            onChange={update('phone')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="r-address" className="mb-1 block text-sm font-medium">
            Address
          </label>
          <textarea
            id="r-address"
            required
            rows={3}
            value={form.address}
            onChange={update('address')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="r-gstin" className="mb-1 block text-sm font-medium">
            GSTIN <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="r-gstin"
            value={form.GSTIN}
            onChange={update('GSTIN')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="r-password" className="mb-1 block text-sm font-medium">
            Password {isEdit ? '(optional)' : ''}
          </label>
          <input
            id="r-password"
            type="password"
            autoComplete="new-password"
            required={!isEdit}
            value={form.password}
            onChange={update('password')}
            placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 6 characters'}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {isEdit ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={update('isActive')}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Account active (can sign in)</span>
          </label>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create restaurant'
          )}
        </button>
      </form>
    </div>
  )
}

export default AdminRestaurantFormPage
