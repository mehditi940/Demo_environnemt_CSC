import React, { useMemo, useState } from 'react';
import '../../styles/components/table/UniversalTable.css';

/**
 * UniversalTable
 * Props:
 * - columns: Array<{ key: string, header: string, sortable?: boolean, width?: string, render?: (row) => ReactNode }>
 * - data: Array<any>
 * - emptyMessage?: string
 * - initialSort?: { key: string, direction: 'asc' | 'desc' }
 * - pageSizeOptions?: number[]
 * - defaultPageSize?: number
 */
const UniversalTable = ({
  columns = [],
  data = [],
  emptyMessage = 'Geen data beschikbaar',
  initialSort,
  pageSizeOptions = [10, 25, 50],
  defaultPageSize = 10,
}) => {
  const [sort, setSort] = useState(initialSort || null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const { key, direction } = sort;
    const sorted = [...data].sort((a, b) => {
      const va = a?.[key];
      const vb = b?.[key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return va - vb;
      return String(va).localeCompare(String(vb), 'nl', { numeric: true });
    });
    return direction === 'desc' ? sorted.reverse() : sorted;
  }, [data, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (col) => {
    if (!col.sortable) return;
    setPage(1);
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: col.key, direction: 'desc' };
      return null; // third click clears sorting
    });
  };

  return (
    <div className="ut-wrapper">
      <div className="ut-table-container" role="region" aria-label="Tabel container" tabIndex={0}>
        <table className="ut-table" role="table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const dir = isSorted ? sort.direction : undefined;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`${col.align ? `align-${col.align}` : ''} ${col.compact ? 'col-compact' : ''}`.trim()}
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
                  >
                    <button
                      type="button"
                      className={`ut-th-btn ${col.sortable ? 'sortable' : ''}`}
                      onClick={() => handleSort(col)}
                      aria-label={col.sortable ? `Sorteer op ${col.header}` : undefined}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className={`ut-sort ${dir || 'none'}`} aria-hidden="true">
                          {dir === 'asc' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6l6 6H6l6-6z" fill="currentColor"/></svg>
                          )}
                          {dir === 'desc' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 18l-6-6h12l-6 6z" fill="currentColor"/></svg>
                          )}
                          {!dir && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11h10M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="ut-empty">{emptyMessage}</td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.align ? `align-${col.align}` : ''} ${col.compact ? 'col-compact' : ''}`.trim()}
                      data-label={col.header}
                    >
                      {col.render ? col.render(row) : row?.[col.key] ?? ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ut-pagination" role="navigation" aria-label="Paginatie">
        <div className="ut-page-size">
          <label>
            <span className="sr-only">Rijen per pagina</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              aria-label="Rijen per pagina"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt} / pagina</option>
              ))}
            </select>
          </label>
        </div>
        <div className="ut-page-controls">
          <button disabled={currentPage <= 1} onClick={() => setPage(1)} aria-label="Eerste pagina">«</button>
          <button disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Vorige pagina">‹</button>
          <span className="ut-page-indicator" aria-live="polite">Pagina {currentPage} van {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Volgende pagina">›</button>
          <button disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)} aria-label="Laatste pagina">»</button>
        </div>
      </div>
    </div>
  );
};

export default UniversalTable;


