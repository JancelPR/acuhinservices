import React from "react";
import { X, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="text-red-500" size={24} />,
          button: "bg-red-500 hover:bg-red-600 focus:ring-red-200",
          iconBg: "bg-red-50",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="text-amber-500" size={24} />,
          button: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-200",
          iconBg: "bg-amber-50",
        };
      case "success":
        return {
          icon: <CheckCircle className="text-green-500" size={24} />,
          button: "bg-green-500 hover:bg-green-600 focus:ring-green-200",
          iconBg: "bg-green-50",
        };
      default:
        return {
          icon: <Info className="text-blue-500" size={24} />,
          button: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-200",
          iconBg: "bg-blue-50",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && <p className="text-gray-600 mb-4">{message}</p>}
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 text-white font-medium rounded-lg transition-all shadow-md focus:ring-4 ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
