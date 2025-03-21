import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import img from "../assets/bg1.svg";
import Navbar from "../components/NavBar";
// import { API_BASE_URL, projectGET, projectPOST } from "../services/api";
import { useApi } from '../services/api';

function ProjectPage() {
  const { token } = useContext(AuthContext);
  const [responseData, setResponseData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
const { projectPOST, projectGET } = useApi();


  // Fetch projects
  const fetchProjectsList = async () => {
    try {
      const response = await projectGET();
      setResponseData(response.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  useEffect(() => {
    fetchProjectsList();
  }, [token]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...responseData].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setResponseData(sortedData);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleReset = () => {
    setFormData({
        name: "",
        description: "",
        is_active: true,
      })
  }
  const handleAddProject = async () => {
    try {
      await projectPOST(formData);
      toast.success("Project added successfully!");
      setShowModal(false);
      handleReset()
      fetchProjectsList(); // Refresh data
    } catch (error) {
      toast.error("Failed to add project");
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="min-h-[100vh] px-4 flex flex-col items-center justify-center bg-cover bg-center bg-opacity-70 inset-0 bg-fuchsia-100 relative pt-20"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="flex justify-between w-full max-w-4xl mb-4">
          <h3 className="text-2xl font-bold text-fuchsia-800">Project List</h3>
          <button
            className="bg-fuchsia-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-fuchsia-600 transition"
            onClick={() => setShowModal(true)}
          >
            + Add Project
          </button>
        </div>

        {responseData.length > 0 && (
          <table className="w-full max-w-4xl border-collapse border border-fuchsia-400 shadow-md">
            <thead>
              <tr className="bg-fuchsia-200 text-left">
                <th
                  className="border border-fuchsia-400 px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID ⬍
                </th>
                <th
                  className="border border-fuchsia-400 px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name ⬍
                </th>
                <th className="border border-fuchsia-400 px-4 py-2">Status</th>
                <th className="border border-fuchsia-400 px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {responseData.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-fuchsia-50 transition">
                  <td className="border border-fuchsia-400 px-4 py-2 text-center">{item.id}</td>
                  <td className="border border-fuchsia-400 px-4 py-2">{item.name}</td>
                  <td className="border border-fuchsia-400 px-4 py-2 text-center">
                    {item.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="border border-fuchsia-400 px-4 py-2">{item.description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Project Modal */}
      {showModal && (
   <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-fuchsia-700 mb-4">Add New Project</h3>
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              className="w-full border px-3 py-2 rounded mb-3"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              className="w-full border px-3 py-2 rounded mb-3"
              value={formData.description}
              onChange={handleChange}
            />
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                name="is_active"
                className="mr-2"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active
            </label>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-fuchsia-500 text-white px-4 py-2 rounded-lg"
                onClick={handleAddProject}
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default ProjectPage;
