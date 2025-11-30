'use client'

export function MatchupCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-5 py-3 bg-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="h-5 bg-gray-600 rounded-full w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3">
        {/* Teams Row */}
        <div className="grid grid-cols-3 gap-2 items-center mb-3">
          {/* Away Team */}
          <div className="flex items-center justify-start gap-2">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
          </div>

          {/* Center Date */}
          <div className="text-center border-l border-r border-gray-200 dark:border-gray-700 px-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-end gap-2">
            <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
            <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Consensus Lines Placeholder */}
        <div className="mt-3 p-3 rounded-lg min-h-[38px]">
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 ml-auto"></div>
          </div>
        </div>

        {/* Covers Stats Placeholder */}
        <div className="mt-4 p-3 rounded-lg space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="h-[35px] bg-gray-300 dark:bg-gray-600 rounded-lg w-28"></div>
          <div className="h-[35px] bg-gray-300 dark:bg-gray-600 rounded-lg w-40"></div>
        </div>
      </div>
    </div>
  )
}

