import { Link, useLocation } from "react-router";
import { LayoutDashboard, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Usuarios", to: "/users", icon: Users },
  { label: "Productos", to: "/products", icon: Package },
];

function AdminShell({ title, subtitle, children, rightSlot }) {
  const location = useLocation();

  return (
    <section className="relative h-screen overflow-hidden bg-[#1F1F1F] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 90% 20%, rgba(130,39,39,0.28), transparent 33%), radial-gradient(circle at 12% 90%, rgba(130,39,39,0.2), transparent 30%)",
        }}
      />

      <div className="relative flex h-full w-full">
        <aside className="flex h-full w-20 shrink-0 flex-col items-center border-r border-white/10 bg-[#111111]/95 px-2 py-4">
          <div className="mb-6 flex items-center gap-1">
            <span className="h-6 w-2 -skew-x-20 rounded-sm bg-[#822727]" />
            <span className="h-6 w-2 -skew-x-20 rounded-sm bg-[#822727]/65" />
          </div>

          <nav className="flex flex-1 flex-col items-center gap-2">
            {MENU_ITEMS.map(({ label, to, icon: Icon }) => {
              const isActive = location.pathname === to;

              return (
                <Link key={to} to={to} className="group relative">
                  <Button
                    variant="ghost"
                    aria-label={label}
                    className={`h-11 w-11 justify-center rounded-lg p-0 ${
                      isActive
                        ? "bg-[#822727]/26 text-white hover:bg-[#822727]/34"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                  <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-30 -translate-y-1/2 rounded-md border border-white/10 bg-[#0f0f0f] px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

        </aside>

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden px-5 pt-6 pb-4 lg:px-6">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold uppercase tracking-tight">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
            </div>
            {rightSlot}
          </header>

          <div className="scrollbar-invisible min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
        </main>
      </div>
    </section>
  );
}

export default AdminShell;
