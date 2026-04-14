interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  category: 'gallery' | 'press';
  createdAt: Date | null;
}

interface BooksSectionProps {
  books?: WorkItem[];
}

export function BooksSection({ books = [] }: BooksSectionProps) {
  if (books.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">저서 &amp; 작품</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <p className="text-sm text-gray-400">아직 등록된 작품이 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">저서 및 작품 목록이 이곳에 표시됩니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">저서 &amp; 작품</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {books.map((book) => (
          <div key={book.id} className="flex flex-col gap-2">
            <div className="aspect-[3/4] overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{book.title}</p>
            {book.description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{book.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
