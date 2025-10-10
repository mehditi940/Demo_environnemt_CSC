import { createContext, useState } from "react";

export const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
    const [models, setModels] = useState([]);

    return (
        <ModelContext.Provider value={{ models, setModels }}>
            {children}
        </ModelContext.Provider>
    );
};
