import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { useApi } from "../services/api";
import { IoPersonCircleSharp } from "react-icons/io5";


const Navbar = () => {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);
  const { userGET } = useApi();
  const [user, setUser] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchData = async () => {
    try {
      const { data } = await userGET(token.id);
      setUser(data);
    } catch ({ response, message }) {
      console.error("Error fetching data:", response?.data || message);
      if (response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <nav className="bg-fuchsia-800 text-white p-4 fixed top-0 left-0 w-full shadow-md z-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold cursor-pointer" onClick={() => navigate("/table")}>
          Travel Management
        </h1>
        <ul className="flex space-x-6 items-center">
          <li>
            <button onClick={() => navigate("/table")} className="hover:text-fuchsia-300">
              Home
            </button>
          </li>
          {!token.is_staff && (
            <li>
              <button onClick={() => navigate("/form")} className="hover:text-fuchsia-300">
                Create
              </button>
            </li>
          )}
          {token.is_staff && (
            <li>
              <button onClick={() => navigate("/ProjectPage")} className="hover:text-fuchsia-300">
                Projects
              </button>
            </li>
          )}
      
          {/* Profile Dropdown */}
          <li
            className="relative grid "
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="hover:text-fuchsia-300 text-lg"><IoPersonCircleSharp />            </button>

            {/* Dropdown Box */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-lg shadow-lg p-4">
                <p className="font-bold text-center mb-2">Profile</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>First Name:</strong> {user.first_name || "N/A"}</p>
                <p><strong>Last Name:</strong> {user.last_name || "N/A"}</p>
                <div className="flex justify-center mt-4">
      <button
        onClick={handleLogout}
        className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg hover:bg-fuchsia-700 transition duration-200"
      >
        Logout
      </button>
    </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
