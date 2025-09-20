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

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error("Ophalen van gebruikers mislukt");
    }

    const responseData = await response.json();
      console.log(responseData)

    // Filter super-admin eruit
  const filteredUsers = responseData.filter((user) => 
      user.role !== "super-admin" && user.deleted === "false"
    );

    console.log(filteredUsers);

    return { success: true, data: filteredUsers };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


    export async function handleDeleteUser(id) {
  try {
    const token = localStorage.getItem('authToken');

const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/account/${id}`, {
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

  

const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/account/${id}`, {
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