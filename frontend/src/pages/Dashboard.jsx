import { useCallback, useEffect, useMemo, useState } from "react"; // React hooks para manejar estado, efectos secundarios y memorizar valores
import { Activity, Box, ShieldCheck, Users } from "lucide-react"; // Iconos de lucide-react
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"; // Componentes de gráficos de recharts
import { Badge } from "@/components/ui/badge"; // Componente de badge
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Componentes de card
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"; // Componentes personalizados para gráficos y tooltips
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Componentes de tabla
import { useAuth } from "@/hooks/useAuth"; // Hook personalizado para autenticación

const TOKEN_KEY = "accessToken"; // Clave para almacenar el token de acceso en localStorage

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); // Función para obtener el token almacenado en localStorage

// Funciones de normalización para asegurar que los datos tengan un formato consistente
const normalizeUser = (user = {}) => ({
  id: user._id || user.id || "",
  name: user.name || "",
  lastName: user.lastName || "",
  email: user.email || "",
  createdAt: user.createdAt || null,
  isVerified: Boolean(user.isVerified),
});

// Normalización de productos para asegurar que los datos tengan un formato consistente
const normalizeProduct = (product = {}) => ({
  id: product._id || product.id || "",
  name: product.name || "",
  description: product.description || "",
  stock: Number(product.stock || 0),
  price: Number(product.price || 0),
  createdAt: product.createdAt || null,
});

// Función para convertir una fecha a su representación de mes corto en español
const toShortMonth = (date) =>
  date.toLocaleDateString("es-SV", {
    month: "short",
  });

  // Componente principal del dashboard que muestra estadísticas y actividad reciente
