import { BrowserRouter, useNavigate } from "react-router-dom";
import { FivePixels, type ReportFeedback } from "@fivepixels-js/react";

import { AppRouter } from "./app/router";
import { invokeModalRevealHandler } from "./features/modals/model/modalRevealRegistry";

async function createGitHubIssue(feedback: ReportFeedback) {
    const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            feedbackId: feedback.id,
            feedback,
        }),
    });

    if (!response.ok) {
        throw new Error("GitHub issue creation failed");
    }

    return response.json() as Promise<{
        issueNumber: number;
        issueUrl: string;
    }>;
}

function AppContent() {
    const navigate = useNavigate();

    return (
        <>
            <FivePixels
                project={{
                    id: "fivepixels-basic-example",
                    env: "STAGED",
                    version: "1.0.0",
                }}
                // mode="presentation"
                team={{
                    reviewers: [
                        {
                            id: "8ed4c9fe-c42d-4aec-80d8-977b6c548b1c",
                            name: "John Smith",
                            publicKey:
                                "stpub1.eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6InVkb21jcXAzei1jT1BabC1PV1BKQkUxV0JIU2RFaU04S3NpemhBVHRwLUUiLCJ5IjoiTkNhZ19xdmJEMlVxZk5vYnZ2OVExTTZRdEZ1NW1UOVE5eU1GbndhM1k3YyIsImNydiI6IlAtMjU2In0",
                            privateKey:
                                "stpk2.eyJwcm9qZWN0SWQiOiJmaXZlcGl4ZWxzLWJhc2ljLWV4YW1wbGUiLCJlbnZpcm9ubWVudCI6IlNUQUdFRCIsImF1dGhvcklkIjoiOGVkNGM5ZmUtYzQyZC00YWVjLTgwZDgtOTc3YjZjNTQ4YjFjIiwiYXV0aG9yTmFtZSI6IjEy44S3IiwicHJpdmF0ZUtleSI6eyJrZXlfb3BzIjpbInNpZ24iXSwiZXh0Ijp0cnVlLCJrdHkiOiJFQyIsIngiOiJ1ZG9tY3FwM3otY09QWmwtT1dQSkJFMVdCSFNkRWlNOEtzaXpoQVR0cC1FIiwieSI6Ik5DYWdfcXZiRDJVcWZOb2J2djlRMU02UXRGdTVtVDlROXlNRm53YTNZN2MiLCJjcnYiOiJQLTI1NiIsImQiOiIzcUkwd0VoTDlHWDVjelFGMGM5bndJVkUwNlNPbVRUamRyS0tVMUM5QnVRIn0sInB1YmxpY0tleSI6eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6InVkb21jcXAzei1jT1BabC1PV1BKQkUxV0JIU2RFaU04S3NpemhBVHRwLUUiLCJ5IjoiTkNhZ19xdmJEMlVxZk5vYnZ2OVExTTZRdEZ1NW1UOVE5eU1GbndhM1k3YyIsImNydiI6IlAtMjU2In19",
                        },
                        {
                            id: "dc88ca0c-b43f-40b2-844b-13b008a8cd96",
                            name: "Emily Johnson",
                            publicKey:
                                "stpub1.eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6Im1pbnhUQm8zVHRtNEt6MEdqVkZDOV9TcWNwOVJOZzF6RlRQa08xeGMxUTgiLCJ5IjoiTEQ5cHRHMUdkazRCWnhUc0xVOUdzS1RBa0RlX0tMNXFudkIxb0Z5NXlZRSIsImNydiI6IlAtMjU2In0",
                            privateKey:
                                "stpk2.eyJwcm9qZWN0SWQiOiJmaXZlcGl4ZWxzLWJhc2ljLWV4YW1wbGUiLCJlbnZpcm9ubWVudCI6IlNUQUdFRCIsImF1dGhvcklkIjoiZGM4OGNhMGMtYjQzZi00MGIyLTg0NGItMTNiMDA4YThjZDk2IiwiYXV0aG9yTmFtZSI6IuOFgeOEtCIsInByaXZhdGVLZXkiOnsia2V5X29wcyI6WyJzaWduIl0sImV4dCI6dHJ1ZSwia3R5IjoiRUMiLCJ4IjoibWlueFRCbzNUdG00S3owR2pWRkM5X1NxY3A5Uk5nMXpGVFBrTzF4YzFROCIsInkiOiJMRDlwdEcxR2RrNEJaeFRzTFU5R3NLVEFrRGVfS0w1cW52QjFvRnk1eVlFIiwiY3J2IjoiUC0yNTYiLCJkIjoiTTEzdUhkMEVwS3o2V29SUWZJZU1OQk5OckhDbUdTVWRQOE15OFQ3Nm9aVSJ9LCJwdWJsaWNLZXkiOnsia2V5X29wcyI6WyJ2ZXJpZnkiXSwiZXh0Ijp0cnVlLCJrdHkiOiJFQyIsIngiOiJtaW54VEJvM1R0bTRLejBHalZGQzlfU3FjcDlSTmcxekZUUGtPMXhjMVE4IiwieSI6IkxEOXB0RzFHZGs0Qlp4VHNMVTlHc0tUQWtEZV9LTDVxbnZCMW9GeTV5WUUiLCJjcnYiOiJQLTI1NiJ9fQ",
                        },
                        {
                            id: "4178c529-dbd1-4add-ad67-60e77b099043",
                            name: "Michael Lee",
                            publicKey:
                                "stpub1.eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6Im5USWFPQWZvZC12WDV0b0VnRXkwZ1dOV1JsWUE5S3RsZmdrc0ZzZDJnV2MiLCJ5IjoiNzdyZ2tJX0xtSlFNRV9mU1QxaGh0ZmZKY1IwenBIOWNrQk5YbUtuM08xRSIsImNydiI6IlAtMjU2In0",
                            privateKey:
                                "stpk2.eyJwcm9qZWN0SWQiOiJmaXZlcGl4ZWxzLWJhc2ljLWV4YW1wbGUiLCJlbnZpcm9ubWVudCI6IlNUQUdFRCIsImF1dGhvcklkIjoiNDE3OGM1MjktZGJkMS00YWRkLWFkNjctNjBlNzdiMDk5MDQzIiwiYXV0aG9yTmFtZSI6Iuq5gOyDgeykgCIsInByaXZhdGVLZXkiOnsia2V5X29wcyI6WyJzaWduIl0sImV4dCI6dHJ1ZSwia3R5IjoiRUMiLCJ4IjoiblRJYU9BZm9kLXZYNXRvRWdFeTBnV05XUmxZQTlLdGxmZ2tzRnNkMmdXYyIsInkiOiI3N3Jna0lfTG1KUU1FX2ZTVDFoaHRmZkpjUjB6cEg5Y2tCTlhtS24zTzFFIiwiY3J2IjoiUC0yNTYiLCJkIjoiWWpOclFyalRNQS1xRjNaVkdnU0t1Ymw2aFNjbXU4S1FFd09GNWJQR3Y5QSJ9LCJwdWJsaWNLZXkiOnsia2V5X29wcyI6WyJ2ZXJpZnkiXSwiZXh0Ijp0cnVlLCJrdHkiOiJFQyIsIngiOiJuVElhT0Fmb2Qtdlg1dG9FZ0V5MGdXTldSbFlBOUt0bGZna3NGc2QyZ1djIiwieSI6Ijc3cmdrSV9MbUpRTUVfZlNUMWhodGZmSmNSMHpwSDlja0JOWG1LbjNPMUUiLCJjcnYiOiJQLTI1NiJ9fQ",
                        },
                        {
                            id: "20324849-57db-4664-9359-60cd270fc598",
                            name: "김상준",
                            publicKey:
                                "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiVGo3LS14UTB2eEJjMjd4OHZpb1BmNGpWTW5naVYzVFJoM0MwOXZDWDJ4byIsInkiOiJkdndHZkNfcDdnVDJYM2ZXYzNqVEI4WHlPaGRVVXNwdW1oQzBhNlNQVEJVIn0",
                        },
                        {
                            id: "e6eae915-4e8a-4c7e-a504-4fec2a50618a",
                            name: "김민호",
                            publicKey:
                                "stpub1.eyJjcnYiOiJQLTI1NiIsImV4dCI6dHJ1ZSwia2V5X29wcyI6WyJ2ZXJpZnkiXSwia3R5IjoiRUMiLCJ4IjoiUDJZOXNDdlpvLS1ILVh6SmZMcl9YVFMtLTFPZTBvNEJZclBnRlJsR0tPdyIsInkiOiJ1VHhJU1V2VlJ3eFJoUkV5WFZsT0xhQS11RjkzdnZtcW91ZktxZ3RpcGpzIn0",
                        },
                    ],
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
