import { useState, useEffect, useContext, } from "react";
import axios from "axios";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";
import img from "../assets/bg1.svg"
import {  FaPrint, FaFileExcel, FaFilePdf,FaUpload,FaCloudUploadAlt,FaSearch  } from "react-icons/fa";
import { AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";



const Table = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); 
  const [dragActive, setDragActive] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [errorData, setErrorData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

 
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://10.10.192.179:5001/data", {
        withCredentials: true,
      });
      setData(response.data);
    } catch (error) {
      console.error(" Error fetching data:", error?.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        handleLogout();
      } else {
        console.log("Error fetching data:", error);
      }
    }
  };
  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast("Please select files to upload.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
     const response = await axios.post("http://10.10.192.179:5001/upload", formData, {
        withCredentials: true,
      });
      toast(response.data.message);
      setShowUploadModal(false);
      setFiles([]);
      if (response.data.invalidRows && response.data.invalidRows.length > 0) {
        setErrorData(response.data.invalidRows.map(rows=>rows.error));
        setShowErrorModal(true);
      }
      fetchData();
    } catch (error) {
      console.error("File upload failed:", error);
      toast(error.response.data.message);
    } finally {
      setUploading(false);
    }
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };
  const handleRecordsPerPageChange = (event) => {
    setRecordsPerPage(Number(event.target.value));
    setCurrentPage(1);
};
const handleSearch = (e) => {
  setSearch(e.target.value);
  setCurrentPage(1); 
}; 
const sortData = (data, field, order) => {
  return [...data].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
  });
};
  let filteredData = data;
