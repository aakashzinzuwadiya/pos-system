import React from 'react';
import './Modal.css';

interface ModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  handleButton?: () => void;
  buttonLabel?: string;
  showButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ className, isOpen, onClose, title, children, handleButton, buttonLabel= 'Print', showButton= false }) => {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <div className="modal-header">
          <h2 className={`text-xl font-semibold ${className || ''}`}>{title}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        {/* Scrollable Content */}
        <div className="modal-body">
          {children}
        </div>

        {/* Optional Footer */}
        {showButton && <div className="modal-footer">
          {/* Print Button */}
              <button onClick={handleButton} className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                {buttonLabel}
              </button>
        </div>}
      </div>
    </div>
  );
};

export default Modal;
