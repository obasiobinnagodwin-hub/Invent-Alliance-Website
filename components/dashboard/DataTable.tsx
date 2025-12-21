interface DataTableProps {
  title: string;
  headers: string[];
  data: Array<Record<string, string | number>>;
  keyField: string;
}

export default function DataTable({ title, headers, data, keyField }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 sm:mb-4">{title}</h3>
        <p className="text-slate-500 text-center py-6 sm:py-8 font-medium text-sm sm:text-base">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200 hover:shadow-xl transition-shadow">
      <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 sm:mb-4">{title}</h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {data.map((row, index) => (
                  <tr
                    key={row[keyField] || index}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    {headers.map((header) => (
                      <td
                        key={header}
                        className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-700 font-medium whitespace-nowrap"
                      >
                        {typeof row[header] === 'number' 
                          ? row[header].toLocaleString() 
                          : row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

