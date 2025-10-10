import dummyAPI from "../service/apiHandler";
import { handleGetUsers } from "./controller/userController";

// Login gebruiker
export async function handleLogin(email, password) {
  try {
    const data = await dummyAPI.auth.login(email, password);
    localStorage.setItem("authToken", data);
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Maak een nieuwe patiënt aan
export async function handleNewPatient(data) {
  try {
    const response = await dummyAPI.patient.create_patient(data);

    if (!response || response.error) {
      throw new Error(response?.message || 'Er is iets misgegaan bij het aanmaken van de patiënt.');
    }

    return { success: true, data: response };
  } catch (error) {
    console.error("Fout bij handleNewPatient:", error.message);
    return { success: false, message: error.message };
  }
}

// Haal de huidige gebruiker op
export async function getUser() {
  try {
    const response = await dummyAPI.auth.me();

    if (!response) {
      throw new Error("Ophalen gebruiker mislukt");
    }

    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Log de gebruiker uit
export function logoutUser() {
  localStorage.removeItem("authToken");
  window.location.href = "/login";
}

// Check if user is authenticated with a valid token
export function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    return false;
  }

  try {
    // Decode the JWT token to check if it's expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      // Token is expired, remove it
      localStorage.removeItem("authToken");
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid token format, remove it
    console.error("Invalid token format:", error);
    localStorage.removeItem("authToken");
    return false;
  }
}

// Get stored token
export function getStoredToken() {
  return localStorage.getItem("authToken");
}

// Validate and clean up token if needed
export function validateAndCleanToken() {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    return null;
  }

  try {
    // Decode the JWT token to check if it's expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      // Token is expired, remove it
      localStorage.removeItem("authToken");
      return null;
    }
    
    return token;
  } catch (error) {
    // Invalid token format, remove it
    console.error("Invalid token format:", error);
    localStorage.removeItem("authToken");
    return null;
  }
}

// Registreer een nieuwe gebruiker
export async function handleUserRegistration(formValues) {
  try {
    // 1. Voeg logging toe om de input te zien
    console.log("Attempting registration with:", formValues);
    
    // 2. Roep de register functie aan
    const response = await dummyAPI.auth.register(
      formValues.email,
      formValues.firstName,
      formValues.lastName,
      formValues.password,
      formValues.role || 'admin' // default role
    );
    
    // 3. Log de response voor debugging
    console.log("Registration response:", response);
    
    // 4. Controleer of de registratie succesvol was
    if (!response || response.error) {
      throw new Error(response?.message || "Registratie mislukt");
    }
    
    return response;
    
  } catch (error) {
    console.error("Registratiefout:", {
      error: error.message,
      stack: error.stack, // Voeg stack trace toe voor debugging
      formValues
    });
    throw error; // Behoud de originele error
  }
}

// Haal alle gebruikers op
export async function getAllUsers() {
  try {
    const response = await handleGetUsers();
    return response;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Haal alle patiënten op
export async function getAllPatients() {
  try {
    const response = await dummyAPI.patient.get_patients();

    if (!response) {
      throw new Error("Ophalen patiënten mislukt");
    }

    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Haal gebruiker op via ID
export async function getUserById(id) {
  try {
    const response = await handleGetUsers();

    if (response.success) {
      const user = response.data.find(u => u.id === id);
      return user || null;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Fout bij ophalen gebruiker op ID:", error);
    return null;
  }
}
