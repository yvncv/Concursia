export default function EventDates() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date and Time
        </label>
        <input
          type="datetime-local"
          id="startDate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
          End Date and Time
        </label>
        <input
          type="datetime-local"
          id="endDate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
    </div>
  )
}

