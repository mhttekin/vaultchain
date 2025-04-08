"use client"
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { AuthProvider } from "../context/AuthContext";

export default function LayoutWrapper({ children }) {
  const pathName = usePathname();
  const hiddenRoutes = ["/login", "/admin", "/admin/dashboard"];
  const hideNavbar = hiddenRoutes.includes(pathName);

  return (
    <AuthProvider>
      {children}
      {!hideNavbar && <Navbar />}
    </AuthProvider>
  );
}
