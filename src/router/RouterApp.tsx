import { createHashRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";

// Admin route is only available in development (localhost)
const adminRoute = import.meta.env.DEV
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

const router = createHashRouter([
    {
        path: "/",
        element: <RootLayout />,
    },
    ...adminRoute,
]);

export default router;