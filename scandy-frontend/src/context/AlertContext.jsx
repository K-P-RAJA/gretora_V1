import React, { createContext, useContext, useState } from "react";
import CustomAlert from "../components/CustomAlert";

const AlertContext = createContext(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

function getDefaultTitle(type) {
  switch (type) {
    case "success": return "Success";
    case "error": return "Error";
    case "warning": return "Action Required";
    case "info":
    default: return "Notice";
  }
}

export function AlertProvider({ children }) {
  const [config, setConfig] = useState(null); // { message, title, type, isConfirm, onResolve }

  const showAlert = (message, type = "info", title = null) => {
    return new Promise((resolve) => {
      setConfig({
        message,
        type,
        title: title || getDefaultTitle(type),
        isConfirm: false,
        onResolve: (val) => {
          setConfig(null);
          resolve(val);
        }
      });
    });
  };

  const showConfirm = (message, title = "Confirm") => {
    return new Promise((resolve) => {
      setConfig({
        message,
        type: "warning",
        title,
        isConfirm: true,
        onResolve: (val) => {
          setConfig(null);
          resolve(val);
        }
      });
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {config && (
        <CustomAlert
          title={config.title}
          message={config.message}
          type={config.type}
          isConfirm={config.isConfirm}
          onClose={() => config.onResolve(false)}
          onConfirm={() => config.onResolve(true)}
        />
      )}
    </AlertContext.Provider>
  );
}
