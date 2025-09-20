import uploadModel from "../../service/ModelService";

const uploadController = {
    async uploadFiles(files, setUploadStatus) {
        if (files.length === 0) {
            setUploadStatus({ type: "error", message: "Geen bestanden geselecteerd." });
            return;
        }

        setUploadStatus({ type: "loading", message: "Uploaden..." });

        let allSuccessful = true;
        for (let file of files) {
            const response = await uploadModel(file);
            if (!response.success) {
                allSuccessful = false;
                setUploadStatus({ type: "error", message: response.message });
                return;
            }
        }

        setUploadStatus({
            type: allSuccessful ? "success" : "error",
            message: allSuccessful ? "Alle bestanden succesvol geüpload!" : "Sommige uploads zijn mislukt.",
        });
    },
};

export default uploadController;
