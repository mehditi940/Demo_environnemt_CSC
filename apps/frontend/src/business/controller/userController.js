import dummyAPI from "../../service/apiHandler";

export async function handleNewPassword(data){
    try{

      const response = await dummyAPI.auth.change_password_by_email(data.email, data.password);

      return response
    }
    catch (error){
      console.error(error.message)
      throw error;
    }
  }
  

  
export async function handleGetUsers() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Geen token gevonden");

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/auth/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      console.error("API Error:", response.status, errorData);
      throw new Error(`Ophalen van gebruikers mislukt: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    console.log("API Response:", responseData);

    // The API returns users directly as an array, not wrapped in a data property
    const users = Array.isArray(responseData) ? responseData : [];

    // Filter admin and system users out (keep only surgeon and user roles)
    // Note: Since we use hard delete, deleted users won't be in the database
    const filteredUsers = users.filter((user) => 
      user.role !== "admin" && user.role !== "system"
    );

    console.log("Filtered users:", filteredUsers);

    return { success: true, data: filteredUsers };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


    export async function handleDeleteUser(id) {
  try {
    const token = localStorage.getItem('authToken');
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

const response = await fetch(`${apiUrl}/auth/account/${id}`, {
  method: "DELETE",
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});

const responseData = await response.json().catch(() => null);

if (!response.ok) {
  const message = responseData?.message || `Foutcode ${response.status}`;
  throw new Error(message);
}

return { success: true, data: responseData };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: error.message || "Onbekende fout" };
  }
}

export async function handleUpdateUser(id, data) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Geen token gevonden");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

const response = await fetch(`${apiUrl}/auth/account/${id}`, {
  method: "PUT",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
});

const responseData = await response.json().catch(() => null);

if (!response.ok) {
  const message = responseData?.message || `Foutcode ${response.status}`;
  throw new Error(message);
}

return { success: true, data: responseData };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: error.message || "Onbekende fout" };
  }
}