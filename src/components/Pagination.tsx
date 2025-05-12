import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  current: number;
  totalRecords?: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  current,
  totalRecords,
  pageSize = 10,
  onChange,
}: PaginationProps) {
  const pageCount = totalRecords ? Math.ceil(totalRecords / pageSize) : 1;

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", pageCount);
      } else if (current >= pageCount - 3) {
        pages.push(
          1,
          "...",
          pageCount - 4,
          pageCount - 3,
          pageCount - 2,
          pageCount - 1,
          pageCount
        );
      } else {
        pages.push(
          1,
          "...",
          current - 1,
          current,
          current + 1,
          "...",
          pageCount
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center mb-4 py-4 space-x-2 select-none">
      <div
        className={`${current === 1 ? "text-gray-400" : "text-black"}  px-2 ${
          current === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={() => current !== 1 && onChange(current - 1)}
        tabIndex={0}
        role="button"
        aria-disabled={current === 1}
      >
        <FiChevronLeft size={24} />
      </div>
      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <div
            key={idx}
            className={`relative px-2 text-lg ${
              page === current
                ? "text-black font-semibold"
                : "text-gray-700 hover:text-blue-600 cursor-pointer"
            }`}
            onClick={() => typeof page === "number" && onChange(page)}
            tabIndex={0}
            role="button"
            aria-current={page === current ? "page" : undefined}
          >
            {page}
            {page === current && (
              <span className="block h-1 bg-blue-600 rounded absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-4"></span>
            )}
          </div>
        )
      )}
      <div
        className={`${
          current === pageCount ? "text-gray-400" : "text-black"
        } px-2 ${
          current === pageCount
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
        onClick={() => current !== pageCount && onChange(current + 1)}
        tabIndex={0}
        role="button"
        aria-disabled={current === pageCount}
      >
        <FiChevronRight size={24} />
      </div>
    </div>
  );
}
