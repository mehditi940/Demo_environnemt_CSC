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
            <label className="uf-label">Modelbestanden</label>
            {models.map((model, index) => (
                <div key={model.id} className="uf-file-row">
                    <input
                        id={`model-file-${model.id}`}
                        type="file"
                        onChange={(e) => handleModelFileChange(index, e)}
                        accept=".stl,.obj,.zip,.png,.jpeg,.3mf"
                        style={{ display: "none" }}
                        // required={index === 0}
                    />
                    <label htmlFor={`model-file-${model.id}`} className="uf-button" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',height:'40px',padding:'0 14px'}}>
                        Kies bestand
                    </label>
                    <span className="uf-file-name">{model.file ? model.file.name : "Geen bestand gekozen"}</span>
                    {models.length > 1 && (
                        <button type="button" onClick={() => handleRemoveModel(model.id)} className="uf-button" style={{marginLeft: 'auto',height:'40px',padding:'0 12px'}}>
                            Verwijder
                        </button>
                    )}
                </div>
            ))}
            <span
                className="uf-text-link"
                onClick={handleAddModel}
                style={{ margin: "10px 0 0 0", alignSelf: 'flex-start' }}
            >
                + Voeg extra model toe
            </span>
        </div>
    );
};

export default ModelUpload;
