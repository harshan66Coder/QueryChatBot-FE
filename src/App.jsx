import React, { useEffect, useState } from "react";
import FileUploader from "./components/FileUploader";
import Authentication from "./components/Authentication";
import { Toaster } from "react-hot-toast";
import SunLineIcon from 'remixicon-react/SunLineIcon';
import SunFillIcon from 'remixicon-react/SunFillIcon';
import HumanQuestion from "./components/HumanQuestion";
import GeneratedOutput from "./components/output/GeneratedOutput";
import DynamicChart from "./components/chart/ChartSelector";


const App = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };


  return (
    <div
      className={`min-h-screen mx-auto p-4 transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-white text-black"
        } p-3`}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "black" : "white",
            color: isDark ? "white" : "black",
            border: `1px solid ${isDark ? "white" : "black"}`,
            borderRadius: "8px",
            fontWeight: "600",
          },
          success: {
            iconTheme: {
              primary: isDark ? "white" : "black",
              secondary: isDark ? "black" : "white",
            },
          },
          error: {
            iconTheme: {
              primary: isDark ? "white" : "black",
              secondary: isDark ? "black" : "white",
            },
          },
          duration: 4000,
        }}
      />
      <div>
        <button
          onClick={toggleTheme}
          className="fixed top-5 right-5 z-50 cursor-pointer"
        >
          {isDark ? (
            <SunFillIcon size={24} color="orange" />
          ) : (
            <SunLineIcon size={24} color="orange" />
          )}
        </button>

      </div>


      <Authentication isDark={isDark} />
      <FileUploader isDark={isDark} />
      <HumanQuestion isDark={isDark} />
      <GeneratedOutput isDark={isDark} />
      <DynamicChart isDark={isDark} />
    </div>
  );
};

export default App;
