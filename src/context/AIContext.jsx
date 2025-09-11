import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const storedModel = localStorage.getItem("modelName");
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedModel) setModelName(storedModel);
    if (storedApiKey) setApiKey(storedApiKey);
  }, []);

  const updateAuth = (model, key) => {
    setModelName(model);
    setApiKey(key);
    localStorage.setItem("modelName", model);
    localStorage.setItem("apiKey", key);
  };

  const clearAuth = () => {
    setModelName("");
    setApiKey("");
    localStorage.removeItem("modelName");
    localStorage.removeItem("apiKey");
  };


  //http://localhost:5000/questions/68c15cb555ac52519998f139
  // ?apiKey=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
  // &model=deepseek/deepseek-chat-v3.1:free

  

  return (
    <AuthContext.Provider
      value={{
        modelName,
        apiKey,
        setModelName,
        setApiKey,
        updateAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