if (search) {
        filteredData = filteredData.filter(pkg =>
            pkg.department.toLowerCase().includes(search.toLowerCase()) ||

           
pkg.area && pkg.area.toLowerCase().includes(search.toLowerCase())||
pkg.district && pkg.district.toLowerCase().includes(search.toLowerCase())||
pkg.incharge && pkg.incharge.toLowerCase().includes(search.toLowerCase())
 );
    }

    
    if (sortField) {
      filteredData = sortData(filteredData, sortField, sortOrder);
  }
   const indexOfLastRecord = currentPage * recordsPerPage;
   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
   const currentRecords = filteredData?.slice(indexOfFirstRecord, indexOfLastRecord);
  
   const totalPages = Math.ceil(filteredData.length / recordsPerPage);
   const paginate = pageNumber => setCurrentPage(pageNumber);
   const transformedPackageData = currentRecords?.map((pkg, index) => ({

        department: pkg.department,
        date: pkg.date,
        dailyProduction: pkg.dailyProduction,
        dailyConsumption: pkg.dailyConsumption,
        distributionCharges: pkg.distributionCharges,
        district: pkg.district,
        area: pkg.area,
        incharge: pkg.incharge,
      
        slideIndex: index
    })) || [];
    const highlightMatch = (text, term) => {
      if (!term) return text;
      const parts = text?.split(new RegExp(`(${term})`, 'gi'));
      return parts?.map((part, index) =>
          part.toLowerCase() === term.toLowerCase() ? <span key={index} className="bg-yellow-300">{part}</span> : part
      );
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print Table</title></head><body>");
    printWindow.document.write("<h2>Data Table</h2>");
    printWindow.document.write("<table border='1' style='border-collapse: collapse; width: 100%; text-align: left;'>");
    printWindow.document.write("<tr><th>Department</th><th>Date</th><th>Daily Production</th><th>Daily Consumption</th><th>Distribution Charges</th><th>District</th><th>Area</th><th>In-Charge</th></tr>");
    
    data.forEach((item) => {
      printWindow.document.write(
        `<tr>
          <td>${item.department}</td>
          <td>${item.date}</td>
          <td>${item.dailyProduction}</td>
          <td>${item.dailyConsumption}</td>
          <td>${item.distributionCharges}</td>
          <td>${item.district}</td>
          <td>${item.area}</td>
          <td>${item.incharge}</td>
        </tr>`
      );
    });

    printWindow.document.write("</table></body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Data Table", 20, 10);

    const tableColumn = ["Department", "Date", "Daily Production", "Daily Consumption", "Distribution Charges", "District", "Area", "In-Charge"];
    const tableRows = data.map((item) => [
      item.department,
      item.date,
      item.dailyProduction,
      item.dailyConsumption,
      item.distributionCharges,
      item.district,
      item.area,
      item.incharge,
    ]);

    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save("data_table.pdf");
  };

  const handleExportExcel = () => {
    // eslint-disable-next-line no-unused-vars
    const exportData = data.map(({ _id, __v, ...rest }) => rest); 
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(fileData, "data_table.xlsx");
  };
   const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
};


  return (
    <div className="mx-auto p-6 bg-fuchsia-50 min-h-screen"style={{ backgroundImage: `url(${img})`,backgroundSize: 'cover',backgroundPosition: 'center',backgroundRepeat: 'no-repeat'}}>
    <nav className="bg-fuchsia-800 text-white p-4 fixed top-0 left-0 w-full shadow-md z-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Management</h1>
        <ul className="flex space-x-4">
          <li>
            <button 
              onClick={() => navigate("/table")}  className="hover:text-fuchsia-300" >Home</button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/form")}  className="hover:text-fuchsia-300" >Create</button>
          </li>
          <li>
            <button onClick={() => navigate("/Analytic")}  className="hover:text-fuchsia-300" >Analytic</button>
          </li>
          <li>
            <button onClick={handleLogout} className="hover:text-fuchsia-300">Logout </button>
          </li>
        </ul>
      </div>
    </nav>

    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-2"> 
      </div>
    </div> 
    {showErrorModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
      <h3 className="text-xl font-bold mb-4 text-red-500">Upload Errors</h3>
      <ul className="list-disc pl-5 space-y-2">
        {errorData.map((error, index) => (
          <li key={index} className="text-sm text-red-700">
            {error}
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowErrorModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
 
    {showUploadModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 transform transition-transform duration-300 scale-100 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-4 text-fuchsia-800">Upload File</h3>
          <div className="absolute -top-10 -right-10 opacity-20 animate-bounce">
            <svg className="h-32 w-32 text-fuchsia-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2zm-1 14.93V11H9v6h2zm2 0V11h-2v6h2zm2 0V11h-2v6h2z"/>
            </svg>
          </div>
          <div className="absolute -bottom-8 -left-8 opacity-10 animate-pulse">
            <svg className="h-40 w-40 text-fuchsia-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2zm-1 14.93V11H9v6h2zm2 0V11h-2v6h2zm2 0V11h-2v6h2z"/>
            </svg>
          </div>
         
         {files.length === 0 ?( <div 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop} 
            className={`border-dashed border-4 rounded-lg p-6 transition-colors duration-300 ${dragActive ? 'border-fuchsia-600 bg-fuchsia-50' : 'border-fuchsia-300 bg-gray-50'}`}
          >
            <div className="text-center">
              <FaCloudUploadAlt className="mx-auto text-4xl text-fuchsia-800 mb-4" />
              <p className="text-gray-600">Drag & Drop files here or</p>
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer text-fuchsia-800 font-bold hover:underline">
                Browse Files
              </label>
            </div>
          </div>
         ):(
           <div className="flex space-x-2"> 
            {files.map((file, index) => ( 
              <div key={index} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                <span className="text-fuchsia-800">{file.name}</span>
                <button
                  onClick={() => setFiles((files) => files.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                  disabled={uploading}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            ))}
           </div>)}
          <div className="flex justify-end space-x-3 mt-4">
            <button 
              onClick={() => setShowUploadModal(false)} 
              className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition duration-300"
              disabled={uploading}>
              Cancel
            </button>
            <button 
              onClick={handleUpload} 
              className={`px-4 py-2 rounded-full transition duration-300 ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-fuchsia-800 text-white hover:bg-fuchsia-700"}`} 
              disabled={uploading}>
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : "Upload"}
            </button>
          </div>
        </div>
      </div>
    )
}

<div className="pt-20"> 
    <div className="bg-white p-6 shadow-2xl rounded-2xl mt-6">
      <div className="flex justify-between items-center mb-4 gap-4">
        <select
          id="recordsPerPage"
          value={recordsPerPage}
          onChange={handleRecordsPerPageChange}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value={5}>5</option>
          {filteredData?.length > 5 && <option value={10}>10</option>}
          {filteredData?.length > 10 && <option value={15}>15</option>}
          {filteredData?.length > 15 && <option value={20}>20</option>}
        </select>       
      
        <div className="relative w-1/3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <FaSearch />
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            value={search} 
            onChange={handleSearch} 
            className="w-full pl-10 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          />
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setShowUploadModal(true)} 
            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-md transition duration-200 flex items-center">
            <FaUpload className="mr-2" /> Upload
          </button>
          <button onClick={handlePrint} className="bg-fuchsia-800 hover:bg-fuchsia-700 text-white p-2 rounded-lg shadow-md transition duration-200">
            <FaPrint />
          </button>
          <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-md transition duration-200">
            <FaFileExcel />
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg shadow-md transition duration-200">
            <FaFilePdf />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
  <table className="min-w-full bg-white border-collapse">
    <thead>
      <tr className="bg-gradient-to-r from-fuchsia-800 to-fuchsia-600 text-white">
        <th className="p-4 text-left font-semibold">
          <button
            className="flex items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
            onClick={() => handleSort('Department')}
          >
            <span>Department</span>
            {sortField === 'Department' && (
              sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
            )}
          </button>
        </th>
        <th className="p-4 text-left font-semibold">
          <button
            className="flex items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
            onClick={() => handleSort('date')}
          >
            <span>Date</span>
            {sortField === 'Date' && (
              sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
            )}
          </button>
        </th>
        <th className="p-4 text-left font-semibold">
          <button
            className="flex items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
            onClick={() => handleSort('Daily Production')}
          >
            <span>Daily Production</span>
            {sortField === 'Daily Production' && (
              sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
            )}
          </button>
        </th>
        <th className="p-4 text-left font-semibold">Daily Consumption</th>
        <th className="p-4 text-left font-semibold">Distribution Charges</th>
        <th className="p-4 text-left font-semibold">District</th>
        <th className="p-4 text-left font-semibold">Area</th>
        <th className="p-4 text-left font-semibold">In-Charge</th>
      </tr>
    </thead>
    <tbody>
      {transformedPackageData.length > 0 ? (
        transformedPackageData.map((item, index) => (
          <tr
            key={index}
            className="border-b hover:bg-fuchsia-50 transition duration-300 ease-in-out"
          >
            <td className="p-4">{highlightMatch(item?.department, search)}</td>
            <td className="p-4">{item.date}</td>
            <td className="p-4">{item.dailyProduction}</td>
            <td className="p-4">{item.dailyConsumption}</td>
            <td className="p-4">{item.distributionCharges}</td>
            <td className="p-4">{highlightMatch(item?.district, search)}</td>
            <td className="p-4">{highlightMatch(item?.area, search)}</td>
            <td className="p-4">{highlightMatch(item?.incharge, search)}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="8" className="text-center p-4 text-gray-500">No data available</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {filteredData?.length !== 0 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 px-4 border rounded-lg ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-fuchsia-800 text-white hover:bg-fuchsia-700 transition duration-200"}`}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`p-2 px-4 border rounded-lg ${currentPage === i + 1 ? "bg-fuchsia-800 text-white" : "bg-gray-200 hover:bg-gray-300 transition duration-200"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={filteredData?.length === 0 || currentPage === Math.ceil(filteredData?.length / recordsPerPage)}
            className={`p-2 px-4 border rounded-lg ${filteredData?.length === 0 || currentPage === Math.ceil(filteredData?.length / recordsPerPage) ? "bg-gray-300 cursor-not-allowed" : "bg-fuchsia-800 text-white hover:bg-fuchsia-700 transition duration-200"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
</div>

    <ToastContainer position="top-right" autoClose={3000} />

  </div>
);
};


export default Table;
