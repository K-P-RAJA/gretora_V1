import React, { useEffect, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import styles from "./CustomAlert.module.css";

export default function CustomAlert({ title, message, type, isConfirm, onClose, onConfirm }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // Escape key listener to close alert
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Lock body scrolling when alert is active
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Click outside to close helper
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const getIcon = () => {
    const size = 32;
    switch (type) {
      case "success":
        return <CheckCircle size={size} className={styles.successIcon} />;
      case "error":
        return <XCircle size={size} className={styles.errorIcon} />;
      case "warning":
        return <AlertTriangle size={size} className={styles.warningIcon} />;
      case "info":
      default:
        return <Info size={size} className={styles.infoIcon} />;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${styles[type]}`} ref={modalRef} role="dialog" aria-modal="true">
        {/* Header Decorator / Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        {/* Icon & Title Area */}
        <div className={styles.body}>
          <div className={styles.iconWrapper}>
            {getIcon()}
          </div>
          
          <h3 className={styles.title}>{title}</h3>
          
          <div className={styles.goldDivider}></div>
          
          <p className={styles.message}>{message}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {isConfirm ? (
            <>
              <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onClose}>
                Cancel
              </button>
              <button className={`${styles.btn} ${styles.confirmBtn}`} onClick={onConfirm}>
                Confirm
              </button>
            </>
          ) : (
            <button className={`${styles.btn} ${styles.okBtn}`} onClick={onConfirm}>
              Okay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
