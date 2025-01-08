interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  }
  
  export default function Pagination({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange 
  }: PaginationProps) {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
  
    if (pageNumbers.length <= 1) return null;
  
    return (
      <div className="flex justify-center items-center m-6">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-4 py-2 rounded-3xl mx-2 ${
              currentPage === number
                ? "bg-rojo text-white"
                : "bg-gray-300 text-gray-700"
            } hover:bg-red-500 transition-all`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  }