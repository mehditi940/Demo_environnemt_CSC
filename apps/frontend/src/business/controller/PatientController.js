import dummyAPI from "../../service/apiHandler";

export async function handleGetPatients() {
  try {

    const data = await dummyAPI.patient.get_patients();

    if (!data) {
      throw new Error("Aanmaken kamer mislukt");
    }

    return { success: true, data: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function handleDeletePatient(id) {
    try {
    const token = localStorage.getItem('authToken');

const response = await fetch(`${import.meta.env.VITE_API_URL}/patient/${id}`, {
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

export async function handleUpdatePatient(id, data) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Geen token gevonden");



    const response = await fetch(`${import.meta.env.VITE_API_URL}/patient/${id}`, {
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