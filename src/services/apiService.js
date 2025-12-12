const BASE_URL = "http://192.168.4.69:8001/api";

export const apiService = {
    // --- AUTH ---
    login: async (credentials) => {
        // MOCK LOGIN (Mantener igual o descomentar el fetch real cuando el backend esté listo)
        console.log("Mock Login initiated with:", credentials);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (credentials.usuario && credentials.contraseña) {
            return {
                token: "mock-token-xyz-123",
                user: {
                    id: 1,
                    usuario: credentials.usuario,
                    nombre: "Usuario Prueba",
                    role: "administrador",
                    permisos: { ver_dashboard: true }
                }
            };
        } else {
            throw new Error("Credenciales requeridas");
        }
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
    }
};