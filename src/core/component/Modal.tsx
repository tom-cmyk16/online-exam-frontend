import React from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
      />
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
