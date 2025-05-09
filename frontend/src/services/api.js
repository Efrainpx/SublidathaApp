import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Request interceptor: adjunta el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: captura 401 (token expirado o inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // limpiar token y enviar al login
      localStorage.removeItem("token");
      // opcional: si guardas usuario en contexto, límpialo también
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
