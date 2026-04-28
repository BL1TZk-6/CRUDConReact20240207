import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Box,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
 
import { useAuth } from "@/hooks/useAuth"; // Hook personalizado para autenticación
 
const TOKEN_KEY = "accessToken"; // Clave para almacenar el token de acceso en localStorage
 
const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); // Función para obtener el token almacenado en localStorage
 
const emptyProductForm = {
  name: "",
  category: "",
  stock: "0",
  price: "",
  status: "stable",
};
 
const statusFilterOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "top", label: "Top" },
  { value: "stable", label: "Estable" },
  { value: "low", label: "Stock bajo" },
];
 
const sortOptions = [
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "price-desc", label: "Precio mayor" },
  { value: "price-asc", label: "Precio menor" },
  { value: "stock-desc", label: "Stock mayor" },
  { value: "stock-asc", label: "Stock menor" },
];
 
const statusLabelMap = {
  top: "Top",
  stable: "Estable",
  low: "Bajo",
};
 
const badgeCellClassName =
  "inline-flex h-7 min-w-24 justify-center rounded-full px-3 text-center text-xs font-semibold";
 
const formatPrice = (value) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
 
const validateProductForm = (form) => {
  const errors = {};
 
  if (!form.name.trim()) {
    errors.name = "El nombre es requerido";
  }
  if (!form.price) {
    errors.price = "El precio es requerido";
  } else if (Number(form.price) <= 0) {
    errors.price = "El precio debe ser mayor a 0";
  }
  return errors;
};
 
// ☆ Normalización de producto: convierte el producto recibido del backend a un formato consistente para el frontend
const normalizeProduct = (product = {}) => {
  const stock = Number(product.stock || 0);
 
  // Lógica de cálculo de estado dinámico
  let calculatedStatus = "stable";
  if (stock <= 10) {
    calculatedStatus = "low"; // Usamos 'low' internamente para coincidir statusO
  } else if (stock >= 100) {
    calculatedStatus = "top";
  }
 
  return {
    id: product._id || product.id || "",
    name: product.name || "",
    description: product.description || "",
    stock: stock,
    price: product.price?.$numberDecimal
      ? parseFloat(product.price.$numberDecimal)
      : Number(product.price || 0),
    status: calculatedStatus, // Ahora el objeto tiene la propiedad status
  };
};
 
