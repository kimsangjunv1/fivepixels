import { BrowserRouter, useNavigate } from "react-router-dom";
import { FivePixels } from "@fivepixels-js/react";

import { AppRouter } from "./app/router";
import { useDemoFeedbackSeed } from "./features/edgecase/hooks/useDemoFeedbackSeed";
import { createFivepixelsAdapter } from "./fivepixels/adapter";

const PROJECT_ID = "fivepixels-basic-example";

function AppContent() {
    const navigate = useNavigate();
    useDemoFeedbackSeed();

    return (
        <>
            <FivePixels
                project={{
                    id: PROJECT_ID,
                    env: "STAGED",
                    version: "1.0.0",
                }}
                sync="api"
                adapter={createFivepixelsAdapter({
                    baseUrl: "/api/v1/fivepixels",
                    projectId: PROJECT_ID,
                })}
                onNavigate={(pathname) => {
                    navigate(pathname);
                }}
            />
            <AppRouter />
        </>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
