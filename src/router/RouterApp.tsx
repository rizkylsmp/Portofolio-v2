import { createHashRouter, Navigate } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import ProfilePage from "../pages/ProfilePage";

const router = createHashRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/profile" replace />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            }
        ],
    } 
]);

export default router;