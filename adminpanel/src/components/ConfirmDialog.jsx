import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import Modal from "./Modal";

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  description,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const typeStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      button: "bg-red-600 hover:bg-red-700",
      bg: "bg-red-100",
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-500" size={24} />,
      button: "bg-yellow-600 hover:bg-yellow-700",
      bg: "bg-yellow-100",
    },
    info: {
      icon: <Info className="text-blue-500" size={24} />,
      button: "bg-blue-600 hover:bg-blue-700",
      bg: "bg-blue-100",
    },
    success: {
      icon: <CheckCircle className="text-green-500" size={24} />,
      button: "bg-green-600 hover:bg-green-700",
      bg: "bg-green-100",
    },
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${typeStyles[type].bg} mb-4`}>
          {typeStyles[type].icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
        {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${typeStyles[type].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;