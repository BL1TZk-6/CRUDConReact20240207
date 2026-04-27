import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordCriteria from "@/components/ui/password-criteria";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function Register() {
    const navigate = useNavigate();
    const API_REGISTER = "http://localhost:3000/api/register";

    const [birthDate, setBirthDate] = useState();
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim() || !lastName.trim() || !email.trim() || !password || !birthDate) {
            toast.error("Completa todos los campos requeridos");
            return;
        }

        const payload = {
            name: name.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            birthDate: birthDate.toISOString().slice(0, 10),
            isVerified: false,
        };

        setIsSubmitting(true);

        try {
            const response = await fetch(API_REGISTER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const apiPayload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const details = apiPayload?.meta?.errors?.length
                    ? `: ${apiPayload.meta.errors.join(", ")}`
                    : "";
                throw new Error((apiPayload?.message || "Error registrando usuario") + details);
            }

            sessionStorage.setItem("pendingRegistration", JSON.stringify(payload));
            toast.success(apiPayload?.message || "Registro iniciado. Revisa tu correo");
            navigate("/register/otp");
        } catch (error) {
            toast.error(error.message || "No se pudo iniciar el registro");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "h-11 w-full rounded-xl border-white/10 bg-white/4 px-4 text-white placeholder:text-white/20 focus-visible:border-[#822727] focus-visible:ring-[#822727]/30";
    const labelClass = "text-xs font-medium text-white/50 uppercase tracking-wider";

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#1F1F1F] text-white">
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 20% 18%, rgba(130,39,39,0.35), transparent 38%)" }}
            />

            <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
                <aside className="hidden lg:flex items-center p-12 lg:p-16">
                    <div className="max-w-xl">
                        <span className="inline-block h-1 w-10 rounded-full bg-[#822727] mb-6" />
                        <h1 className="text-5xl font-bold uppercase tracking-[0.28em] text-white">Autorect</h1>
                        <p className="mt-6 text-2xl leading-7 text-white/50">
                            Completa tus datos y continúa a la verificación para activar tu acceso.
                        </p>
                    </div>
                </aside>

                <article className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
                    <Card className="w-full max-w-lg rounded-3xl border-white/10 bg-black/30 p-2 text-white ring-white/5">
                        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                            <p className="text-base font-semibold uppercase text-gray-500">Regístrate Gratis</p>
                            <CardTitle className="text-3xl font-semibold text-white">Crea una nueva cuenta<span className="text-[#822727]">.</span></CardTitle>
                            <CardDescription className="text-sm text-white/40">Usa solo los datos mínimos requeridos.</CardDescription>
                        </CardHeader>

                        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                            <form className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="register-name" className={labelClass}>Nombre</Label>
                                    <Input id="register-name" type="text" placeholder="Juan" className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-last-name" className={labelClass}>Apellido</Label>
                                    <Input id="register-last-name" type="text" placeholder="Pérez" className={inputClass} value={lastName} onChange={(event) => setLastName(event.target.value)} />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="register-email" className={labelClass}>Email</Label>
                                    <Input id="register-email" type="email" placeholder="correo@ejemplo.com" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-birth-date" className={labelClass}>Fecha de nacimiento</Label>
                                    <Popover>
                                        <PopoverTrigger
                                            className="h-11 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-left text-sm text-white outline-none transition focus-visible:border-[#822727] focus-visible:ring-2 focus-visible:ring-[#822727]/30"
                                            type="button"
                                        >
                                            <span className="inline-flex w-full items-center justify-between gap-3">
                                                <span className={birthDate ? "text-white" : "text-white/35"}>
                                                    {birthDate ? birthDate.toLocaleDateString("es-SV") : "Selecciona una fecha"}
                                                </span>
                                                <CalendarIcon className="h-4 w-4 text-white/60" />
                                            </span>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto border border-white/10 bg-[#1F1F1F] p-0 text-white" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={birthDate}
                                                onSelect={setBirthDate}
                                                captionLayout="dropdown"
                                                fromYear={1940}
                                                toYear={new Date().getFullYear()}
                                                className="rounded-xl bg-[#1F1F1F]"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <input
                                        id="register-birth-date"
                                        name="birthDate"
                                        type="hidden"
                                        value={birthDate ? birthDate.toISOString().slice(0, 10) : ""}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password" className={labelClass}>Contraseña</Label>
                                    <Input id="register-password" type="password" placeholder="••••••••" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} />
                                    <PasswordCriteria password={password} />
                                </div>

                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={isSubmitting}
                                    className="sm:col-span-2 mt-2 h-12 w-full rounded-xl border-[#822727] bg-transparent text-sm font-semibold text-white hover:bg-[#822727]/15 hover:text-white"
                                >
                                    {isSubmitting ? "Enviando..." : "Crear cuenta"}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-white/40">
                                ¿Ya tienes cuenta?{" "}
                                <Link to="/" className={`${buttonVariants({ variant: "link", size: "sm" })} h-auto p-0 font-semibold text-white hover:text-[#822727]`}>
                                    Inicia sesión
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </article>
            </div>
        </section>
    );
}

export default Register;
