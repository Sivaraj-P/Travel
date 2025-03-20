import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/api";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import home from "../assets/home.png";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";


const AuthForm = () => {
  const [authData, setAuthData] = useState({ username: "", email_id:"",password: "" });
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [ showPassword, setShowPassword] = useState(false);
  const  [ passwordStrength, setPasswordStrength] = useState("")
 
  const [ passwordErrors,setPasswordErrors] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuthData({ ...authData, [name]: value });
  
    if (name === "password") {
      const errors = [];
  
      if (value.trim() === "") {
        errors.push("Password cannot be empty.");
        setPasswordErrors([]);
        setPasswordStrength("");
        return;
      }
  
      
      if (value.length < 8) errors.push("Must be at least 8 characters long.");
      if (!/[A-Z]/.test(value)) errors.push("Must contain at least one uppercase letter.");
      if (!/[0-9]/.test(value)) errors.push("Must contain at least one number.");
      if (!/[!@#$%^&*()_+.]/.test(value)) errors.push("Must contain at least one special character.");
  
      setPasswordErrors(errors);
  
      
      if (errors.length === 0) {
        setPasswordStrength("Strong");
      } else if (errors.length <= 2) {
        setPasswordStrength("Moderate");
      } else {
        setPasswordStrength("Weak");
      }
    }
  };
  
  
  
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!authData.username || !authData.password) {
      toast.error("Username and password are required!");
      setPasswordErrors(["Password cannot be empty."]);
      setPasswordStrength("");
      return;
    }
  
    if (isRegister) {
      if (authData.password !== authData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      if (passwordStrength !== "Strong") {
        toast.error("Password is not strong enough! It must be at least 6 characters long and contain at least one special character.");
        return;
      }
    }
  
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await registerUser(authData);
        if (res.status === 201 || res.data?.message === "User registered successfully") {
          toast.success("Registration successful! Please log in.");
          setIsRegister(!isRegister);
          setAuthData({ username: "", password: "",email_id:"", confirmPassword: "" });
          setPasswordErrors([]);
          setPasswordStrength("");
        } else {
          throw new Error(res.data?.message || "Registration failed.");
        }
      } else {
        res = await loginUser(authData);
        toast.success("Login successful!");
        login(res.data);
        navigate("/table");
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        const errorMessage = error.response.data?.detail || "Invalid username or password";
        toast.error(errorMessage);
      } else {
        toast.error("Network error");
        console.log(error);
      }
    }
    setLoading(false);
  };
  
  

  return (
    <div className="flex items-center justify-center min-h-[100vh] px-4 relative bg-fuchsia-50 ">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex flex-wrap md:flex-nowrap bg-white shadow-2xl rounded-2xl overflow-hidden relative min-h-[520px] lg:min-h-[550px]"
      >
        <div className="relative w-full md:w-1/2 min-h-[400px]">
          <motion.div
            initial={{ x: 0, y: 0 }}
            animate={{
              x: isRegister ? (isMobile ? "0%" : "100%") : "0%",
              y: isRegister ? (isMobile ? "100%" : "0%") : "0%",
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute w-full p-6 sm:p-8 flex flex-col justify-center bg-white"
          >
            <h2 className="text-3xl font-bold text-gray-700 text-center">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <form className="mt-12 space-y-8" onSubmit={handleAuth}>
  <input
    type="text"
    name="username"
    placeholder="Username"
    className={`border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-sm
      ${authData.username.length > 0 && authData.username.length < 3 ? 'border-red-500' : 'border-gray-300'}`}
    value={authData.username}
    onChange={handleChange}
    required
  />
  {authData.username.length > 0 && authData.username.length < 3 && (
    <p className="text-red-500 text-sm">Username must be at least 3 characters long.</p>
  )}

{isRegister && (
    <div className="relative">
      <input
        type="email"
        name="email_id"
        placeholder="Email ID"
        className="border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-sm border-gray-300"
        value={authData.email_id}
        onChange={handleChange}
        required
      />
    </div>
  )}

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Password"
      className={`border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-sm
        ${passwordErrors.length > 0 ? 'border-red-500' : 'border-gray-300'}`}
      value={authData.password}
      onChange={handleChange}
      required
    />
    <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  {isRegister && (
    <ul className="text-red-500 text-sm ">
      {passwordErrors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  )}

  {isRegister && (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        placeholder="Confirm Password"
        className="border p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-sm border-gray-300"
        value={authData.confirmPassword}
        onChange={handleChange}
        required
      />
    </div>
  )}

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    type="submit"
    className="w-full py-4  p-6 rounded-lg text-white font-semibold transition-all duration-300 bg-fuchsia-800 hover:bg-purple-700 disabled:opacity-50"
    disabled={loading}
  >
    {loading ? (isRegister ? "Registering..." : "Logging in...") : isRegister ? "REGISTER" : "LOGIN"}
  </motion.button>
</form>

          </motion.div>
        </div>

        <motion.div
          initial={{ x: 0, y: 0 }}
          animate={{
            x: isRegister ? (isMobile ? "0%" : "-100%") : "0%",
            y: isRegister ? (isMobile ? "-100%" : "0%") : "0%",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 text-white rounded-2xl bg-cover bg-center relative bg-overlay"
          style={{ backgroundImage: `url(${home})` }}
        >
          <h2 className="text-3xl font-bold">Join Us</h2>
          <p className="mt-3 text-center">Discover a whole new world of possibilities.</p>
          <button
            onClick={() => {setIsRegister(!isRegister);
              setAuthData({ username: "", password: "" });
            }}
            className="mt-6 px-8 py-3 border border-white rounded-lg bg-transparent hover:bg-white hover:text-purple-600 transition-all duration-300"
          >
            {isRegister ? "SIGN IN" : "SIGN UP"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
