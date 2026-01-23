const BASE_URL = "http://192.168.4.69:8001/api";
const BASE_AUTH_URL = "http://192.168.4.69:8001/api/usuarios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function fetchJson(url, options = {}) {
  const headers = { ...getAuthHeaders(), ...options.headers };

  console.log(`[API Request] ${options.method || "GET"} ${url}`, options.body ? JSON.parse(options.body) : "");
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Error ${response.status}: ${errorData.message || response.statusText}`,
    );
  }

  if (
    response.status === 204 ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    return null;
  }
  return response.json();
}

export const apiService = {
  // --- AUTENTICACIÓN ---
  login: async (credentials) => {
    const response = await fetch(`${BASE_AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok || data.message !== "Login exitoso") {
      throw new Error(data.message || "Credenciales incorrectas");
    }
    return data;
  },

  // --- USUARIOS ---

  registerUser: (userData) => {
    console.log("[registerUser] Sending data to backend:", userData);
    return fetchJson(`${BASE_URL}/usuarios/crear`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getUsers: () => {
    return fetchJson(`${BASE_URL}/usuarios`, {
      method: "GET",
    });
  },

  updateUser: (id, userData) => {
    return fetchJson(`${BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: (id) => {
    return fetchJson(`${BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
    });
  },

  getSegmentos: () => {
    return fetchJson(`${BASE_URL}/usuarios/segmentos`);
  },

  // --- BITRIX & CLIENTES ---

  getBitrixCompanies: (start = 0, segmentos = []) => {
    return fetchJson(`${BASE_URL}/clientes/companies`, {
      method: "POST",
      body: JSON.stringify({ start, segmentos }),
    });
  },

  getAllCompanies: (segmentos = []) => {
    return fetchJson(`${BASE_URL}/clientes/companies`, {
      method: "POST",
      body: JSON.stringify({ start: 0, segmentos }),
    });
  },

  // --- MATRIZ Y AUDITORÍA ---

  saveMatrix: (payload) => {
    return fetchJson(`${BASE_URL}/matrix`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  saveConfig: (payload) => {
    return fetchJson(`${BASE_URL}/auditoria`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getGeoAudit: (offset = 0) => {
    return fetchJson(`${BASE_URL}/profit-bitrix?start=${offset}`);
  },

  getMatrix: () => {
    return fetchJson(`${BASE_URL}/matrix`, {
      method: "GET",
    });
  },
};
