export default function EventDetails() {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity
        </label>
        <input
          type="number"
          id="capacity"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="Enter event capacity"
        />
      </div>
      <div>
        <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
          Event Type
        </label>
        <select
          id="eventType"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          <option value="">Select event type</option>
          <option value="competition">Competition</option>
          <option value="exhibition">Exhibition</option>
          <option value="workshop">Workshop</option>
        </select>
      </div>
    </div>
  )
}

