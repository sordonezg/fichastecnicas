import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const getVenues = async () => {
    const response = await axios.get(`${API_URL}/venues`, getAuthHeaders());
    return response.data;
};

export const createVenue = async (venueData) => {
    const response = await axios.post(`${API_URL}/venues`, venueData, getAuthHeaders());
    return response.data;
};

export const updateVenue = async (id, venueData) => {
    const response = await axios.put(`${API_URL}/venues/${id}`, venueData, getAuthHeaders());
    return response.data;
};

export const deleteVenue = async (id) => {
    const response = await axios.delete(`${API_URL}/venues/${id}`, getAuthHeaders());
    return response.data;
};
