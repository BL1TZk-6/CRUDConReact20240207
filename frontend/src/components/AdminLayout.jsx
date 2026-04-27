import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminShell from "@/components/AdminShell";
import { Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const PANEL_META = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Resumen operativo del sistema",
  },
  "/users": {
    title: "Usuarios",
    subtitle: "Gestion de accesos, roles y estados de cuenta",
  },
  "/products": {
    title: "Productos",
    subtitle: "Gestion de catalogo, inventario y precios",
  },
};

function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const accountMenuRef = useRef(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const meta = PANEL_META[location.pathname] ?? PANEL_META["/dashboard"];

  const userInitials = useMemo(() => {
    if (!user) {
      return "US";
    }

    const raw = `${user.name || ""} ${user.lastName || ""}`.trim();
    if (!raw) {
      return "US";
    }

    return raw
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [user]);

  const userTitle = user?.email || "Cuenta activa";

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminShell
      title={meta.title}
      subtitle={meta.subtitle}
      rightSlot={
        <>
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              aria-label="Abrir menu de cuenta"
              onClick={() => setAccountMenuOpen((currentValue) => !currentValue)}
              className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all hover:border-[#822727]/50 hover:bg-white/[0.03] focus-visible:border-[#822727]/60"
            >
              <div className="flex items-center gap-2">
                <Avatar className="size-8 ring-1 ring-white/20">
                  <AvatarFallback className="bg-[#822727] text-xs text-white">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="max-w-35 truncate text-xs font-medium text-white">{userTitle}</p>
                  <p className="text-[11px] text-white/45">Panel administrativo</p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-white/65 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {accountMenuOpen ? (
              <div className="absolute top-[calc(100%+10px)] right-0 z-50 w-64 rounded-xl border border-white/10 bg-[#121212] p-2 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
                <div className="px-2 py-2 text-white">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-[#c65a5a]" />
                    <div>
                      <p className="text-sm font-semibold text-white">Sesión actual</p>
                      <p className="text-[11px] text-white/55">{userTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="my-1 h-px bg-white/10" />
                <button
                  type="button"
                  className="flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-[#ff9f9f] transition-colors hover:bg-[#822727]/10"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setOpenLogoutConfirm(true);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>

          <AlertDialog open={openLogoutConfirm} onOpenChange={setOpenLogoutConfirm}>
            <AlertDialogContent className="border border-white/10 bg-[#161616] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Seguro que deseas cerrar sesión?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/55">
                  Tu sesión actual se cerrará en este dispositivo y volverás a la pantalla de inicio.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="border-t-0 bg-transparent">
                <AlertDialogCancel className="text-black hover:text-black">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#822727] hover:bg-[#9b2f2f]"
                  onClick={() => logout()}
                >
                  Sí, cerrar sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <Outlet />
    </AdminShell>
  );
}

export default AdminLayout;
