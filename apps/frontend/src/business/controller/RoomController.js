// import dummyAPI from "../../service/apiHandler";

import dummyAPI from "../../service/apiHandler";

export async function handleCreateRoom(name, files, patient = null, users = []) {
  try {
    const response = await dummyAPI.room.create_room(name, files, patient, users);

    if (!response) {
      throw new Error("Aanmaken kamer mislukt");
    }

    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


export async function handleGetRooms() {
  try {
    const response = await dummyAPI.room.get_rooms();

    if (!response) {
      throw new Error("Aanmaken kamer mislukt");
    }

    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function handleUpdateRoom(id, data, files = []) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Geen token gevonden");

    const formData = new FormData();

    for (const key in data) {
      const value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
      formData.append(key, value);
    }

    files.forEach(file => {
      formData.append('files', file);
    });

const response = await fetch(`${import.meta.env.VITE_API_URL}/room/${id}`, {
  method: "PUT",
  headers: {
    "Authorization": `Bearer ${token}`,
  },
  body: formData
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


export async function handleDeleteRoom(roomId) {
  try {
    const token = localStorage.getItem('authToken');

const response = await fetch(`${import.meta.env.VITE_API_URL}/room/${roomId}`, {
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
