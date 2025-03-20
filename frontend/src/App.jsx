import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import FormPage from "./pages/FormPage";
import AuthForm from "./components/AuthForm";
import Table from "./components/Table";
import ProjectPage from "./pages/ProjectPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route path="/table" element={<ProtectedRoute><Table /></ProtectedRoute>} />
          <Route path="/form" element={<ProtectedRoute><FormPage /></ProtectedRoute>} />
          <Route path="/ProjectPage" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

const AuthHandler = () => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <Navigate to="/table" /> : <AuthForm />;
};


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
