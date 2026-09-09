import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";

// Admin route is available in development or when server auth mode is enabled.
const adminRoute = import.meta.env.DEV || import.meta.env.VITE_ADMIN_AUTH_MODE === "server"
  ? [
      {
        path: "/admin",
        lazy: async () => {
          const [{ default: AdminPage }, { default: AuthGuard }] =
            await Promise.all([
              import("../pages/AdminPage"),
              import("../components/AuthGuard"),
            ]);
          return {
            element: (
              <AuthGuard>
                <AdminPage />
              </AuthGuard>
            ),
          };
        },
      },
    ]
  : [];

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
    },
    {
        path: "/portfolio-pdf",
        lazy: async () => {
            const { default: PortfolioPdfPage } = await import("../pages/PortfolioPdfPage");
            return { element: <PortfolioPdfPage /> };
        },
    },
    ...adminRoute,
]);

export default router;
