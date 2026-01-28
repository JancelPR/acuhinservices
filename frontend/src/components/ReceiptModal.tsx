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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 print:p-0 print:static print:block">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] w-full max-w-[320px] print:max-w-none print:w-full print:max-h-none print:shadow-none print:rounded-none print:overflow-visible relative z-[1010]">
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
          className="p-3 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible"
          id="printable-receipt"
        >
          <style>{`
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              html, body {
                height: auto !important;
                overflow: visible !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-receipt, #printable-receipt * {
                visibility: visible !important;
                color: black !important;
              }
              #printable-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 80mm !important;
                margin: 0 !important;
                padding: 6mm 6mm 15mm 6mm !important; /* Added 15mm bottom padding for the cutter */
                background: white !important;
                min-height: auto !important;
                box-shadow: none !important;
              }
              /* Hide fixed containers that might interfere */
              .fixed {
                position: static !important;
                display: block !important;
                background: none !important;
                backdrop-filter: none !important;
                box-shadow: none !important;
              }
              /* Ensure table borders are visible */
              .border-t, .border-b, .border-dashed {
                border-color: #000 !important;
                border-width: 1px !important;
                border-style: solid !important;
              }
              .border-dashed {
                border-style: dashed !important;
              }
            }
          `}</style>
          <div className="text-center mb-2">
            <h1 className="text-xs font-bold uppercase tracking-wide text-gray-900">
              {STORE_NAME}
            </h1>
            <p className="text-[9px] text-gray-500 mt-0.5">
              Neighborhood Convenience Store
            </p>
            <p className="text-[8px] text-gray-400 mt-0.5">
              Prk. 2 Brgy. Palaka, Valladolid, Negros Occidental
            </p>
            <p className="text-[9px] text-gray-400 mt-1">{receipt.date}</p>
            <p className="text-[9px] text-gray-400">Ref: {receipt.id}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-1.5 mb-1.5">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="text-left text-gray-500 text-[8px]">
                  <th className="pb-0.5 font-medium">Item</th>
                  <th className="pb-0.5 font-medium text-center">Qty</th>
                  <th className="pb-0.5 font-medium text-right">Price</th>
                  <th className="pb-0.5 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {receipt.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5 pr-1 max-w-[50px] truncate text-[8px]">
                      {item.name}
                      {item.unit && (
                        <span className="text-[7px] text-gray-400 ml-0.5">
                          ({item.unit})
                        </span>
                      )}
                    </td>
                    <td className="py-0.5 text-center text-[8px]">
                      {item.quantity}
                    </td>
                    <td className="py-0.5 text-right text-[8px]">
                      {CURRENCY}
                      {item.price.toFixed(2)}
                    </td>
                    <td className="py-0.5 text-right font-medium text-[8px]">
                      {CURRENCY}
                      {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-[9px]">Subtotal</span>
              <span className="font-medium text-gray-800 text-[9px]">
                {CURRENCY}
                {receipt.total.toFixed(2)}
              </span>
            </div>
            {receipt.payment !== undefined && receipt.payment > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[9px]">Payment</span>
                  <span className="font-medium text-gray-800 text-[9px]">
                    {CURRENCY}
                    {receipt.payment.toFixed(2)}
                  </span>
                </div>
                {receipt.change !== undefined && receipt.change >= 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[9px]">Change</span>
                    <span className="font-medium text-green-600 text-[9px]">
                      {CURRENCY}
                      {receipt.change.toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between items-center text-xs font-bold mt-1.5 pt-1.5 border-t border-gray-100">
              <span className="text-gray-800">Total</span>
              <span className="text-green-600">
                {CURRENCY}
                {receipt.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center text-[8px] text-gray-400">
            <p>Thank you for shopping with us!</p>
            <p className="mt-0.5">Please come again.</p>
          </div>
        </div>

        {/* Footer Actions - Hidden on print */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 print:hidden flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-full text-xs font-medium flex items-center justify-center gap-1 hover:bg-gray-100 transition-all shadow-sm"
          >
            Dismiss
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#4285F4] text-white py-2.5 px-4 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#1a73e8] transition-all shadow-md shadow-blue-100"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
