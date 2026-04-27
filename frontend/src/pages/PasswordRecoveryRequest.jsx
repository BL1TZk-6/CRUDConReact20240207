import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PasswordRecoveryRequest() {
  const navigate = useNavigate();
  const API_RECOVERY = "http://localhost:4000/api/password-recovery"; // endpoint para iniciar el flujo de recuperación

  const [email, setEmail] = useState(""); // correo que solicita la recuperación
  const [isSubmitting, setIsSubmitting] = useState(false); // estado de envío del formulario

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Ingresa un correo válido");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_RECOVERY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = payload?.meta?.errors?.length
          ? `: ${payload.meta.errors.join(", ")}`
          : "";
        throw new Error((payload?.message || "No se pudo iniciar la recuperación") + details);
      }

      // guardamos temporalmente el correo para permitir reenvío de OTP en la siguiente vista
      sessionStorage.setItem("pendingPasswordRecovery", JSON.stringify({ email: email.trim() }));
      toast.success(payload?.message || "Código de recuperación enviado");
      navigate("/recover-password/otp"); // redirigimos al paso de validación OTP
    } catch (error) {
      toast.error(error.message || "No se pudo iniciar la recuperación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1F1F1F] text-white">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 18% 15%, rgba(130,39,39,0.35), transparent 40%)" }} />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="hidden lg:flex items-center p-12 lg:p-16">
          <div className="max-w-xl">
            <span className="mb-6 inline-block h-1 w-10 rounded-full bg-[#822727]" />
            <h1 className="text-5xl font-bold uppercase tracking-[0.28em] text-white">Autorect</h1>
            <p className="mt-6 text-2xl leading-7 text-white/50">
              Recupera tu acceso de forma segura con código OTP por correo.
            </p>
          </div>
        </aside>

        <article className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
          <Card className="w-full max-w-lg rounded-3xl border-white/10 bg-black/30 p-2 text-white ring-white/5">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-3xl font-semibold text-white">Recuperar contraseña<span className="text-[#822727]">.</span></CardTitle>
              <CardDescription className="mt-2 text-sm text-white/40">
                Escribe tu correo y te enviaremos un código para validar el cambio.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <form className="mt-3 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-xs font-medium uppercase tracking-wider text-white/50">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <Input
                      id="recovery-email"
                      type="email"
                      autoComplete="off"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="h-11 rounded-xl border-white/10 bg-white/4 pl-10 pr-4 text-white placeholder:text-white/20 focus-visible:border-[#822727] focus-visible:ring-[#822727]/30"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border-[#822727] bg-transparent text-sm font-semibold text-white hover:bg-[#822727]/15 hover:text-white"
                >
                  {isSubmitting ? "Enviando..." : "Enviar código de recuperación"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-sm text-white/45">
                <Link to="/" className={buttonVariants({ variant: "link", size: "sm" }) + " h-auto p-0 text-white hover:text-[#822727]"}>
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Volver a login
                </Link>
                <span className="text-xs text-white/30">Código válido por 5 minutos</span>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </section>
  );
}

export default PasswordRecoveryRequest;
