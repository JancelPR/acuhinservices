import React from "react";
import { ReceiptData } from "../types";
import { CURRENCY, STORE_NAME } from "../constants";
import { X, Printer } from "lucide-react";
import Barcode from "react-barcode";

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  // Use receiptNumber if available, otherwise fallback to id
  const displayReceiptNumber =
    receipt.receiptNumber || receipt.id.slice(-5).toUpperCase();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none"
        style={{ width: "58mm", maxWidth: "58mm" }}
      >
        {/* Header - Hidden on print */}
        <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 print:hidden">
          <h2 className="font-bold text-gray-800 text-xs">
            Transaction Complete
          </h2>
          <button
            onClick={onClose}
            className="p-1 bg-red-100 hover:bg-red-200 rounded-full transition-colors text-red-600"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Receipt Content - Printable Area */}
        <div
          className="p-4 overflow-y-auto flex-1 bg-white print:p-0 print:m-0"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
          id="printable-receipt"
        >
          <style>{`
            @media print {
              @page {
                size: 58mm auto;
                margin: 0mm;
              }
              html, body {
                height: auto;
                margin: 0 !important;
                padding: 0 !important;
                background: white;
                font-family: 'Courier New', Courier, monospace !important;
                visibility: hidden;
              }
              #printable-receipt {
                visibility: visible !important;
                position: absolute;
                left: 0;
                top: 0;
                width: 54mm !important;
                margin: 0;
                padding: 2mm !important;
                background: white;
                display: block !important;
              }
              #printable-receipt * {
                visibility: visible !important;
              }
              /* Preserve layout types like flex */
              .flex { display: flex !important; }
              .justify-between { justify-content: space-between !important; }
              .flex-col { flex-direction: column !important; }
            }
            .dashed-line {
              border-top: 1px dashed #000;
              margin: 4px 0;
              width: 100%;
            }
            .double-line {
              border-top: 1px double #000;
              margin: 4px 0;
              width: 100%;
              border-top-width: 3px;
              border-top-style: double;
            }
          `}</style>

          <div className="text-center font-bold">
            <h1 className="text-[13px] uppercase">ACUHIN Grocery Store</h1>
            <p className="text-[10px] uppercase">
              VALLADOLID, NEGROS OCCIDENTAL
            </p>
            <p className="text-[10px]">09388067757</p>
          </div>

          <div className="dashed-line"></div>

          <div className="text-[10px] space-y-0.5">
            <div className="flex justify-start">
              <span className="font-bold">Receipt No:</span>
              <span className="ml-1">{displayReceiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <div>
                <span className="font-bold">DATE:</span>
                <span className="ml-1">
                  {new Date(receipt.date).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="font-bold">TIME:</span>
                <span className="ml-1">
                  {new Date(receipt.date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="dashed-line"></div>

          <div className="space-y-2 mt-1">
            {receipt.items.map((item, idx) => (
              <div key={idx} className="text-[11px]">
                <div className="uppercase">{item.name}</div>
                <div className="flex justify-between pl-2">
                  <div className="flex items-center gap-4">
                    <span>{item.quantity.toFixed(1)}</span>
                    <span>x</span>
                    <span>
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <span className="font-bold">
                    {(item.price * item.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="dashed-line mt-2"></div>

          <div className="text-[11px] flex justify-between">
            <span className="font-bold tabular-nums">
              {receipt.items
                .reduce((sum, item) => sum + item.quantity, 0)
                .toFixed(1)}
            </span>
            <span className="font-bold">Item(s)</span>
          </div>

          <div className="double-line"></div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-medium">SUBTOTAL</span>
              <span className="tabular-nums">
                {receipt.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-[14px] font-black items-baseline mt-1">
              <span>TOTAL</span>
              <span className="tracking-tight">
                {receipt.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="dashed-line mt-2"></div>

          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span className="font-bold">PAYMENT RECEIVED:</span>
              <span className="tabular-nums">
                {receipt.payment?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">CHANGE AMOUNT:</span>
              <span className="tabular-nums">
                {receipt.change?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </span>
            </div>
          </div>

          <div className="dashed-line mt-3"></div>

          <div className="text-center space-y-2 mt-2">
            <div className="text-[11px] font-bold">GOD BLESS</div>
            <div className="dashed-line"></div>

            {/* Barcode Section */}
            <div className="flex flex-col items-center justify-center py-1 overflow-hidden w-full">
              <div className="transform scale-x-90 origin-center">
                <Barcode
                  value={displayReceiptNumber}
                  format="CODE128"
                  width={1}
                  height={30}
                  fontSize={10}
                  font="'Courier New', Courier, monospace"
                  background="transparent"
                  margin={0}
                  displayValue={false}
                />
              </div>
            </div>

            <div className="text-[10px]">Acknowledgement Receipt</div>
            <div className="text-[11px] font-bold">Thank you!</div>
          </div>
        </div>

        {/* Footer Actions - Hidden on print */}
        <div className="p-2 border-t border-gray-100 bg-gray-50 print:hidden flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-purple-600 text-white py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-purple-700 transition-colors"
          >
            <Printer size={12} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
