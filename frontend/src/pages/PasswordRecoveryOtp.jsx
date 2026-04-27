import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordCriteria from "@/components/ui/password-criteria";
import { isStrongPassword } from "@/lib/password-policy";

function PasswordRecoveryOtp() {
  const navigate = useNavigate();
  const API_RECOVERY = "http://localhost:4000/api/password-recovery"; // endpoint para reenvío de código OTP
  const API_RECOVERY_VERIFY = "http://localhost:4000/api/password-recovery/verify"; // endpoint para validar OTP y actualizar contraseña

  const [otpCode, setOtpCode] = useState(""); // código OTP ingresado por el usuario
  const [newPassword, setNewPassword] = useState(""); // nueva contraseña a establecer
  const [confirmPassword, setConfirmPassword] = useState(""); // confirmación de contraseña
  const [showPassword, setShowPassword] = useState(false); // visibilidad del campo nueva contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // visibilidad del campo confirmación
  const [isSubmitting, setIsSubmitting] = useState(false); // estado de validación del formulario principal
  const [isResending, setIsResending] = useState(false); // estado de reenvío del OTP

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (otpCode.length !== 6) {
      toast.error("Ingresa el código OTP de 6 dígitos");
      return;
    }

    if (!newPassword) {
      toast.error("Debes ingresar una nueva contraseña");
      return;
    }

    if (!isStrongPassword(newPassword)) {
      toast.error("La contraseña debe incluir mayúscula, minúscula, número y carácter especial");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_RECOVERY_VERIFY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          verificationCodeRequest: otpCode,
          newPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = payload?.meta?.errors?.length
          ? `: ${payload.meta.errors.join(", ")}`
          : "";
        throw new Error((payload?.message || "No se pudo validar la recuperación") + details);
      }

      sessionStorage.removeItem("pendingPasswordRecovery"); // limpiamos datos temporales al finalizar el flujo
      toast.success(payload?.message || "Contraseña actualizada correctamente");
      navigate("/"); // redirigimos al login al completar el cambio de contraseña
    } catch (error) {
      toast.error(error.message || "Error validando código de recuperación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const rawPending = sessionStorage.getItem("pendingPasswordRecovery"); // recuperamos el correo guardado en el paso anterior
    if (!rawPending) {
      toast.error("No hay solicitud de recuperación para reenviar");
      return;
    }

    setIsResending(true);

    try {
      const payload = JSON.parse(rawPending); // reutilizamos el mismo correo para solicitar un nuevo OTP
      const response = await fetch(API_RECOVERY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || "No se pudo reenviar el código");
      }

      toast.success(result?.message || "Código reenviado");
    } catch (error) {
      toast.error(error.message || "No se pudo reenviar el código");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1F1F1F] text-white">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 20% 18%, rgba(130,39,39,0.35), transparent 38%)" }} />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="hidden lg:flex items-center p-12 lg:p-16">
          <div className="max-w-xl">
            <span className="mb-6 inline-block h-1 w-10 rounded-full bg-[#822727]" />
            <h1 className="text-5xl font-bold uppercase tracking-[0.28em] text-white">Autorect</h1>
            <p className="mt-6 text-2xl leading-7 text-white/50">
              Confirma el OTP y define una nueva contraseña segura para tu cuenta.
            </p>
          </div>
        </aside>

        <article className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
          <Card className="w-full max-w-xl rounded-3xl border-white/10 bg-black/30 p-2 text-white ring-white/5">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-3xl font-semibold text-white">Validar recuperación<span className="text-[#822727]">.</span></CardTitle>
              <CardDescription className="mt-2 text-sm text-white/40">Ingresa el código de 6 dígitos y tu nueva contraseña.</CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <form className="mt-3 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-white/50">Código OTP</Label>
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} containerClassName="justify-center">
                    <InputOTPGroup className="rounded-xl border border-white/10 bg-white/4">
                      <InputOTPSlot index={0} className="h-11 w-11 border-white/10 text-white" />
                      <InputOTPSlot index={1} className="h-11 w-11 border-white/10 text-white" />
                      <InputOTPSlot index={2} className="h-11 w-11 border-white/10 text-white" />
                      <InputOTPSlot index={3} className="h-11 w-11 border-white/10 text-white" />
                      <InputOTPSlot index={4} className="h-11 w-11 border-white/10 text-white" />
                      <InputOTPSlot index={5} className="h-11 w-11 border-white/10 text-white" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recovery-new-password" className="text-xs font-medium uppercase tracking-wider text-white/50">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="recovery-new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-xl border-white/10 bg-white/4 px-4 pr-10 text-white placeholder:text-white/20 focus-visible:border-[#822727] focus-visible:ring-[#822727]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recovery-confirm-password" className="text-xs font-medium uppercase tracking-wider text-white/50">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="recovery-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="off"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-xl border-white/10 bg-white/4 px-4 pr-10 text-white placeholder:text-white/20 focus-visible:border-[#822727] focus-visible:ring-[#822727]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
                      aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/35">La confirmación debe coincidir exactamente con la clave nueva.</p>
                </div>

                <PasswordCriteria password={newPassword} />

                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border-[#822727] bg-transparent text-sm font-semibold text-white hover:bg-[#822727]/15 hover:text-white"
                >
                  {isSubmitting ? "Validando..." : "Validar y actualizar contraseña"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-sm text-white/40">
                <Link to="/recover-password" className={buttonVariants({ variant: "link", size: "sm" }) + " h-auto p-0 text-white hover:text-[#822727]"}>
                  Volver
                </Link>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className={buttonVariants({ variant: "link", size: "sm" }) + " h-auto p-0 text-white hover:text-[#822727]"}
                >
                  {isResending ? "Reenviando..." : "Reenviar código"}
                </button>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </section>
  );
}

export default PasswordRecoveryOtp;
