function Pagination({ currentPage, totalPages, onPageChange }) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between mt-6 px-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700
                 hover:bg-gray-50 hover:border-primary-500 hover:-translate-y-0.5
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        ← Previous
      </button>

      <span className="text-gray-700 font-semibold">
        Page <span className="text-primary-600">{currentPage}</span> of{' '}
        <span className="text-primary-600">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700
                 hover:bg-gray-50 hover:border-primary-500 hover:-translate-y-0.5
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;