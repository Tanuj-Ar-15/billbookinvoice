const PaginationBar = ({
  page,
  totalPages,
  total,
  onPageChange,
  disabled,
  label = 'items',
}) => {
  if (totalPages <= 1 && total === 0) return null

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-600 dark:text-slate-400">
        Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>{' '}
        ({total} {label})
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default PaginationBar
