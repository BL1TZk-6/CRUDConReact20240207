import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Login" },
  { to: "/register", label: "Registro" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Productos" },
];

function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-cyan-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-(--brand-coral) shadow-[0_0_0_6px_rgba(255,107,95,0.2)]" />
          <p className="text-lg font-extrabold tracking-tight text-(--brand-ink)">Autorect Admin</p>
        </div>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-(--brand-ink) text-white"
                    : "bg-white text-slate-700 hover:bg-(--brand-sand)/60",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Nav;
