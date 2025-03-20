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
import { FaPrint, FaFileExcel, FaFilePdf, FaUpload, FaCloudUploadAlt, FaSearch, FaDownload, FaTimes, FaCheck } from "react-icons/fa";
import { AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import Navbar from "../components/NavBar";
import url from "../assets/data.xlsx"
import { API_BASE_URL } from "../services/api";
import Modal from 'react-modal';


const Table = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const [dragActive, setDragActive] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [errorData, setErrorData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [editStatusDialogOpen, setEditStatusDialogOpen] = useState(false); // Manage dialog open state
  const [currentStatus, setCurrentStatus] = useState(false); // Store the current status to update it
  const [currentid, setCurrentId] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/travel/`, {
        headers: {
          Authorization: `Bearer ${token.access}`,
        },
      });
      setData(data);
    } catch ({ response, message }) {
      console.error(" Error fetching data:", response?.data || message);
      if (response?.status === 401) handleLogout();
    }
  };
  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) return toast("Please select files to upload.");

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      const { data } = await axios.post("http://10.10.192.179:5001/upload", formData, {
        withCredentials: true,
      });
      toast(data.message);
      setShowUploadModal(false);
      setFiles([]);
      if (data.invalidRows?.length) {
        setErrorData(data.invalidRows.map(rows => rows.error));
        setShowErrorModal(true);
      }
      fetchData();
    } catch ({ response }) {
      console.error("File upload failed:", response?.data?.message);
      toast(response?.data?.message || "File upload failed.");
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
      pkg.project_name.toLowerCase().includes(search.toLowerCase()) ||


      pkg.user_name && pkg.user_name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.purpose && pkg.purpose.toLowerCase().includes(search.toLowerCase()) ||
      pkg.start_location && pkg.start_location.toLowerCase().includes(search.toLowerCase())
      ||
      pkg.end_location && pkg.end_location.toLowerCase().includes(search.toLowerCase())
      ||
      pkg.mode && pkg.mode.toLowerCase().includes(search.toLowerCase())

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

    project_name: pkg.project_name,
    date: pkg.date,
    user_name: pkg.user_name,
    purpose: pkg.purpose,
    end_location: pkg.end_location,
    start_location: pkg.start_location,
    mode: pkg.mode,
    status: pkg.status,
    id: pkg.id,
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

    const tableColumn = ["Project Name", "User Name", "Purpose", "Start Location", "End Location", "Mode", "Date", "Status"];
    const tableRows = data.map((item) => [
      item.project_name,
      item.user_name,
      item.purpose,
      item.start_location,
      item.end_location,
      item.mode,
      item.date,
      item.status,


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
  // const downloadSampleData = () => {
  //   const fileUrl = url; 
  //   const a = document.createElement("a");
  //   a.href = fileUrl;
  //   a.download = "sample_data.xlsx";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };
  const downloadSampleData = () => {
    saveAs(url, "sample_data.xlsx");
  };




  const handleEditStatus = (status, id) => {
    console.log(id)
    setCurrentStatus(status);
    setCurrentId(id);
    setEditStatusDialogOpen(true);
  };

  const handleStatusChange = async (id) => {
    try {
      //  const updatedStatus = !currentStatus;
      const response = await axios.patch(`${API_BASE_URL}/travel/${id}/`, { status: currentStatus }, {
        headers: {
          Authorization: `Bearer ${token.access}`,
        },
      });
      if (response.status === 200) {
        toast("Status updated successfully!");
        fetchData();
        setEditStatusDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast("Error updating status.");
    }
  };




  return (
    <>
      <Navbar />
      <div className="mx-auto p-6 bg-fuchsia-50 min-h-screen" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>



        <div className="pt-20">


          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-fuchsia-800 to-fuchsia-600 text-white">

                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex  cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('project_name')}
                    >
                      <span>Project Name</span>
                      {sortField === 'project_name' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('user_name')}
                    >
                      <span>User Name</span>
                      {sortField === 'user_name' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  {/* <th className="p-4 text-left font-semibold">Project Name</th> */}
                  {/* <th className="p-4 text-left font-semibold">User Name</th> */}
                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex  cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('purpose')}
                    >
                      <span>Purpose</span>
                      {sortField === 'purpose' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  {/* <th className="p-4 text-left font-semibold">Purpose</th> */}
                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex  cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('start_location')}
                    >
                      <span>Start Location</span>
                      {sortField === 'start_location' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  {/* <th className="p-4 text-left font-semibold">Start Location</th> */}
                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex  cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('end_location')}
                    >
                      <span>End Location</span>
                      {sortField === 'end_location' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  {/* <th className="p-4 text-left font-semibold">End Location</th> */}
                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex  cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('mode')}
                    >
                      <span>Mode</span>
                      {sortField === 'mode' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left font-semibold">
                    <button
                      className="flex  cursor-pointer items-center gap-x-2 focus:outline-none hover:text-gray-200 transition"
                      onClick={() => handleSort('date')}
                    >
                      <span>Date</span>
                      {sortField === 'date' && (
                        sortOrder === 'asc' ? <AiOutlineSortAscending /> : <AiOutlineSortDescending />
                      )}
                    </button>
                  </th>
                  {/*         
        <th className="p-4 text-left font-semibold">Mode</th>
        <th className="p-4 text-left font-semibold">Date</th> */}
                  <th className="p-4 text-left font-semibold">Status</th>
                  {token.is_staff &&
                    <th className="p-4 text-left font-semibold">Action</th>
                  }
                </tr>
              </thead>
              <tbody>
                {transformedPackageData.length > 0 ? (
                  transformedPackageData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-fuchsia-50 transition duration-300 ease-in-out"
                    >
                      <td className="p-4">{highlightMatch(item?.project_name, search)}</td>
                      <td className="p-4">{highlightMatch(item?.user_name, search)}</td>
                      <td className="p-4">{highlightMatch(item?.purpose, search)}</td>
                      <td className="p-4">{highlightMatch(item?.start_location, search)}</td>
                      <td className="p-4">{highlightMatch(item?.end_location, search)}</td>
                      <td className="p-4">{highlightMatch(item?.mode, search)}</td>
                      <td className="p-4">{item.date}</td>
                      <td className="p-4 ">{item.status ? <FaCheck color="green" /> : <FaTimes color="red" />}</td>
                      <td className="p-4">
                        {token.is_staff &&
                          <button
                            onClick={() => handleEditStatus(item.status, item.id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                          >
                            Edit
                          </button>
                        }
                      </td>

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



      <Modal
        style={{
          content: {
            width: "50%",
            height: "60%",  // Adjust width as needed
            maxWidth: "500px", // Optional: Set a max-width
            margin: "auto", // Centers the modal
          },
        }}
        isOpen={editStatusDialogOpen} onRequestClose={() => setEditStatusDialogOpen(false)} contentLabel="Edit Status">
        <div className="p-4" style={{}}>
          <h2 className="text-xl mb-4">Edit Status</h2>

          <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: 10 }}>

            <select
              value={currentStatus}
              onChange={(e) => { setCurrentStatus(e.target.value) }}
              className="border p-2 rounded"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => handleStatusChange(currentid)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>




      <ToastContainer position="top-right" autoClose={3000} />


    </>
  );
};


export default Table;
