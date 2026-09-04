import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { FivePixels } from "@fivepixels-js/react";

import { AppRouter } from "./app/router";
import { useDemoFeedbackSeed } from "./features/edgecase/hooks/useDemoFeedbackSeed";
import { createFivepixelsAdapter } from "./fivepixels/adapter";

const PROJECT_ID = "fivepixels-basic-example";

function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    useDemoFeedbackSeed();

    return (
        <>
            {location.pathname !== "/demo-showcase" ? (
                <FivePixels
                    project={{
                        id: PROJECT_ID,
                        env: "STAGED",
                        version: "1.0.0",
                    }}
                    sync="local"
                    // sync="api"
                    require={{
                        authLogin: false,
                        reviewerKey: true,
                    }}
                    team={{
                        reviewers: [
                        // {
                        //     id: "8ed4c9fe-c42d-4aec-80d8-977b6c548b1c",
                        //     name: "John Smith",
                        //     publicKey:
                        //         "stpub1.eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6InVkb21jcXAzei1jT1BabC1PV1BKQkUxV0JIU2RFaU04S3NpemhBVHRwLUUiLCJ5IjoiTkNhZ19xdmJEMlVxZk5vYnZ2OVExTTZRdEZ1NW1UOVE5eU1GbndhM1k3YyIsImNydiI6IlAtMjU2In0",
                        // },
                        // {
                        //     id: "461c2590-eb9b-44f6-a423-6730d0ab63a9",
                        //     name: "김상준",
                        //     publicKey:
                        //         "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiYUZ5NTNjZnJKQWhEUlVremdqRXVLbFV3RWl0MFQ0ZkdvOUxfXzNpUmU1NCIsInkiOiJweFA4aGN4LU5VQW5oM05FY1E1eFNCZWRkaVRyUzdzY3FDUzFPelg4RTJNIn0",
                        // },
                        {
                            id: "900b0c2d-4244-4cf5-be90-6b690b9d3df2",
                            name: "김상준",
                            publicKey:
                                "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiUUhKTkdFeHplMUpLNkVDODZFdFRTYnFDSENQUF9jVjlxSXVLY1BLQ2RmNCIsInkiOiJBR0ZiYkxPOVJsT0U0NWlCeGRPVHNCbXlvSk5zSVBPanFTMHJUWEgwMGJzIn0",
                        },
                        ],
                    }}

                    // adapter={createFivepixelsAdapter({
                    //     baseUrl: "/api/v1/fivepixels",
                    //     projectId: PROJECT_ID,
                    // })}
                    // onNavigate={(pathname) => {
                    //     navigate(pathname);
                    // }}
                />
            ) : null}
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
