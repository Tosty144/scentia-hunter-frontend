import './DataTable.css'

/**
 * columns: [{ key, label, align, render }]
 * rows: array de objetos
 */
function DataTable({ columns, rows, emptyText = 'Sin registros por ahora.' }) {
  if (!rows.length) {
    return <div className="sh-table-empty">{emptyText}</div>
  }

  return (
    <div className="sh-table-wrap">
      <table className="sh-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
