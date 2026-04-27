import { Link, useNavigate } from "react-router"; // Importación de hooks y componentes necesarios para la funcionalidad de inicio de sesión y navegación
import { useState } from "react"; // Importación de useState para manejar el estado local del formulario de inicio de sesión
import { Button, buttonVariants } from "@/components/ui/button"; // Importación de componentes de botón personalizados para la interfaz de usuario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Importación de componentes de tarjeta personalizados para la interfaz de usuario
import { Input } from "@/components/ui/input"; // Importación de componente de entrada personalizado para la interfaz de usuario
import { Label } from "@/components/ui/label"; // Importación de componente de etiqueta personalizado para la interfaz de usuario
import { useAuth } from "@/hooks/useAuth"; // Importación de hook personalizado para manejar la autenticación del usuario

// Componente de inicio de sesión que maneja la autenticación del usuario y la navegación al dashboard
function Login() {
  const navigate = useNavigate(); // Hook para manejar la navegación programática
  const { login, loading } = useAuth(); // Hook personalizado para manejar la autenticación del usuario
  const [email, setEmail] = useState(""); // Estado local para almacenar el correo electrónico ingresado por el usuario
  const [password, setPassword] = useState(""); // Estado local para almacenar la contraseña ingresada por el usuario

  // Función para manejar el envío del formulario de inicio de sesión
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) { // Validación básica para asegurarse de que el correo electrónico y la contraseña no estén vacíos
      return;
    }

    const ok = await login(email.trim(), password); // Llamada a la función de inicio de sesión del hook personalizado
    if (!ok) {
      return;
    }

    navigate("/dashboard"); // Navegación al dashboard si el inicio de sesión es exitoso
  };

  return ( // Renderizado del formulario de inicio de sesión con estilos personalizados y enlaces para crear una cuenta nueva
    <section className="relative min-h-screen overflow-hidden bg-[#1F1F1F] text-white">
      <div className="pointer-events-none absolute inset-0" style={{background: "radial-gradient(circle at 20% 18%, rgba(130,39,39,0.35), transparent 38%)"}} />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="flex items-center p-8 sm:p-12 lg:p-16">
          <div className="max-w-xl">
            <span className="inline-block h-1 w-10 rounded-full bg-[#822727] mb-6" />
            <h1 className="text-5xl font-bold uppercase tracking-[0.28em] text-white">Autorect</h1>
            <p className="mt-6 text-2xl! leading-7 text-white/50 sm:text-lg">
              Cada pieza cuenta una historia
            </p>
          </div>
        </aside>

        <article className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
          <Card className="w-full max-w-lg rounded-3xl border-white/10 bg-black/30 p-2 text-white ring-white/5">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-3xl font-semibold text-white">Bienvenido<span className="text-[#822727]">!</span></CardTitle>
              <CardDescription className="mt-2 text-sm text-white/40">Ingresa tus credenciales para continuar.</CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <form className="mt-3 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs font-medium uppercase tracking-wider text-white/50">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="h-11 rounded-xl border-white/10 bg-white/4 px-4 text-white placeholder:text-white/20 focus-visible:border-[#822727] focus-visible:ring-[#822727]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wider text-white/50">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-white/4 px-4 text-white placeholder:text-white/20 focus-visible:border-[#822727] focus-visible:ring-[#822727]/30"
                  />
                </div>



                <div className="flex justify-end">
                  <Link
                    to="/recover-password"
                    className={`${buttonVariants({ variant: "link", size: "sm" })} h-auto p-0 text-white/75 hover:text-[#822727]`}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-xl border-[#822727] bg-transparent text-sm font-semibold text-white hover:bg-[#822727]/15 hover:text-white"
                >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-white/40">
                ¿Aún no tienes cuenta?{" "}
                <Link to="/register" className={`${buttonVariants({ variant: "link", size: "sm" })} h-auto p-0 font-semibold text-white hover:text-[#822727]`}>
                  Crear cuenta
                </Link>
              </p>
            </CardContent>
          </Card>
        </article>
      </div>
    </section>
  );
}

export default Login;
