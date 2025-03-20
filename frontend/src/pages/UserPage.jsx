import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import img from "../assets/bg1.svg"
import Navbar from "../components/NavBar";
import { API_BASE_URL } from "../services/api";

function UserPage() {
  const modes = ["flight", "TRANSCO", "TANGEDCO"];
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUser] = useState([]);

  const [areas, setAreas] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    project: 1,
    date: "",
    purpose: "",
    start_location: "",
    end_location: "",
    mode: "",
  });

  const fetchProjectsList = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user-projects/${token.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token.access}`,
          },
        }
      );

      const data = response.data.project;
      setProjects(data)
 
    } catch (error) {
      console.error("Error fetching available users", error);
    }
  };

  useEffect(() => {
  
    fetchProjectsList();
  }, [token]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "district") {
      const selectedDistrict = districts.find(d => d._id === value);
      setDistrictId(value);
      setFormData((prev) => ({ ...prev, district: selectedDistrict ? selectedDistrict.name : "" }));
    } else if (name === "area") {
      const selectedArea = areas.find(a => a._id === value);
      setAreaId(value);
      setFormData((prev) => ({ ...prev, area: selectedArea ? selectedArea.name : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // if (!token) return toast.error("Session expired."), logout(), navigate("/");
    // const requiredFields = ["project", "date", "purpose", "start_location", "end_location", "mode", "area", "incharge"];
  // for (const field of requiredFields) {
  //   if (!formData[field].trim()) {
  //     toast.error(`Please fill out the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`);
  //     setLoading(false);
  //     return;
  //   }
  // }
    try {
      await axios.post(`${API_BASE_URL}/travel/`, formData, {
        headers: {
          Authorization: `Bearer ${token.access}`,
        },
      });
      toast.success("Data submitted successfully!");
      setTimeout(() => navigate("/table"), 2000);
      handleReset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ project: "", date: "", purpose: "", start_location: "", end_location: "", mode: ""});
    setDistrictId("");
    setAreaId("");
    setAreas([]);
    setLoading(false);
  };

  return (
    <>
    <Navbar />
    <div
    className="min-h-[100vh] px-4 flex items-center justify-center bg-cover bg-center bg-opacity-70 inset-0 bg-fuchsia-100 relative pt-20 "
    style={{ backgroundImage: `url(${img})` }}
  >
    {/* Floating SVGs */}
    {/* <div className="absolute -top-10 -right-10 opacity-20 animate-bounce">
      <svg className="h-32 w-32 text-fuchsia-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2zm-1 14.93V11H9v6h2zm2 0V11h-2v6h2zm2 0V11h-2v6h2z"/>
      </svg>
    </div>
    <div className="absolute -bottom-8 -left-8 opacity-10 animate-pulse">
      <svg className="h-40 w-40 text-fuchsia-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 1-10 10A10 10 0 0 1 12 2zm-1 14.93V11H9v6h2zm2 0V11h-2v6h2zm2 0V11h-2v6h2z"/>
      </svg>
    </div> */}

    <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 max-w-4xl w-full bg-fuchsia-50">
      <h2 className="text-3xl font-bold text-fuchsia-800 mb-6 text-center">Travel</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        
        <div className="flex flex-col">
          <label className="font-medium text-fuchsia-800">Project</label>
          <select name="project" className="border-2 border-fuchsia-300 p-3 rounded-xl shadow-sm focus:outline-none focus:border-fuchsia-500 transition-colors" value={formData.project} onChange={handleChange}>
  <option value="">Select Project</option>
  {projects.map(project => (
    <option key={project.id} value={project.id}>{project.name}</option>
  ))}
</select>
        </div>

      
        <div className="flex flex-col">
          <label className="font-medium text-fuchsia-800">Date</label>
          <input type="date" name="date" className="border-2 border-fuchsia-300 p-3 rounded-xl shadow-sm focus:outline-none focus:border-fuchsia-500 transition-colors" value={formData.date} onChange={handleChange} />
        </div>

        
        {["purpose", "start_location", "end_location"].map((field, idx) => (
          <div className="flex flex-col" key={idx}>
            <label className="font-medium text-fuchsia-800">
              {field === "purpose" ? "Purpose of Travel" : field === "start_location" ? "Start Location" : "End Location"}
            </label>
            <input 
              type="text" 
              name={field} 
              className="border-2 border-fuchsia-300 p-3 rounded-xl shadow-sm focus:outline-none focus:border-fuchsia-500 transition-colors" 
              placeholder={`Enter ${field}`} 
              value={formData[field]} 
              onChange={handleChange} 
              min="0" 
            />
          </div>
        ))}

       
        <div className="flex flex-col">
          <label className="font-medium text-fuchsia-800">Travel Mode</label>
          <select name="mode" className="border-2 border-fuchsia-300 p-3 rounded-xl shadow-sm focus:outline-none focus:border-fuchsia-500 transition-colors" value={formData.mode} onChange={handleChange}>
            <option value="">Select Mode</option>
            {modes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </div>

        

       
        <div className="flex gap-4 mt-6 md:col-span-2">
          <button type="submit" className="bg-fuchsia-800 hover:bg-fuchsia-700 text-white py-3 px-6 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105 w-full md:w-auto" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button type="button" onClick={handleReset} className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105 w-full md:w-auto">
            Clear All
          </button>
        </div>
      </form>
    </div>

    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
  </div>
  </>
);
};
export default FormPage; 