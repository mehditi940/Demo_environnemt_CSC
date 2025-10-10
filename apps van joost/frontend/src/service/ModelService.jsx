// service/ModelService.js

const uploadModel = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/models/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Authorization header with the token
        },
        body: formData, // Send the file in form-data
      }
    );

    const result = await response.text();
    return { success: response.ok, message: result };
  } catch (error) {
    console.error("Fout bij uploaden van model:", error);
    return { success: false, message: "Netwerkfout bij uploaden" }; // Handle network errors
  }
};

// If you need to fetch models (like the latest or a specific one), you can add another service function for that
const fetchModel = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/models/latest`
    );
    const data = await response.json();
    return data.modelPath; // Return the path of the latest model
  } catch (error) {
    console.error("Fout bij ophalen van model:", error);
    return { success: false, message: "Fout bij ophalen van model" };
  }
};

export default { uploadModel, fetchModel };
