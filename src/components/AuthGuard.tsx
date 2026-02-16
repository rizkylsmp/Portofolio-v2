// ==========================================
// AuthGuard - Protects admin routes
// ==========================================

import { useState } from "react";
import { isAuthenticated } from "../services/authService";
import AdminLogin from "../pages/AdminLogin";

interface Props {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: Props) => {
  const [authed, setAuthed] = useState(isAuthenticated());

  if (!authed) {
    return <AdminLogin onAuthenticated={() => setAuthed(true)} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
