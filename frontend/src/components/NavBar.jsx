import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 

const Navbar = () => {
  const navigate = useNavigate();
  const { logout ,token} = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-fuchsia-800 text-white p-4 fixed top-0 left-0 w-full shadow-md z-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold cursor-pointer" onClick={() => navigate("/table")}>Travel Management</h1>
        <ul className="flex space-x-4">
          <li>
            <button onClick={() => navigate("/table")} className="hover:text-fuchsia-300">Home</button>
          </li>
          {!token.is_staff&&
          <li>
            <button onClick={() => navigate("/form")} className="hover:text-fuchsia-300">Create</button>
          </li>
}
         {token.is_staff&&
         <>
          <li>
          <button onClick={() => navigate("/ProjectPage")} className="hover:text-fuchsia-300">Projects</button>
          </li>
          </>

         }
          <li>
            <button onClick={handleLogout} className="hover:text-fuchsia-300">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
