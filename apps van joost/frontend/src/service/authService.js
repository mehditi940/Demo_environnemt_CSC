const API_URL = `${import.meta.env.VITE_API_URL}/auth/login`;

export async function loginUser(credentials) {
  console.log(credentials);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

const REGISTER_URL = `${import.meta.env.VITE_API_URL}/auth/register`;

export async function registerUser(userData) {
  const payload = {
    ...userData,
    role: "chirurg", // vaste rol voorlopig
  };

  try {
    const response = await fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Registratie mislukt");
    }

    return await response.json();
  } catch (error) {
    console.error("Error bij registreren:", error);
    throw error;
  }
}
