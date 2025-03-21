import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const API_BASE_URL = "http://localhost:8001/api";

export const useApi = () => {
  const { token } = useContext(AuthContext);


   const loginUser = async (credentials) => {
    return axios.post(`${API_BASE_URL}/token`, credentials );
  };
  
   const registerUser = async (credentials) => {
    return axios.post(`${API_BASE_URL}/users/`, credentials);
  };
  
  const projectPOST = async (body) => {
    return axios.post(`${API_BASE_URL}/projects/`, body, {
      headers: { Authorization: `Bearer ${token?.access}` },
    });
  };

  const projectGET = async () => {
    return axios.get(`${API_BASE_URL}/projects/`, {
      headers: { Authorization: `Bearer ${token?.access}` },
    });
  };

  const travelPost = async (body) => {
    return axios.post(`${API_BASE_URL}/travel/`, body, {
      headers: { Authorization: `Bearer ${token?.access}` },
    });
  };

  const travelGET = async () => {
    return axios.get(`${API_BASE_URL}/travel/`, {
      headers: { Authorization: `Bearer ${token?.access}` },
    });
  };


  const travelPATCH = async (id,body) => {
    return axios.patch(`${API_BASE_URL}/travel/${id}/`,body, {
      headers: {
        Authorization: `Bearer ${token.access}`,
      },
    });
  };

  const userGET = async (id) => {
    return axios.get(`${API_BASE_URL}/users/${id}/`, {
      headers: { Authorization: `Bearer ${token?.access}` },
    });
  };

  return {loginUser,registerUser, projectPOST, projectGET, travelPost, travelGET,travelPATCH ,userGET};
};

// Usage inside a component
// const { projectPOST, projectGET } = useApi();
