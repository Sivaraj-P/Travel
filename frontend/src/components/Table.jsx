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
import {  FaTimes, FaCheck } from "react-icons/fa";
import { AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import Navbar from "../components/NavBar";
import url from "../assets/data.xlsx"
// import { API_BASE_URL, travelGET } from "../services/api";
import Modal from 'react-modal';
import { useApi } from '../services/api';


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
  const { travelGET,travelPATCH } = useApi();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await travelGET();
      setData(data);
    } catch ({ response, message }) {
      console.error(" Error fetching data:", response?.data || message);
      if (response?.status === 401) handleLogout();
    }
  };

 
  const handleLogout = () => {
    logout();
    navigate("/");
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
 

 


  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
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
      const response = await travelPATCH(id, { status: currentStatus })
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
                      <td className="p-4">{item?.project_name}</td>
                      <td className="p-4">{item?.user_name}</td>
                      <td className="p-4">{item?.purpose}</td>
                      <td className="p-4">{item?.start_location}</td>
                      <td className="p-4">{item?.end_location}</td>
                      <td className="p-4">{item?.mode}</td>
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
      height: "60%",
      maxWidth: "500px",
      margin: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "8px",
      padding: "20px",
    },
  }}
  isOpen={editStatusDialogOpen}
  onRequestClose={() => setEditStatusDialogOpen(false)}
  contentLabel="Edit Status"
>
  <div className="w-full max-w-md p-6">
    <h2 className="text-xl font-semibold mb-4 text-center">Edit Status</h2>

    <div className="flex justify-center w-full mb-4">
      <select
        value={currentStatus}
        onChange={(e) => setCurrentStatus(e.target.value)}
        className="border p-2 rounded w-full max-w-xs"
      >
        <option value={true}>Approve</option>
        <option value={false}>Reject</option>
      </select>
    </div>

    <div className="flex justify-center w-full">
      <button
        onClick={() => handleStatusChange(currentid)}
        className="bg-green-500 text-white px-4 py-2 rounded w-full max-w-xs hover:bg-green-600 transition"
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
