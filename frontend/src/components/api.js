import axios from "axios";

export default axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : ''),
});
