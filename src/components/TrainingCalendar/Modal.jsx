import React from "react";
import "./Modal.css";

const Modal = ({ dueDate, closeModal }) => {
  if (!dueDate) return null; // Don't render if there's no due date

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Due Date</h3>
        <p>{dueDate.slice(0, 10)}</p>
        <button className="close-btn" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
