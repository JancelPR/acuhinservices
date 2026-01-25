import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Eye,
  ClipboardList,
  ArrowUpDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { ReceiptData } from "../../types";
import { CURRENCY } from "../../constants";
import {
  downloadAsCSV,
  downloadAsPDF,
  downloadAsDOC,
} from "../../utils/receiptDownloads";

interface OrderHistoryProps {
  transactions: ReceiptData[];
  onViewReceipt: (receipt: ReceiptData) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  transactions,
  onViewReceipt,
}) => {
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openDownloadMenu, setOpenDownloadMenu] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "total" | "items">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtered transactions based on date range and transaction ID search
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        // Filter by transaction ID
        const matchesTransactionId =
          !transactionSearchQuery ||
          transaction.id
            .toLowerCase()
            .includes(transactionSearchQuery.toLowerCase());

        if (!matchesTransactionId) return false;

        // Filter by date range
        if (startDate || endDate) {
          const transactionDate = new Date(transaction.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate + "T23:59:59") : null; // include entire end date

          if (start && transactionDate < start) return false;
          if (end && transactionDate > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "date") {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === "total") {
          comparison = a.total - b.total;
        } else if (sortBy === "items") {
          const aItems = a.items.reduce((acc, item) => acc + item.quantity, 0);
          const bItems = b.items.reduce((acc, item) => acc + item.quantity, 0);
          comparison = aItems - bItems;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    transactions,
    transactionSearchQuery,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  // Calculate visible rows based on scroll
  const updateVisibleCount = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const headerHeight = 48;
      const estimatedRowHeight = 72; // Resetting to 72 as it's closer to actual but keeping the bottom-check logic

      // If scrolled to the very bottom (within a small margin), show all records
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setVisibleCount(filteredTransactions.length);
        return;
      }

      // Calculate how many data rows fit in the visible area (excluding header)
      const count = Math.min(
        filteredTransactions.length,
        Math.ceil(
          (scrollTop + clientHeight - headerHeight) / estimatedRowHeight,
        ),
      );
      setVisibleCount(Math.max(0, count));
    }
  }, [filteredTransactions]);

  // Update count on scroll and when data changes
  React.useEffect(() => {
    updateVisibleCount();
  }, [filteredTransactions, updateVisibleCount]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".download-menu-container")) {
        setOpenDownloadMenu(null);
      }
    };

    if (openDownloadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openDownloadMenu]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Terminal Style Header for Logs */}
      <div className="bg-transparent px-4 pt-0 pb-2 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between py-3 px-6 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_15px_35px_-5px_rgba(249,115,22,0.12),0_5px_15px_-3px_rgba(0,0,0,0.04)] relative overflow-hidden group border-none">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-4 tracking-tight relative z-10">
            <div className="relative">
              <span className="flex bg-orange-50 p-2.5 rounded-2xl text-orange-600 shadow-sm ring-1 ring-orange-100/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <ClipboardList size={20} />
              </span>
              <div className="absolute inset-0 bg-orange-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600">
              Logs
            </span>
          </h1>

          {/* Integrated Search Bar */}
          <div className="relative flex-1 max-w-sm ml-auto z-20 group/search">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/70 group-focus-within/search:text-orange-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search transaction ID..."
              value={transactionSearchQuery}
              onChange={(e) => setTransactionSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-orange-50/10 border border-orange-100/30 rounded-full text-sm text-gray-700 placeholder:text-gray-400/80 outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white focus:border-orange-200 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Liquid highlight effect */}
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors duration-700" />
        </div>

        {/* Action Row: Date Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center px-2 py-1">
          {/* Left: Date Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-1 shadow-sm hover:shadow-md transition-all group/range">
              <div className="relative flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-orange-50/50 transition-colors">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">
                  Start
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs font-bold text-gray-600 bg-transparent outline-none cursor-pointer uppercase tracking-tight focus:text-orange-600 transition-colors"
                />
              </div>
              <div className="h-4 w-px bg-gray-200/50" />
              <div className="relative flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-orange-50/50 transition-colors">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">
                  End
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs font-bold text-gray-600 bg-transparent outline-none cursor-pointer uppercase tracking-tight focus:text-orange-600 transition-colors"
                />
              </div>
            </div>

            {(transactionSearchQuery || startDate || endDate) && (
              <button
                onClick={() => {
                  setTransactionSearchQuery("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[10px] uppercase tracking-widest bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold px-3 py-2 rounded-lg transition-all active:scale-95 border border-orange-100/50"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200/50 hidden md:block mx-1" />

          {/* Right: Sort Controls */}
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-1 shadow-sm">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <ArrowUpDown size={14} className="text-orange-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-[10px] font-bold text-gray-600 bg-transparent outline-none cursor-pointer uppercase tracking-tight"
              >
                <option value="date">Date</option>
                <option value="total">Total</option>
                <option value="items">Items</option>
              </select>
            </div>
            <div className="h-4 w-px bg-gray-200/50" />
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1 hover:bg-orange-50 rounded-lg transition-colors text-orange-500"
              title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc size={16} />
              ) : (
                <SortDesc size={16} />
              )}
            </button>
          </div>

          {/* Right Side: Count Indicator */}
          <div className="md:ml-auto">
            <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-1.5 bg-gray-50/50 rounded-full border border-gray-100 md:block hidden">
              Showing <span className="text-orange-500">{visibleCount}</span> of{" "}
              <span className="text-gray-600">
                {filteredTransactions.length}
              </span>{" "}
              records
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 pb-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-white shadow-sm flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-blue-50/50 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-blue-200/20 rounded-full animate-ping duration-[3000ms]" />
              <FileSpreadsheet
                size={40}
                className="text-blue-300 relative z-10"
              />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
              No Logs Found
            </h3>
            <p className="text-slate-400 text-sm font-medium max-w-[240px]">
              Try adjusting your search or date filters to find what you're
              looking for.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col min-h-0">
            <div
              ref={scrollRef}
              onScroll={updateVisibleCount}
              className="overflow-x-auto flex-1 rounded-2xl"
            >
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="sticky top-0 z-10 bg-gray-50 px-3 md:px-4 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      TRANS. ID
                    </th>
                    <th className="sticky top-0 z-10 bg-gray-50 px-3 md:px-4 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="sticky top-0 z-10 bg-gray-50 px-3 md:px-4 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Items
                    </th>

                    {/* Header stays as-is (right aligned) */}
                    <th className="sticky top-0 z-10 bg-gray-50 px-3 md:px-4 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>

                    <th className="sticky top-0 z-10 bg-gray-50 pl-3 md:pl-4 pr-14 md:pr-16 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-3 md:px-4 py-3 md:py-4 text-[11px] md:text-sm text-gray-900 whitespace-nowrap">
                        #{t.id}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {(() => {
                          try {
                            const date = new Date(t.date);
                            return (
                              <div className="flex flex-col">
                                <span className="text-gray-800 text-[11px] md:text-sm">
                                  {date.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="text-[10px] md:text-xs text-gray-500">
                                  {date.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                            );
                          } catch (e) {
                            return t.date;
                          }
                        })()}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-800 text-center whitespace-nowrap">
                        {t.items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                        items
                      </td>

                      {/* ✅ UPDATED TOTAL CELL: aligned under the Total header (without moving header) */}
                      <td className="px-3 md:px-4 py-3 md:py-4 text-[11px] md:text-sm font-medium text-green-600 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1 w-full tabular-nums">
                          <span>{CURRENCY}</span>
                          <span>{t.total.toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="pl-4 pr-1 md:pr-1.5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 md:gap-2">
                          <div className="relative download-menu-container">
                            <button
                              onClick={() =>
                                setOpenDownloadMenu(
                                  openDownloadMenu === t.id ? null : t.id,
                                )
                              }
                              className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-600 text-[10px] md:text-xs font-semibold rounded-md hover:bg-green-100 transition-colors"
                            >
                              <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              <ChevronDown
                                className={`w-2.5 h-2.5 md:w-3 md:h-3 transition-transform ${
                                  openDownloadMenu === t.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {openDownloadMenu === t.id && (
                              <div className="absolute right-0 mt-1 w-32 md:w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button
                                  onClick={() =>
                                    downloadAsPDF(t, setOpenDownloadMenu)
                                  }
                                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-[10px] md:text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 md:gap-2"
                                >
                                  <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-500" />
                                  PDF
                                </button>

                                <button
                                  onClick={() =>
                                    downloadAsDOC(t, setOpenDownloadMenu)
                                  }
                                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-[10px] md:text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 md:gap-2"
                                >
                                  <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
                                  Word
                                </button>

                                <button
                                  onClick={() =>
                                    downloadAsCSV(t, setOpenDownloadMenu)
                                  }
                                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-left text-[10px] md:text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 md:gap-2"
                                >
                                  <FileSpreadsheet className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-500" />
                                  CSV
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => onViewReceipt(t)}
                            className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-semibold rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
