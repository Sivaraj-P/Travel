import { createContext, useState } from "react";
import Proptypes from 'prop-types'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
AuthProvider.propTypes = {
  children: Proptypes.node.isRequired,
};

const storedToken = localStorage.getItem("token");
  const initialToken = storedToken ? JSON.parse(storedToken) : null;
  const [token, setToken] = useState(initialToken);
  const isLoggedIn = !!token;

  const login = (value) => {
    const tokenString = JSON.stringify(value); 
    localStorage.setItem("token", tokenString); 
    setToken(value); 
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
