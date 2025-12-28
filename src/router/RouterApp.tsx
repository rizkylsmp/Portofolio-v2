import { createHashRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";

const router = createHashRouter([
    {
        path: "/",
        element: <RootLayout />,
    } 
]);

export default router;