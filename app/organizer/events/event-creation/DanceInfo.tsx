export default function DanceInfo() {
  const danceLevels = ["Beginner", "Intermediate", "Advanced", "Professional"]
  const danceCategories = ["Salsa", "Bachata", "Kizomba", "Merengue"]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-700">Dance Levels</h3>
        <div className="mt-2 space-y-2">
          {danceLevels.map((level) => (
            <div key={level} className="flex items-center">
              <input
                type="checkbox"
                id={`level-${level}`}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`level-${level}`} className="ml-2 block text-sm text-gray-900">
                {level}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-700">Dance Categories</h3>
        <div className="mt-2 space-y-2">
          {danceCategories.map((category) => (
            <div key={category} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category}`}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-900">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

