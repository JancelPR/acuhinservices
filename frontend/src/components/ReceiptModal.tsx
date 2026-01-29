import React from "react";
import { ReceiptData } from "../types";
import { CURRENCY, STORE_NAME } from "../constants";
import { X, Printer } from "lucide-react";

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

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
          style={{ fontFamily: "'Poppins', sans-serif" }}
          id="printable-receipt"
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap');
            
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
                font-family: 'Poppins', sans-serif !important;
              }
              /* Hide everything by default */
              body > * {
                display: none !important;
              }
              /* Only show the receipt and its parents */
              #printable-receipt, #printable-receipt * {
                display: block !important;
                visibility: visible !important;
                color: black !important;
                font-family: 'Poppins', sans-serif !important;
                line-height: 1.3 !important;
              }
              #printable-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 56mm !important; /* Maximized printable area for 58mm rolls */
                margin: 0;
                padding: 1mm !important;
                background: white;
                box-shadow: none !important;
              }
            }
          `}</style>
          <div className="text-center mb-3">
            <h1 className="text-sm font-bold uppercase tracking-tight text-gray-900 leading-tight">
              {STORE_NAME}
            </h1>
            <p className="text-[10px] text-gray-600 font-medium">
              NEIGHBORHOOD CONVENIENCE STORE
            </p>
            <p className="text-[9px] text-gray-500">
              Prk. Dos, Brgy Palaka, Valladolid
            </p>
          </div>

          <div className="border-t border-dashed border-gray-400 py-1 flex justify-between text-[9px] text-gray-600 font-medium">
            <div className="flex flex-col">
              <span>{receipt.date.split(",")[0]}</span>
              <span>{receipt.date.split(",")[1]?.trim()}</span>
            </div>
            <div className="text-right flex flex-col">
              <span>Receipt #</span>
              <span>{receipt.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 pb-1.5 space-y-1">
            {receipt.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start text-[10px] text-gray-900"
              >
                <span className="flex-1 pr-2 leading-tight">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="text-[8px] text-gray-500 ml-1 italic font-normal">
                      x{item.quantity}
                    </span>
                  )}
                </span>
                <span className="font-bold tabular-nums whitespace-nowrap">
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-900">
              <span>TOTAL:</span>
              <span>
                {CURRENCY}
                {receipt.total.toFixed(2)}
              </span>
            </div>

            {receipt.payment !== undefined && receipt.payment > 0 && (
              <div className="pt-1.5 space-y-0.5">
                <div className="flex justify-between items-center text-[10px] text-gray-600">
                  <span>CASH:</span>
                  <span className="tabular-nums">
                    {receipt.payment.toFixed(2)}
                  </span>
                </div>
                {receipt.change !== undefined && receipt.change >= 0 && (
                  <div className="flex justify-between items-center text-[10px] text-gray-600">
                    <span>CHANGE:</span>
                    <span className="tabular-nums font-bold">
                      {receipt.change.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-400 mt-3 pt-3 text-center">
            <p className="text-[10px] text-gray-900 font-medium">
              Thank you for shopping with us!
            </p>
            <div className="mt-2 text-gray-400 text-[8px] tracking-[0.2em]">
              ------- *** -------
            </div>
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
