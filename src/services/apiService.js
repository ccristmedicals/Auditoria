const BASE_URL = "http://192.168.4.69:8001/api";
const BASE_AUTH_URL = "http://192.168.4.69:8001/api/usuarios";

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `Error ${response.status}: ${errorData.message || response.statusText}`
        );
    }

    // Si no hay contenido (ej. en un POST exitoso sin respuesta), no intentes parsear JSON
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
            headers: {
                "Content-Type": "application/json",
            },
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
    registerUser: async (userData) => {
        try {
            const response = await fetch(`${BASE_URL}/usuarios/crear`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Error al registrar usuario");
            }
            return await response.json();
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    },

    // 2. Obtener Todos los Usuarios (GET)
    getUsers: async () => {
        try {
            // Asumiendo ruta /usuarios para obtener la lista
            const response = await fetch(`${BASE_URL}/usuarios`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            if (!response.ok) throw new Error("Error al obtener usuarios");
            return await response.json();
        } catch (error) {
            console.error("Get users error:", error);
            throw error;
        }
    },

    // 3. Actualizar Usuario (PUT)
    updateUser: async (id, userData) => {
        try {
            const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error("Error al actualizar usuario");
            return await response.json();
        } catch (error) {
            console.error("Update error:", error);
            throw error;
        }
    },

    // 4. Eliminar Usuario (DELETE)
    deleteUser: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            if (!response.ok) throw new Error("Error al eliminar usuario");
            return true;
        } catch (error) {
            console.error("Delete error:", error);
            throw error;
        }
    },

    // 5. Obtener Segmentos (GET)
    getSegmentos: async () => {
        try {
            const response = await fetch(`${BASE_URL}/usuarios/segmentos`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
            });
            if (!response.ok) throw new Error("Error al obtener segmentos");
            return await response.json();
        } catch (error) {
            console.error("Get segmentos error:", error);
            throw error;
        }
    },

    getBitrixCompanies: async (start = 0) => {
        try {
            // Usamos el endpoint que me diste
            const response = await fetch(`${BASE_URL}/clientes/companies?start=${start}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener datos de Bitrix");
            return await response.json();
        } catch (error) {
            console.error("Get companies error:", error);
            throw error;
        }
    },

    // Guardar configuración
    saveConfig: (payload) => {
        const url = `${BASE_URL}/auditoria`;
        return fetchJson(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then((data) => {
            return data;
        });
    },

    // NUEVO MÉTODO PARA AUDITORÍA GEO
    getGeoAudit: async (offset = 0) => {
        try {
            // Usamos la IP que me diste
            const response = await fetch(`http://192.168.4.69:8001/api/profit-bitrix?start=${offset}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error en getGeoAudit:", error);
            throw error;
        }
    },
};