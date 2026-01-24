import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Eye,
  ClipboardList,
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

  // Filtered transactions based on date range and transaction ID search
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
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
    });
  }, [transactions, transactionSearchQuery, startDate, endDate]);

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
      <div className="flex-shrink-0 mb-4 pt-0 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <span className="bg-blue-50 p-2 rounded-xl text-[#4285F4]">
                <ClipboardList size={24} />
              </span>
              Logs
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search ID..."
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-900 w-32 md:w-48"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs border-none outline-none text-gray-600 bg-transparent"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs border-none outline-none text-gray-600 bg-transparent"
              />
            </div>

            {(transactionSearchQuery || startDate || endDate) && (
              <button
                onClick={() => {
                  setTransactionSearchQuery("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 pb-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 flex-1">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No transactions found
            </h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto flex-1 rounded-2xl">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="sticky top-0 z-10 bg-gray-50 px-3 md:px-4 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      ID
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
