import React from "react";

const ModelUpload = ({ models, setModels }) => {
    const handleAddModel = () => {
        setModels([...models, { id: Date.now(), file: null }]);
    };

    const handleModelFileChange = (index, event) => {
        const updatedModels = [...models];
        updatedModels[index].file = event.target.files[0];
        setModels(updatedModels);
    };

    const handleRemoveModel = (id) => {
        setModels(models.filter((model) => model.id !== id));
    };

    return (
        <div className="model-upload-group">
            <label>Modelbestanden</label>
            {models.map((model, index) => (
                <div key={model.id} className="file-item">
                    <input
                        type="file"
                        onChange={(e) => handleModelFileChange(index, e)}
                        accept=".stl,.obj,.zip, .png, .jpeg, .3mf"
                        // required={index === 0}
                    />
                    {model.file && <span>{model.file.name}</span>}
                    {models.length > 1 && (
                        <i onClick={() => handleRemoveModel(model.id)} className="bi bi-x-circle-fill"></i>
                    )}
                </div>
            ))}
            <button type="button" className="add-btn" onClick={handleAddModel} style={{ margin: "10px" }}>
                + Voeg extra model toe
            </button>
        </div>
    );
};

export default ModelUpload;
