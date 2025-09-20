/**
 * Debug logger for API requests
 * @param {String} method method of the request (get, post, put, delete)
 * @param {String} endpoint endpoint of the request
 * @param {boolean} auth if the request is authenticated or not
 * @description This function logs the API request to the console in development mode.
 */
const debugLogger = (method, endpoint, auth) => {
  if (
    import.meta.env.MODE === "development" ||
    import.meta.env.VITE_DEBUG === "true"
  ) {
    const date = new Date();
    console.log(
      `[${date.toISOString()}](${method}) API Request to ${import.meta.env.VITE_API_URL + endpoint} with auth: ${auth}`
    );
  }
};

/**
 * APIHandler class
 * Handles API requests and authentication for the application.
 * Implements the Singleton pattern to ensure only one instance of the APIHandler exists.
 */
class APIHandler {
  #token;
  #baseURL;

  constructor(baseURL) {
    if (APIHandler.instance) {
      return APIHandler.instance;
    }

    this.#baseURL = baseURL;
    this.#token = null;
    APIHandler.instance = this;
  }

  async #get(endpoint, auth = false) {
    if (auth && !this.#token) {
      console.error("No token provided please login");
      return null;
    }

    try {
      debugLogger("get", endpoint, auth);
      const response = await fetch(
        `${this.#baseURL}${endpoint}`,
        auth
          ? {
              headers: {
                Authorization: `Bearer ${this.#token}`,
              },
            }
          : {}
      );
      return response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async #post(endpoint, auth = false, data = {}) {
    if (auth && !this.#token) {
      console.error("No token provided please login");
      return null;
    }

    try {
      debugLogger("post", endpoint, auth);
      const response = await fetch(`${this.#baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth && { Authorization: `Bearer ${this.#token}` }),
        },
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async #postFile(endpoint, auth = false, data = {}, files = []) {
    if (auth && !this.#token) {
      console.error("No token provided please login");
      return null;
    }

    try {
      debugLogger("postFile", endpoint, auth);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      if (data) {
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
      }

      const response = await fetch(`${this.#baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.#token}`,
        },
        body: formData,
      });
      return response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async #delete(endpoint, auth = false) {
    if (auth && !this.#token) {
      console.error("No token provided please login");
      return null;
    }

    try {
      debugLogger("delete", endpoint, auth);
      const response = await fetch(`${this.#baseURL}${endpoint}`, {
        method: "DELETE",
      });
      return response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async #update(endpoint, auth = false, data = {}, files = []) {
    if (auth && !this.#token) {
      console.error("No token provided please login");
      return null;
    }

    try {
      debugLogger("update", endpoint, auth);
      if (files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
        formData.append("file", JSON.stringify(data));

        const response = await fetch(`${this.#baseURL}${endpoint}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.#token}`,
          },
          body: formData,
        });
        return response.json();
      }

      const response = await fetch(`${this.#baseURL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(auth && { Authorization: `Bearer ${this.#token}` }),
        },
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  #setToken(token) {
    if (!token || typeof token !== "string") {
      console.error("Invalid token provided");
      throw new Error("Invalid token provided");
    }

    this.#token = token;
  }

  /**
   * Singleton instance
   * @returns {APIHandler}
   */
  static getInstance() {
    const apiInstance = APIHandler.instance;
    if (!apiInstance.#token) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in localStorage, please login");
      } else {
        apiInstance.#setToken(token);
      }
    }
    return apiInstance;
  }

  /**
   * Authentication methods
   * @description Methods for user authentication, including login, registration, and user management.
   */
  auth = {
    /**
     * Login a user
     * @param {string} email email of the user
     * @param {string} password password of the user
     */
    async login(email, password) {
      const apiInstance = APIHandler.getInstance();
      const result = await apiInstance.#post("/auth/login", false, {
        email,
        password,
      });
      console.log(result);
      apiInstance.#setToken(result.token);
      return result.token;
    },

    /**
     * Logout a user
     *
     * @param {String} email
     * @param {String} firstName
     * @param {String} lastName
     * @param {String} role
     * @param {String} password
     */
  async register(email, firstName, lastName, password, role) {
  const apiInstance = APIHandler.getInstance();
  try {
    const response = await apiInstance.#post("/auth/register", true, {
      firstName,
      lastName,
      email,
      role,
      password,
    });
    
    // Controleer of response bestaat
    if (!response) {
      throw new Error("Geen response van server");
    }
    