function Products() {
  // ☆ Obtener la URL de la API y la función de logout desde el hook de autenticación
  const { API, logout } = useAuth();
 
  // ☆ Definir la URL base de la API para productos.
  const API_URL = "http://localhost:4000/api/products";
 
  // ☆ Estado para almacenar la lista de productos obtenidos del backend. Empezamos con un array vacío para no cargar los datos quemados.
  const [products, setProducts] = useState([]); // Empezamos vacío
  const [loading, setLoading] = useState(true); // Estado de carga inicial
 
  /*   const [products, setProducts] = useState(initialProducts);
  const [loading] = useState(false); */
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createForm, setCreateForm] = useState(emptyProductForm);
  const [editForm, setEditForm] = useState({ ...emptyProductForm, id: "" });
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
 
  const rowsPerPage = 10;
 
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getStoredToken(); // Usamos la función de arriba
 
      if (!token) {
        // Si no hay token, no seguimos para evitar el 401 innecesario
        console.warn("No se encontró token de acceso");
        return;
      }
 
      const response = await fetch(`${API}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Asegúrate de que lleva la palabra 'Bearer '
        },
        credentials: "include",
      });
 
      if (response.status === 401) {
        toast.error("Sesión expirada");
        await logout({ reason: "expired", callApi: false });
        return;
      }
 
      const payload = await response.json();
 
      // Usamos payload.data porque así lo vimos en el Dashboard
      const result = Array.isArray(payload?.data)
        ? payload.data.map(normalizeProduct)
        : [];
      setProducts(result);
    } catch (error) {
      console.error("Error en el fetch:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchProducts();
  }, []);
 
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
 
    const term = searchText.trim().toLowerCase();
 
    const matches = products.filter((item) => {
      // ☆ 1. Buscamos coincidencias en Nombre e ID (que siempre existen)
      const nameMatch = item.name?.toLowerCase().includes(term);
      const idMatch = item.id?.toString().toLowerCase().includes(term);
 
      // ☆ 2. Buscamos en la descripción (opcional)
      const descriptionMatch = item.description?.toLowerCase().includes(term);
 
      // Combinamos las búsquedas: si el término está en cualquiera de esos campos, es un match
      const bySearch =
        !term || nameMatch || idMatch || descriptionMatch;
 
      // Filtros adicionales (Estado y Categoría de los selectores)
      const byStatus = statusFilter === "all" || item.status === statusFilter;
      const byCategory =
        categoryFilter === "all" ||
        item.category?.toLowerCase() === categoryFilter.toLowerCase();
 
      return bySearch && byStatus && byCategory;
    });
 
    return [...matches].sort((first, second) => {
      switch (sortBy) {
        case "name-desc":
          return second.name.localeCompare(first.name, "es", {
            sensitivity: "base",
          });
        case "price-desc":
          return second.price - first.price;
        case "price-asc":
          return first.price - second.price;
        case "stock-desc":
          return second.stock - first.stock;
        case "stock-asc":
          return first.stock - second.stock;
        case "name-asc":
        default:
          return first.name.localeCompare(second.name, "es", {
            sensitivity: "base",
          });
      }
    });
  }, [products, searchText, statusFilter, categoryFilter, sortBy]);
 
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / rowsPerPage)
  );
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [currentPage, filteredProducts]);
 
  // Cambio de un array vacio a seleccionar el item que viene de statusFilter
  const topCount = products.filter((item) => item.status === "top").length;
  const stableCount = products.filter(
    (item) => item.status === "stable"
  ).length;
  const lowCount = products.filter((item) => item.status === "low").length;
 
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
 
  useEffect(() => {
    setExpandedRowId(null);
  }, [currentPage]);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, categoryFilter, sortBy]);
 
  const hasActiveFilters =
    searchText.trim().length > 0 ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    sortBy !== "name-asc";
 
  const toggleExpandRow = (rowId) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };
 
  const requestDelete = (product) => {
    setDeleteTarget(product);
  };
 
  const confirmDelete = async () => {
    if (!deleteTarget) return;
 
    try {
      const token = getStoredToken();
 
      const response = await fetch(`${API}/products/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      if (response.status === 401) {
        toast.error("Sesión expirada");
        await logout({ reason: "expired", callApi: false });
        return;
      }
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "No se pudo eliminar el producto");
      }
 
      // Éxito: Actualizamos el estado local para que desaparezca de inmediato
      setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setExpandedRowId((prev) => (prev === deleteTarget.id ? null : prev));
      setDeleteTarget(null);
      toast.success("Producto eliminado permanentemente");
    } catch (error) {
      console.error("Error en DELETE:", error);
      toast.error(error.message);
      setDeleteTarget(null); // Cerramos el modal de todas formas si hubo error
    }
  };
 
  const openEditModal = (product) => {
    setEditForm({
      ...product,
      stock: String(product.stock),
      price: String(product.price),
    });
    setIsEditOpen(true);
  };
 
  const handleCreateSubmit = async (event) => {
    event.preventDefault();
 
    // ☆ 1. Validamos los errores del formulario de creación
    const errors = validateProductForm(createForm);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;
 
    try {
      const token = getStoredToken();
 
      // ☆ 2. Petición POST a la API
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          stock: Number(createForm.stock),
          price: Number(createForm.price),
          status: createForm.status,
          // Si tu backend requiere 'description', agrégala aquí aunque sea vacía
          description: createForm.description.trim(),
        }),
      });
 
      // ☆ 3. Manejo de autorización
      if (response.status === 401) {
        toast.error("Sesión expirada");
        await logout({ reason: "expired", callApi: false });
        return;
      }
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el producto");
      }
 
      // ☆ 4. Éxito
      toast.success("Producto creado exitosamente en AutoRect");
      setIsCreateOpen(false); // Cerramos el modal
      setCreateForm(emptyProductForm); // Limpiamos el formulario
      setCreateErrors({});
      fetchProducts(); // Recargamos la tabla para ver el nuevo producto
    } catch (error) {
      console.error("Error en POST:", error);
      toast.error(error.message);
    }
  };
  const handleEditSubmit = async (event) => {
    event.preventDefault();
 
    const errors = validateProductForm(editForm);
    setEditErrors(errors);
 
    if (Object.keys(errors).length > 0) {
      console.log("Errores de validación:", errors);
      toast.error("Revisa los campos del formulario");
      return;
    }
 
    // Si el ID no existe, algo salió mal al abrir el modal
    if (!editForm.id) {
      toast.error("Error: ID del producto no encontrado");
      return;
    }
 
    try {
      const token = getStoredToken();
 
      const response = await fetch(`${API}/products/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(), // Aseguramos que la descripción se guarde
          category: editForm.category,
          stock: Number(editForm.stock),
          price: Number(editForm.price),
        }),
      });
 
      if (response.status === 401) {
        toast.error("Sesión expirada");
        await logout({ reason: "expired", callApi: false });
        return;
      }
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el producto");
      }
 
      toast.success("Producto actualizado correctamente");
      setIsEditOpen(false);
      setEditErrors({});
      fetchProducts(); // Recargamos la lista desde el backend
    } catch (error) {
      console.error("Error en PUT:", error);
      toast.error(error.message);
    }
  };
 
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 pb-3">
      <div className="space-y-3 rounded-[28px] border border-white/8 bg-black/20 px-4 py-4 shadow-[0_16px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_220px_220px_230px_auto]">
          <InputGroup className="h-10 rounded-full border-white/15 bg-black/25 text-white shadow-none">
            <InputGroupAddon className="pl-4 text-white/35">
              <Search className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="h-10 rounded-full border-0 bg-transparent text-white placeholder:text-white/35"
            />
          </InputGroup>
 
          <Combobox
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={statusFilterOptions}
            placeholder="Filtrar por estado"
            searchPlaceholder="Buscar estado..."
            icon={<ChevronDown className="h-4 w-4" />}
          />
 
          <Combobox
            value={sortBy}
            onValueChange={setSortBy}
            options={sortOptions}
            placeholder="Ordenar por"
            icon={<ArrowUpDown className="h-4 w-4" />}
          />
 
          <Button
            variant="outline"
            className="h-10 rounded-full border-[#822727]/70 bg-transparent px-4 text-sm font-semibold text-white hover:bg-[#822727]/15"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </div>
      </div>
 
      <Card className="min-h-0 flex-1 border-white/10 bg-[#111111]/90 text-white shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col pt-3">
          <div className="scrollbar-invisible min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#151515]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#151515]">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-12 text-white/45">#</TableHead>
                  <TableHead className="text-white/45">Producto</TableHead>
                  <TableHead className="text-white/45">Descripción</TableHead>
                  <TableHead className="text-white/45">Precio</TableHead>
                  <TableHead className="text-white/45">Stock</TableHead>
                  <TableHead className="text-white/45">Estado</TableHead>
                  <TableHead className="w-32 text-right text-white/45">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading &&
                  paginatedProducts.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="border-white/10 hover:bg-white/4"
                    >
                      <TableCell className="text-white/65">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <span className="inline-flex items-center gap-2">
                          <Box className="h-4 w-4 text-[#822727]" />
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-white/65 truncate max-w-[200px]">
                        {item.description || "Sin descripción"}
                      </TableCell>
                      <TableCell className="text-white/65">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-white/65">
                        {item.stock} unidades
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${badgeCellClassName} ${
                            item.status === "top"
                              ? "bg-green-500/20 text-green-400"
                              : item.status === "low"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {item.status === "low"
                            ? "Stock Bajo"
                            : item.status === "top"
                            ? "Top"
                            : "Estable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-md border border-white/15 text-white/70 hover:bg-white/10"
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-md border border-[#822727]/35 bg-[#822727]/10 text-[#ff8f8f] hover:bg-[#822727]/20"
                            onClick={() => requestDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
 
      {/* MODAL CREAR: Solo campos del model */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            // Aquí reseteas tu estado al valor inicial
            setCreateForm({
              name: "",
              description: "",
              price: "",
              stock: "",
            });
            // También es buena práctica limpiar errores si los tienes
            setCreateErrors({});
          }
        }}
      >
        <DialogContent className="border border-white/10 bg-[#161616] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nombre del producto</Label>
              <Input
                id="create-name"
                className="h-11"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej. Laptop X14"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-description">Descripción (Opcional)</Label>
              <textarea
                id="create-description"
                className="flex w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
                rows={3}
                value={createForm.description}
                placeholder="Ingrese una descripción..."
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-price">Precio (USD)</Label>
                <Input
                  id="create-price"
                  className="h-11"
                  type="number"
                  min="0"
                  step="0.01"
                  value={createForm.price}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }));
                    if (createErrors.price)
                      setCreateErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  placeholder="0.00"
                  aria-invalid={!!createErrors.price}
                />
                {createErrors.price && (
                  <p className="text-xs text-red-500">{createErrors.price}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-stock">Stock</Label>
                <Input
                  id="create-stock"
                  type="number"
                  className="h-11"
                  value={createForm.stock}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      stock: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="text-black"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#822727] hover:bg-[#9b2f2f]">
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
 
      {/* MODAL EDITAR: Solo campos del model */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border border-white/10 bg-[#161616] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                className="h-11"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Descripción</Label>
              <textarea
                id="edit-description"
                className="flex w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm"
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price">Precio (USD)</Label>
                <Input
                  id="edit-price"
                  className="h-11"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.price}
                  onChange={(event) => {
                    setEditForm((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }));
                    if (editErrors.price)
                      setEditErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  aria-invalid={!!editErrors.price}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  className="h-11"
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                className="bg-[#fffff] hover:bg-[#ffff]"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#822727] hover:bg-[#9b2f2f]">
                Actualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
 
      {/* ALERT DELETE */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="border border-white/10 bg-[#161616] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              Esta acción eliminará permanentemente{" "}
              <strong>{deleteTarget?.name}</strong> de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-black">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#822727] hover:bg-[#9b2f2f]"
              onClick={confirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
 
export default Products;