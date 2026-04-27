import { BrowserRouter as Router } from "react-router";
import AnimatedRoutes from "./components/AnimatedRoutes";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import PasswordRecoveryRequest from "./pages/PasswordRecoveryRequest";
import PasswordRecoveryOtp from "./pages/PasswordRecoveryOtp";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/authContext";

const appRoutes = [
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/register/otp", element: <OtpVerification /> },
  // flujo de recuperación de contraseña (solicitud de correo + validación OTP)
  { path: "/recover-password", element: <PasswordRecoveryRequest /> },
  { path: "/recover-password/otp", element: <PasswordRecoveryOtp /> },
  {
    element: <AdminLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/products", element: <Products /> },
      { path: "/users", element: <Users /> },
    ],
  },
];

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <main className="w-full">
            <AnimatedRoutes routes={appRoutes} />
          </main>
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: "#161616",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff",
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
