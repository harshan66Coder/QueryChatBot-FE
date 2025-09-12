
import { chartSampledata } from "../chart/ChartSampleData";

const Table = ({ columns, data, isDark }) => {
  const handleDownload = () => {
    const blob = new Blob([chartSampledata], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chart-config.js";
    a.click();
    URL.revokeObjectURL(url); // cleanup
  };
  return (
    <>
      <div className="flex justify-end mt-[50px]">
        <div>
          <button onClick={handleDownload} className="px-6 py-2 rounded-md transition bg-blue-600 text-white hover:bg-blue-700">Download Chart JS</button>
        </div>
      </div>
      <div className="overflow-x-auto">

        <table className={`table ${isDark ? "table-dark" : "table-light"}`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>{row[col.key]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
