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

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Error ${response.status}: ${errorData.message || response.statusText}`
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

  // 1. Crear Usuario (POST)
  registerUser: (userData) => {
    return fetchJson(`${BASE_URL}/usuarios/crear`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // 2. Obtener Todos los Usuarios (GET)
  getUsers: () => {
    return fetchJson(`${BASE_URL}/usuarios`, {
      method: "GET",
    });
  },

  // 3. Actualizar Usuario (PUT)
  updateUser: (id, userData) => {
    return fetchJson(`${BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // 4. Eliminar Usuario (DELETE)
  deleteUser: (id) => {
    return fetchJson(`${BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
    });
  },

  // 5. Obtener Segmentos (GET)
  getSegmentos: () => {
    return fetchJson(`${BASE_URL}/usuarios/segmentos`);
  },

  // --- BITRIX & CLIENTES ---

  getBitrixCompanies: (start = 0) => {
    return fetchJson(`${BASE_URL}/clientes/companies?start=${start}`, {
      method: "GET",
    });
  },

  // --- AUDITORÍA ---

  saveConfig: (payload) => {
    return fetchJson(`${BASE_URL}/auditoria`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getGeoAudit: (offset = 0) => {
    return fetchJson(`${BASE_URL}/profit-bitrix?start=${offset}`);
  },

  getAllCompanies: () => {
    return fetchJson(`${BASE_URL}/clientes/companies`);
  },
  saveAuditoria: (payload) => {
    console.log("Guardando auditoría:", payload);
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1000)
    );
  },
};
