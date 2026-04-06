import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ data, columns, keyExtractor, isLoading, emptyMessage = 'No data available' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white border border-surface-200 rounded-xl shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface-50 border-b border-surface-200 text-surface-600">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-3 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-surface-500">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-surface-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-surface-50/50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 text-surface-700 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