    return response; // Zorg dat je de response retourneert
    
  } catch (error) {
    console.error("Register error:", error);
    throw error; // Gooi de error door naar de caller
  }
},
    /**
     * Get the current user
     * @returns {Promise<Object>}
     */
    async me() {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get("/auth/me", true);
    },

    /**
     * Change the password of a user only super admin can change the password of other users
     * @param {string} userId the id of the user having the password to be changed
     * @param {*} newPassword the new password to be set for the user
     * @returns {Promise<Object>} the response from the server
     */
    async change_password(userId, password) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#post(`/auth/change-password`, true, {
        password,
        userId,
      });
    },

    /**
     * Delete a user account only super admin can delete other users accounts
     * @param {string} id the id of the user to be deleted
     * @returns {Promise<Object>} the response from the server
     */
    async delete_account(id) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#delete(`/auth/account/${id}`, true);
    },

    /**
     * Get all users
     * @returns {Promise<Array<{
     *  id: string,
     *  firstName: string,
     * lastName: string,
     * email: string,
     * role: string,
     * createdAt: string,
     * updatedAt: string
     * }>>} - A promise resolving to an array of user objects.
     */
    async get_users() {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get("/auth/users", true);
    },

    /**
     * Change the password of a user by email
     * @param {string} email the email of the user having the password to be changed
     * @param {string} password the new password to be set for the user
     * @returns {Promise<Object>} the response from the server
     * */
    async change_password_by_email(email, password) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#post("/auth/change-password-by-email", true, {
        email,
        password,
      });
    },

    /**
     * Get a user by email
     * @param {string} email the email of the user to be retrieved
     * @returns {Promise<Object>} the response from the server
     * */
    async get_account_by_email(email) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get(`/auth/account/${email}`, true);
    },

    /**
     * Get a user by ID
     * @param {string} id the id of the user to be retrieved
     * @returns {Promise<Object>} the response from the server
     * */
    async get_user(id) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get(`/auth/account/${id}`, true);
    },
  };

  /**
   * Patient methods
   * @description Methods for managing patients, including creating, retrieving, and deleting patients.
   */
  patient = {
    /**
     * Create a new patient (Only Super Admin can create a new patient)
     *
     * @param {Object} data - The data to be sent to the server to create a new patient.
     * @param {string} data.nummer - The patient's unique number.
     * @param {string} data.firstName - The patient's first name.
     * @param {string} data.lastName - The patient's last name.
     * @returns {Promise<Object>} - The response from the server.
     *
     * @example
     * // Request Body:
     * {
     *   "nummer": "123456789",
     *   "firstName": "John",
     *   "lastName": "Doe"
     * }
     *
     * @example
     * // Successful Response:
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "message": "Patient created successfully"
     * }
     */
    async create_patient(data) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#post("/patient", true, data);
    },

    /**
     * Get all patients (Only Admin can get all patients)
     *
     * @param {number} limit - The maximum number of patients to return.
     * @returns {Promise<Array<{
     *   id: string,
     *   nummer: string,
     *   firstName: string,
     *   lastName: string,
     *   createdAt: string,
     *   updatedAt: string
     * }>>} - A promise resolving to an array of patient objects.
     *
     * @example
     * // Successful Response:
     * [
     *   {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "nummer": "123456789",
     *     "firstName": "John",
     *     "lastName": "Doe",
     *     "createdAt": "2024-03-17T12:00:00Z",
     *     "updatedAt": "2024-03-18T14:30:00Z"
     *   }
     * ]
     */
    async get_patients(limit = undefined) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get("/patient", true, { limit });
    },

    /**
     * Get a patient by ID (Only Admin can get a patient by ID)
     *
     * @param {string} id - The ID of the patient to retrieve.
     * @returns {Promise<{
     *   id: string,
     *   nummer: string,
     *   firstName: string,
     *   lastName: string,
     *   createdAt: string,
     *   updatedAt: string
     * }>} - A promise resolving to the patient object.
     *
     * @example
     * // Successful Response:
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "nummer": "123456789",
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "createdAt": "2024-03-17T12:00:00Z",
     *   "updatedAt": "2024-03-18T14:30:00Z"
     * }
     */
    async get_patient(id) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get(`/patient/${id}`, true);
    },

    /**
     * Delete a patient (Only Admin can delete a patient)
     *
     * @param {string} id - The ID of the patient to delete.
     * @returns {Promise<Object>} - The response from the server.
     */
    async delete_patient(id) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#delete(`/patient/${id}`, true);
    },
  };

  /**
   * Room methods
   * @description Methods for managing rooms, including creating, retrieving, and deleting rooms.
   */
  room = {
    /**
     * Create a new room (Only Super Admin can create a new room)
     *
     * @param {string} name - Name of the room.
     * @param {File[]} files - Models to be uploaded to the room.
     * @param {string} patient - Patient ID to be assigned to the room.
     * @param {string[]} users - Users to be assigned to the room that can access it.
     * @returns {Promise<{
     *   id: string,
     *   message: string
     * }>} - A promise resolving to an object containing the room ID and success message.
     *
     * @example
     * // Successful Response:
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "message": "Room created successfully"
     * }
     */
    create_room: async function (name, files, patient = null, users = []) {
      const apiInstance = APIHandler.getInstance();

      // Maak een object zonder users als lege array en zonder patient als null
      const bodyData = { name };
      if (patient) bodyData.patient = patient;
      if (users.length > 0) bodyData.users = users; // array, niet string!

      return await apiInstance.#postFile(
        "/room",
        true,
        bodyData,
        files
      );
    },

    /**
     * Get all rooms (Only Admin can get all rooms) Retrieves a list of all rooms with patients and models.
     *
     * @param {number} limit - The maximum number of rooms to return.
     * @returns {Promise<Array<{
     * id: string;
     * name: string;
     * patient: {
     *  id: string;
     *  firstName: string;
     *  lastName: string;
     *  nummer: string;
     * } | undefined;
     * models: Array<{
     *  id: string;
     *  name: string;
     *  path: string;
     * }>;
     * }>>} - A promise resolving to an array of room objects.
     *
     * @example
     * // Successful Response:
     * [
     *   {
     *     "id": "room123",
     *     "name": "ICU Room 1",
     *     "patient": {
     *       "id": "patient123",
     *       "name": "John Doe"
     *     },
     *     "models": [
     *       {
     *         "id": "model123",
     *         "name": "MRI Scan Model"
     *       }
     *     ]
     *   }
     * ]
     */
    async get_rooms(limit = undefined) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get("/room", true, { limit });
    },

    /**
     * Get a room by ID (Only Admin can get a room by ID).
     * Retrieves a specific room with its details.
     *
     * @param {string} id - The ID of the room to retrieve.
     * @returns {Promise<{
     *   id: string,
     *   name: string,
     *   patient?: {
     *     id: string,
     *     firstName: string,
     *     lastName: string,
     *     nummer: string
     *   },
     *   models: Array<{
     *     id: string,
     *     name: string,
     *     path: string
     *   }>
     * }>} - A promise resolving to the room object.
     *
     * @example
     * // Successful Response:
     * {
     *   "id": "room123",
     *   "name": "ICU Room 1",
     *   "patient": {
     *     "id": "patient123",
     *     "firstName": "John",
     *     "lastName": "Doe",
     *     "nummer": "123456789"
     *   },
     *   "models": [
     *     {
     *       "id": "model123",
     *       "name": "MRI Scan Model",
     *       "path": "/path/to/model"
     *     }
     *   ]
     * }
     */
    async get_room(id) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#get(`/room/${id}`, true);
    },

    /**
     * Delete a room (Only Admin can delete a room).
     *
     * @param {string} id - The ID of the room to delete.
     * @returns {Promise<{
     *  message: string
     * }>} - The response from the server.
     */
    async delete_room(id) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#delete(`/room/${id}`, true);
    },

    async update_room(id, data = {}, files = [], modelsToRemove = []) {
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#update(
        `/room/${id}`,
        true,
        {
          ...data,
          modelsToRemove: JSON.stringify(modelsToRemove), // Zorg voor correcte serialisatie
        },
        files
      );
    },

    /**
     * Get the token used for authentication.
     * @returns String - The token used for authentication.
     */
    get_token() {
      const apiInstance = APIHandler.getInstance();
      return apiInstance.#token;
    },
  };

  /**
   * Connection methods
   * @description Methods for managing connections, including creating and retrieving connections.
   */
  connection = {
    /**
     * Create a new connection for a room.
     * This method is used to create a connection for a specific room.
     * @param {string} roomId - The ID of the room for which the connection is being created.
     * @returns {Promise<{
     * roomId: string
     * socketUrl: string
     * pinCode: string
     * qrCodeString: string
     * }>} - A promise that resolves to the response from the server.
     */
    async create_connection(roomId) { 
      const apiInstance = APIHandler.getInstance();
      return await apiInstance.#post(`/connection`, true, {roomId});
    }
  }
}

const resolvedBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
if (!resolvedBaseUrl) {
  // Defensive: should never hit due to default
  throw new Error("VITE_API_URL is not configured and no default could be resolved");
}
const dummyAPI = new APIHandler(resolvedBaseUrl);
export default dummyAPI;
