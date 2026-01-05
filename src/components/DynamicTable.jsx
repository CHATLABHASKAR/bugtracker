import React, { useState } from 'react';

/**
 * DynamicTable - A reusable table component with pagination, actions, and selection
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Column configuration array
 * @param {Function} props.onRowClick - Handler for row click: (row) => void
 * @param {Array} props.actions - Array of action configurations: [{key, icon, label, tooltip, className}]
 * @param {Function} props.onAction - Handler for action buttons: (actionKey, row) => void
 * @param {Object} props.selectedRow - Currently selected row object
 * @param {Boolean} props.showPagination - Whether to show pagination (default: true)
 * @param {Number} props.itemsPerPage - Items per page (default: 10)
 * @param {Boolean} props.showSerialNumber - Whether to show serial number column (default: true)
 * @param {String} props.emptyMessage - Message to show when no data
 * @param {String} props.emptyIcon - Material icon name for empty state
 * @param {String} props.tableClassName - Additional classes for table
 */
const DynamicTable = ({
    data = [],
    columns = [],
    onRowClick,
    actions = [],
    onAction,
    selectedRow = null,
    showPagination = true,
    itemsPerPage = 10,
    showSerialNumber = true,
    emptyMessage = "No data found",
    emptySubMessage = "Add new items to get started.",
    emptyIcon = "inbox",
    tableClassName = "",
    headerBgColor = "bg-[#E7F1FF]",
    stickyHeader = true
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderCellContent = (column, row, rowIndex) => {
        const { key, render } = column;

        // Custom render function
        if (render) {
            return render(row, rowIndex);
        }

        // Default: get value from row object
        const value = key.split('.').reduce((obj, k) => obj?.[k], row);
        return value || '-';
    };

    const isRowSelected = (row) => {
        if (!selectedRow) return false;
        return selectedRow.id === row.id;
    };


    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar relative">
                <table className={`min-w-full text-sm text-left border-collapse whitespace-nowrap ${tableClassName}`}>
                    <thead className={`${headerBgColor} text-slate-700 sticky top-0 z-20 shadow-sm`}>
                        <tr>
                            {showSerialNumber && (
                                <th className="px-5 py-3.5 font-bold tracking-wide border-b border-blue-100 w-16 text-center whitespace-nowrap bg-inherit">
                                    S.No
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-5 py-3.5 font-bold tracking-wide border-b border-blue-100 whitespace-nowrap bg-inherit ${column.align === 'center' ? 'text-center' :
                                        column.align === 'right' ? 'text-right' :
                                            'text-left'
                                        }`}
                                >
                                    {column.label}
                                </th>
                            ))}
                            {actions.length > 0 && (
                                <th className="px-5 py-3.5 font-bold tracking-wide border-b border-blue-100 text-center whitespace-nowrap bg-inherit">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showSerialNumber ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                                    className="p-12 text-center"
                                >
                                    <div className="flex flex-col items-center text-slate-400">
                                        <span className="material-icons text-5xl mb-3 opacity-20">{emptyIcon}</span>
                                        <p className="text-lg font-medium">{emptyMessage}</p>
                                        <p className="text-sm">{emptySubMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => {
                                const isSelected = isRowSelected(row);
                                return (
                                    <tr
                                        key={row.id || index}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={`group transition-all duration-200 ${onRowClick ? 'cursor-pointer' : ''
                                            } ${isSelected
                                                ? 'bg-blue-50/80 border-l-4 border-l-blue-500'
                                                : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                            }`}
                                    >
                                        {showSerialNumber && (
                                            <td className="px-5 py-4 text-center font-medium text-slate-500 whitespace-nowrap">
                                                {startIndex + index + 1}
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`px-5 py-4 whitespace-nowrap ${column.align === 'center' ? 'text-center' :
                                                    column.align === 'right' ? 'text-right' :
                                                        'text-left'
                                                    } ${column.className || ''
                                                    }`}
                                            >
                                                {renderCellContent(column, row, startIndex + index)}
                                            </td>
                                        ))}
                                        {actions.length > 0 && (
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {actions.map((action) => (
                                                        <button
                                                            key={action.key}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onAction) {
                                                                    onAction(action.key, row);
                                                                }
                                                            }}
                                                            className={`p-1.5 rounded-full transition-colors ${action.className ||
                                                                'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                                                }`}
                                                            title={action.tooltip || action.label}
                                                        >
                                                            <span className="material-icons text-lg">{action.icon}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showPagination && data.length > 0 && (
                <div className="bg-white border-t border-slate-200 p-2 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-slate-600 gap-2 sm:gap-0 shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 hidden sm:inline">Show:</span>
                        <select
                            className="border border-slate-300 rounded px-2 py-1 bg-slate-50 text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                            value={itemsPerPage}
                            onChange={() => {
                                setCurrentPage(1);
                                // Note: itemsPerPage is controlled by parent, this is just UI
                            }}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span className="text-slate-400 hidden sm:inline">results per page</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 transition-colors shadow-sm flex items-center"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span className="material-icons text-xs align-middle mr-1">chevron_left</span>
                            Prev
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-blue-600 text-white rounded shadow-sm">
                                {currentPage}
                            </span>
                            <span className="text-slate-400">/ {Math.max(1, totalPages)}</span>
                        </div>
                        <button
                            className="px-3 py-1.5 bg-[#0F2942] text-white border border-[#0F2942] rounded hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm flex items-center"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                            <span className="material-icons text-xs align-middle ml-1">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicTable;