function Dashboard() {
  const { API, logout } = useAuth(); // Obtener la URL de la API y la función de logout desde el hook de autenticación
  const [loading, setLoading] = useState(true); // Estado para indicar si los datos están cargando
  const [error, setError] = useState(""); // Estado para almacenar mensajes de error
  const [users, setUsers] = useState([]); // Estado para almacenar la lista de usuarios
  const [products, setProducts] = useState([]); // Estado para almacenar la lista de productos
  const [search, setSearch] = useState(""); // Estado para almacenar el término de búsqueda en la actividad reciente

  const fetchDashboardData = useCallback(async () => { // Función para obtener los datos del dashboard desde la API
    setLoading(true); // Indicar que los datos están cargando
    setError(""); // Limpiar cualquier mensaje de error previo

    try {
      const token = getStoredToken(); // Obtener el token de acceso almacenado
      if (!token) { // Si no hay token, cerrar sesión y salir
        await logout({ reason: "expired", callApi: false });
        return;
      }
      // Configurar los encabezados de la solicitud con el token de acceso
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      // Realizar solicitudes simultáneas para obtener usuarios y productos
      const [usersRes, productsRes] = await Promise.all([
        fetch(`${API}/users`, { headers, credentials: "include" }),
        fetch(`${API}/products`, { headers, credentials: "include" }),
      ]);
      // Si alguna de las respuestas indica que el token ha expirado, cerrar sesión y salir
      if (usersRes.status === 401 || productsRes.status === 401) {
        await logout({ reason: "expired", callApi: false });
        return;
      }
      // Intentar parsear las respuestas como JSON, manejando cualquier error
      const usersPayload = await usersRes.json().catch(() => ({}));
      const productsPayload = await productsRes.json().catch(() => ({}));

      // Si alguna de las respuestas no es exitosa, lanzar un error
      if (!usersRes.ok || !productsRes.ok) {
        throw new Error(usersPayload?.message || productsPayload?.message || "No se pudieron cargar los datos del dashboard");
      }
      // Normalizar los datos de usuarios y productos para asegurar que tengan un formato consistente
      const usersData = Array.isArray(usersPayload?.data)
        ? usersPayload.data.map(normalizeUser)
        : [];
      const productsData = Array.isArray(productsPayload?.data)
        ? productsPayload.data.map(normalizeProduct)
        : [];

      setUsers(usersData); // Actualizar el estado con los datos de usuario
      setProducts(productsData); // Actualizar el estado con los datos de productos
    } catch (requestError) {
      setError(requestError.message || "Error al cargar dashboard");
    } finally { // Indicar que la carga ha finalizado
      setLoading(false);
    }
  }, [API, logout]); // Dependencias para memorizar la función de obtención de datos

  // Efecto para cargar los datos del dashboard cuando el componente se monta o cuando la función de obtención de datos cambia
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Cálculos para estadísticas del dashboard
  const verifiedUsers = users.filter((user) => user.isVerified).length;
  const lowStockProducts = products.filter((product) => product.stock <= 5).length;
  const avgStock = products.length
    ? Math.round(products.reduce((acc, product) => acc + product.stock, 0) / products.length)
    : 0;

    // Memorización de las filas de actividad reciente
  const activityRows = useMemo(() => {
    const userRows = users.map((user) => ({
      id: `U-${user.id}`, // Prefijo para diferenciar entre usuarios y productos
      type: "Usuario", // Tipo de actividad
      title: `${user.name} ${user.lastName}`.trim() || user.email, // Título para mostrar en la actividad
      subtitle: user.email, // Detalle adicional para mostrar en la actividad
      createdAt: user.createdAt, // Fecha de creación para ordenar la actividad
      status: user.isVerified ? "Verificado" : "Pendiente", // Estado del usuario para mostrar en la actividad
    }));

    const productRows = products.map((product) => ({
      id: `P-${product.id}`, // Prefijo para diferenciar entre usuarios y productos
      type: "Producto", // Tipo de actividad
      title: product.name, // Título para mostrar en la actividad
      subtitle: product.description || "Sin descripcion", // Detalle adicional para mostrar en la actividad
      createdAt: product.createdAt, // Fecha de creación para ordenar la actividad
      status: product.stock <= 5 ? "Stock bajo" : "Disponible", // Estado del producto para mostrar en la actividad
    }));
    // Combinar las filas de usuarios y productos, y ordenarlas por fecha de creación de manera descendente
    return [...userRows, ...productRows]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [products, users]);

  // Memorización de las filas de actividad filtradas según el término de búsqueda
  const filteredActivity = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return activityRows.slice(0, 12);
    }
    // Filtrar las filas de actividad para incluir solo aquellas que coincidan con el término de búsqueda en cualquiera de sus campos relevantes
    return activityRows
      .filter((row) =>
        `${row.title} ${row.subtitle} ${row.type} ${row.status}`
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 12);
  }, [activityRows, search]);

  // Memorización de la tendencia mensual
  const usersMonthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Para cada mes, contar cuántos usuarios se crearon en ese mes
    return months.map((monthDate) => {
      const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const count = users.filter((user) => {
        if (!user.createdAt) {
          return false;
        }
        const d = new Date(user.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}` === key;
      }).length;

      return {
        label: toShortMonth(monthDate),
        total: count,
      };
    });
  }, [users]); // Dependencia para recalcular la tendencia mensual

  // Memorización de los productos con más stock
  const topStockProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map((product) => ({
          label: product.name.length > 12 ? `${product.name.slice(0, 12)}...` : product.name, // Etiqueta para mostrar en el gráfico
          stock: product.stock, // Valor de stock para mostrar en el gráfico
        })),
    [products], // Dependencia para recalcular los productos con más stock
  );

  // Renderizado del componente del dashboard con estadísticas, gráficos y actividad reciente
  return (
    <div className="space-y-4 pb-4">

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/10 bg-[#1a1a1a] text-white">
          <CardHeader className="pb-1">
            <CardDescription className="text-white/45">Usuarios totales</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl"><Users className="h-5 w-5 text-[#c65a5a]" />{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-[#1a1a1a] text-white">
          <CardHeader className="pb-1">
            <CardDescription className="text-white/45">Usuarios verificados</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl text-emerald-300"><ShieldCheck className="h-5 w-5" />{verifiedUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-[#1a1a1a] text-white">
          <CardHeader className="pb-1">
            <CardDescription className="text-white/45">Productos totales</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl"><Box className="h-5 w-5 text-[#c65a5a]" />{products.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/10 bg-[#1a1a1a] text-white">
          <CardHeader className="pb-1">
            <CardDescription className="text-white/45">Stock bajo / Promedio</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl"><Activity className="h-5 w-5 text-[#c65a5a]" />{lowStockProducts} / {avgStock}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
        <Card className="border-white/10 bg-[#151515] text-white">
          <CardHeader>
            <CardTitle>Alta de usuarios por mes</CardTitle>
            <CardDescription className="text-white/45">Tendencia de crecimiento durante los ultimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total: {
                  label: "Usuarios",
                  color: "#822727",
                },
              }}
              className="h-60 w-full"
            >
              <LineChart data={usersMonthlyTrend} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={3} dot={{ r: 4, fill: "#822727" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#151515] text-white">
          <CardHeader>
            <CardTitle>Productos con mas stock</CardTitle>
            <CardDescription className="text-white/45">Lectura rapida de inventario actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                stock: {
                  label: "Stock",
                  color: "#c65a5a",
                },
              }}
              className="h-60 w-full"
            >
              <BarChart data={topStockProducts} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="stock" fill="var(--color-stock)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-[#151515] text-white">
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription className="text-white/45">Resultados en tiempo real desde usuarios y productos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="scrollbar-invisible max-h-105 overflow-y-auto rounded-xl border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/55">Tipo</TableHead>
                  <TableHead className="text-white/55">Nombre</TableHead>
                  <TableHead className="text-white/55">Detalle</TableHead>
                  <TableHead className="text-white/55">Estado</TableHead>
                  <TableHead className="text-right text-white/55">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={5} className="py-8 text-center text-white/55">Cargando actividad...</TableCell>
                  </TableRow>
                ) : null}

                {!loading && filteredActivity.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={5} className="py-8 text-center text-white/55">No hay resultados para la busqueda actual.</TableCell>
                  </TableRow>
                ) : null}

                {!loading && filteredActivity.map((row) => (
                  <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white/75">{row.type}</TableCell>
                    <TableCell className="font-medium text-white">{row.title}</TableCell>
                    <TableCell className="max-w-60 truncate text-white/70">{row.subtitle}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={row.status === "Verificado" || row.status === "Disponible"
                          ? "border-emerald-500/35 text-emerald-300"
                          : "border-amber-500/35 text-amber-300"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-white/70">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString("es-SV") : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
