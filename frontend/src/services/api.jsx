import axios from "axios";



export const API_BASE_URL = "http://localhost:8001/api";

export const loginUser = async (credentials) => {
  return axios.post(`${API_BASE_URL}/token`, credentials );
};

export const registerUser = async (credentials) => {
  return axios.post(`${API_BASE_URL}/users/`, credentials);
};

export const fetchDistricts = async () => {
  return axios.get(`${API_BASE_URL}/districts`);
};

export const fetchAreas = async (district) => {
  return axios.get(`${API_BASE_URL}/areas/${district}`, {
    withCredentials: true,
  });
};

export const submitForm = async (formData) => {
  return axios.post(`${API_BASE_URL}/form/submit`, formData, {
    withCredentials: true,
  });
};
