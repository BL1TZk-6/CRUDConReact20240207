import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Box, ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const initialProducts = [
  { id: "PRD-001", name: "Laptop X13", category: "Tecnologia", stock: 12, price: 1299, status: "top", sku: "LPX13-001", supplier: "TechCore" },
  { id: "PRD-002", name: "Mouse Pro", category: "Accesorios", stock: 36, price: 39, status: "stable", sku: "MPR-011", supplier: "NovaGear" },
  { id: "PRD-003", name: "Monitor 27\"", category: "Pantallas", stock: 8, price: 349, status: "low", sku: "MON27-022", supplier: "VisionLab" },
  { id: "PRD-004", name: "Teclado MK", category: "Accesorios", stock: 20, price: 79, status: "stable", sku: "TKMK-014", supplier: "NovaGear" },
  { id: "PRD-005", name: "Webcam 4K", category: "Video", stock: 9, price: 119, status: "low", sku: "W4K-009", supplier: "MediaFlow" },
  { id: "PRD-006", name: "Dock USB-C", category: "Conectividad", stock: 17, price: 89, status: "stable", sku: "DUC-103", supplier: "LinkBridge" },
  { id: "PRD-007", name: "SSD 1TB", category: "Almacenamiento", stock: 14, price: 129, status: "top", sku: "SSD1-200", supplier: "DataCore" },
  { id: "PRD-008", name: "Auriculares Pro", category: "Audio", stock: 22, price: 99, status: "stable", sku: "AUP-017", supplier: "SoundPeak" },
  { id: "PRD-009", name: "Hub 7 en 1", category: "Conectividad", stock: 7, price: 59, status: "low", sku: "HUB7-081", supplier: "LinkBridge" },
  { id: "PRD-010", name: "Silla Ergo", category: "Mobiliario", stock: 11, price: 249, status: "top", sku: "SER-541", supplier: "OfficeLine" },
  { id: "PRD-011", name: "Router AX", category: "Redes", stock: 16, price: 189, status: "stable", sku: "RAX-300", supplier: "NetCore" },
  { id: "PRD-012", name: "Base Vertical", category: "Accesorios", stock: 5, price: 49, status: "low", sku: "BVE-105", supplier: "NovaGear" },
];

const emptyProductForm = {
  name: "",
  category: "Accesorios",
  stock: "0",
  price: "",
  status: "stable",
  sku: "",
  supplier: "",
};

const statusFilterOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "top", label: "Top" },
  { value: "stable", label: "Estable" },
  { value: "low", label: "Stock bajo" },
];

const categoryFilterOptions = [
  { value: "all", label: "Todas las categorias" },
  { value: "accesorios", label: "Accesorios" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "pantallas", label: "Pantallas" },
  { value: "conectividad", label: "Conectividad" },
  { value: "almacenamiento", label: "Almacenamiento" },
  { value: "audio", label: "Audio" },
  { value: "mobiliario", label: "Mobiliario" },
  { value: "video", label: "Video" },
  { value: "redes", label: "Redes" },
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

const badgeCellClassName = "inline-flex h-7 min-w-24 justify-center rounded-full px-3 text-center text-xs font-semibold";

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
  if (!form.status) {
    errors.status = "El estado es requerido";
  }
  
  return errors;
};

function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [loading] = useState(false);
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

  const filteredProducts = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    const matches = products.filter((item) => {
      const bySearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.supplier.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term);

      const byStatus = statusFilter === "all" || item.status === statusFilter;
      const byCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter;

      return bySearch && byStatus && byCategory;
    });

    return [...matches].sort((first, second) => {
      switch (sortBy) {
        case "name-desc":
          return second.name.localeCompare(first.name, "es", { sensitivity: "base" });
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
          return first.name.localeCompare(second.name, "es", { sensitivity: "base" });
      }
    });
  }, [products, searchText, statusFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [currentPage, filteredProducts]);

  const topCount = products.filter((item) => item.status === "top").length;
  const stableCount = products.filter((item) => item.status === "stable").length;
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

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setExpandedRowId((prev) => (prev === deleteTarget.id ? null : prev));
    setDeleteTarget(null);
    toast.success("Producto eliminado correctamente");
  };

  const openEditModal = (product) => {
    setEditForm({
      ...product,
      stock: String(product.stock),
      price: String(product.price),
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = (event) => {
    event.preventDefault();
    const errors = validateProductForm(createForm);
    setCreateErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      id: `PRD-${String(Date.now()).slice(-6)}`,
      name: createForm.name.trim(),
      category: createForm.category.trim() || "General",
      stock: Number(createForm.stock) || 0,
      price: Number(createForm.price) || 0,
      status: createForm.status,
      sku: createForm.sku.trim() || "N/A",
      supplier: createForm.supplier.trim() || "N/A",
    };

    setProducts((prev) => [payload, ...prev]);
    setCreateForm(emptyProductForm);
    setCreateErrors({});
    setIsCreateOpen(false);
    toast.success("Producto creado correctamente");
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const errors = validateProductForm(editForm);
    setEditErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editForm.id
          ? {
              ...item,
              name: editForm.name.trim(),
              category: editForm.category.trim() || "General",
              stock: Number(editForm.stock) || 0,
              price: Number(editForm.price) || 0,
              status: editForm.status,
              sku: editForm.sku.trim() || "N/A",
              supplier: editForm.supplier.trim() || "N/A",
            }
          : item,
      ),
    );

    setIsEditOpen(false);
    setEditErrors({});
    toast.success("Producto actualizado correctamente");
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
              placeholder="Buscar por nombre, categoria, proveedor, SKU o ID..."
              className="h-10 rounded-full border-0 bg-transparent text-white placeholder:text-white/35"
              aria-label="Buscar productos"
            />
          </InputGroup>

          <Combobox
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            options={categoryFilterOptions}
            placeholder="Filtrar por categoria"
            searchPlaceholder="Buscar categoria..."
            icon={<Box className="h-4 w-4" />}
          />

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
            searchPlaceholder="Buscar orden..."
            icon={<ArrowUpDown className="h-4 w-4" />}
          />

          <Button
            variant="outline"
            className="h-10 rounded-full border-[#822727]/70 bg-transparent px-4 text-sm font-semibold text-white hover:bg-[#822727]/15 hover:text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-2">
          {[
            { key: "all", label: "Todos", count: products.length },
            { key: "top", label: "Top", count: topCount },
            { key: "stable", label: "Estables", count: stableCount },
            { key: "low", label: "Stock bajo", count: lowCount },
          ].map((item) => {
            const isActive = statusFilter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-1 text-sm font-semibold transition-colors ${
                  isActive ? "border-[#822727] text-white" : "border-transparent text-white/55 hover:text-white"
                }`}
                onClick={() => setStatusFilter(item.key)}
              >
                {item.label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-[#822727] text-white" : "bg-white/10 text-white/75"}`}>
                  {item.count}
                </span>
              </button>
            );
          })}

          <div className="ml-auto text-xs text-white/45">{filteredProducts.length} resultados</div>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-3 text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setSortBy("name-asc");
              }}
            >
              Limpiar
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="min-h-0 flex-1 border-white/10 bg-[#111111]/90 text-white shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col pt-3">
          <div className="scrollbar-invisible min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#151515]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#151515]">
                <TableRow className="border-white/10 bg-[#151515] hover:bg-[#151515]">
                  <TableHead className="w-12 text-white/45">
                    <Checkbox aria-label="Seleccionar todos" />
                  </TableHead>
                  <TableHead className="text-white/45">ID No.</TableHead>
                  <TableHead className="text-white/45">Producto</TableHead>
                  <TableHead className="text-white/45">Categoria</TableHead>
                  <TableHead className="text-white/45">Proveedor</TableHead>
                  <TableHead className="text-white/45">Precio</TableHead>
                  <TableHead className="text-white/45">Estado</TableHead>
                  <TableHead className="w-32 text-right text-white/45">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 6 }, (_, index) => (
                      <TableRow key={`loading-row-${index}`} className="border-white/10">
                        <TableCell><Skeleton className="h-4 w-4 rounded-sm bg-white/10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 bg-white/10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 bg-white/10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 bg-white/10" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full bg-white/10" /></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                            <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                            <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && paginatedProducts.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={8} className="py-8 text-center text-white/55">
                      No hay productos para mostrar.
                    </TableCell>
                  </TableRow>
                ) : null}

                {paginatedProducts.map((item, index) => {
                  const cardinalId = (currentPage - 1) * rowsPerPage + index + 1;

                  return (
                    <Fragment key={`${item.id}-group`}>
                      <TableRow className={`border-white/10 hover:bg-white/4 ${expandedRowId === item.id ? "bg-white/4" : ""}`}>
                        <TableCell>
                          <Checkbox aria-label={`Seleccionar ${item.name}`} />
                        </TableCell>
                        <TableCell className="text-white/65">{cardinalId}</TableCell>
                        <TableCell className="font-medium text-white">
                          <span className="inline-flex items-center gap-2">
                            <Box className="h-4 w-4 text-[#822727]" />
                            {item.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/65">{item.category}</TableCell>
                        <TableCell className="text-white/65">{item.supplier}</TableCell>
                        <TableCell className="text-white/65">{formatPrice(item.price)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${badgeCellClassName} ${item.status === "top" ? "border-white/30 bg-white text-black" : "border-white/15 bg-transparent text-white/75"}`}
                          >
                            {statusLabelMap[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-32 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-md border border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                              onClick={() => toggleExpandRow(item.id)}
                            >
                              {expandedRowId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-md border border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                              onClick={() => openEditModal(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-md border border-[#822727]/35 bg-[#822727]/10 text-[#ff8f8f] hover:bg-[#822727]/20 hover:text-[#ffb6b6]"
                              onClick={() => requestDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedRowId === item.id ? (
                        <TableRow className="border-white/10 bg-white/4">
                          <TableCell colSpan={8}>
                            <div className="grid gap-2 sm:grid-cols-3">
                              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                <p className="text-[11px] uppercase tracking-wider text-white/40">ID</p>
                                <p className="mt-1 text-sm text-white">{cardinalId}</p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                <p className="text-[11px] uppercase tracking-wider text-white/40">SKU</p>
                                <p className="mt-1 text-sm text-white">{item.sku || "N/A"}</p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                <p className="text-[11px] uppercase tracking-wider text-white/40">Stock</p>
                                <p className="mt-1 text-sm text-white">{item.stock}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
            <p className="text-xs text-white/55">
              {filteredProducts.length === 0
                ? "Mostrando 0 de 0"
                : `Mostrando ${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredProducts.length)} de ${filteredProducts.length}`}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full border-white/15 bg-transparent px-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  key={page}
                  type="button"
                  variant="outline"
                  className={`h-9 min-w-9 rounded-full border px-3 text-sm ${
                    currentPage === page
                      ? "border-[#822727] bg-[#822727] text-white hover:bg-[#9b2f2f]"
                      : "border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full border-white/15 bg-transparent px-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border border-white/10 bg-[#161616] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
            <DialogDescription className="text-white/55">Ejemplo local sin API: crea un producto de prueba en memoria.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="create-name">Nombre</Label>
                <Input
                  id="create-name"
                  className="h-11"
                  autoComplete="off"
                  value={createForm.name}
                  onChange={(event) => {
                    setCreateForm((prev) => ({ ...prev, name: event.target.value }));
                    if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Ej. Laptop X14"
                  aria-invalid={!!createErrors.name}
                />
                {createErrors.name && <p className="text-xs text-red-500">{createErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-category">Categoria</Label>
                <Input
                  id="create-category"
                  className="h-11"
                  autoComplete="off"
                  value={createForm.category}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, category: event.target.value }))}
                  placeholder="Ej. Tecnologia"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-stock">Stock</Label>
                <Input
                  id="create-stock"
                  className="h-11"
                  type="number"
                  min="0"
                  value={createForm.stock}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, stock: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
                    setCreateForm((prev) => ({ ...prev, price: event.target.value }));
                    if (createErrors.price) setCreateErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  placeholder="0.00"
                  aria-invalid={!!createErrors.price}
                />
                {createErrors.price && <p className="text-xs text-red-500">{createErrors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-status">Estado</Label>
                <Select 
                  value={createForm.status} 
                  onValueChange={(value) => {
                    setCreateForm((prev) => ({ ...prev, status: value }));
                    if (createErrors.status) setCreateErrors((prev) => ({ ...prev, status: "" }));
                  }}
                >
                  <SelectTrigger 
                    id="create-status" 
                    size="lg"
                    style={{ height: "44px", paddingTop: "10px", paddingBottom: "10px" }}
                    className="rounded-lg border-white/10 bg-black/20 text-white"
                    aria-invalid={!!createErrors.status}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#161616]">
                    <SelectItem value="top" className="text-white cursor-pointer hover:bg-white/10">Top</SelectItem>
                    <SelectItem value="stable" className="text-white cursor-pointer hover:bg-white/10">Estable</SelectItem>
                    <SelectItem value="low" className="text-white cursor-pointer hover:bg-white/10">Bajo</SelectItem>
                  </SelectContent>
                </Select>
                {createErrors.status && <p className="text-xs text-red-500">{createErrors.status}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-sku">SKU</Label>
                <Input
                  id="create-sku"
                  className="h-11"
                  autoComplete="off"
                  value={createForm.sku}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, sku: event.target.value }))}
                  placeholder="SKU-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-supplier">Proveedor</Label>
                <Input
                  id="create-supplier"
                  className="h-11"
                  autoComplete="off"
                  value={createForm.supplier}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, supplier: event.target.value }))}
                  placeholder="Proveedor"
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-11 px-5 text-black" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" className="h-11 bg-[#822727] px-5 text-base hover:bg-[#9b2f2f]">Guardar producto</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border border-white/10 bg-[#161616] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription className="text-white/55">Ejemplo local sin API: edita y guarda cambios en memoria.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  className="h-11"
                  autoComplete="off"
                  value={editForm.name}
                  onChange={(event) => {
                    setEditForm((prev) => ({ ...prev, name: event.target.value }));
                    if (editErrors.name) setEditErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  aria-invalid={!!editErrors.name}
                />
                {editErrors.name && <p className="text-xs text-red-500">{editErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-category">Categoria</Label>
                <Input
                  id="edit-category"
                  className="h-11"
                  autoComplete="off"
                  value={editForm.category}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  className="h-11"
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, stock: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
                    setEditForm((prev) => ({ ...prev, price: event.target.value }));
                    if (editErrors.price) setEditErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  aria-invalid={!!editErrors.price}
                />
                {editErrors.price && <p className="text-xs text-red-500">{editErrors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-status">Estado</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(value) => {
                    setEditForm((prev) => ({ ...prev, status: value }));
                    if (editErrors.status) setEditErrors((prev) => ({ ...prev, status: "" }));
                  }}
                >
                  <SelectTrigger 
                    id="edit-status" 
                    size="lg"
                    style={{ height: "44px", paddingTop: "10px", paddingBottom: "10px" }}
                    className="rounded-lg border-white/10 bg-black/20 text-white"
                    aria-invalid={!!editErrors.status}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#161616]">
                    <SelectItem value="top" className="text-white cursor-pointer hover:bg-white/10">Top</SelectItem>
                    <SelectItem value="stable" className="text-white cursor-pointer hover:bg-white/10">Estable</SelectItem>
                    <SelectItem value="low" className="text-white cursor-pointer hover:bg-white/10">Bajo</SelectItem>
                  </SelectContent>
                </Select>
                {editErrors.status && <p className="text-xs text-red-500">{editErrors.status}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  className="h-11"
                  value={editForm.sku}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, sku: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-supplier">Proveedor</Label>
                <Input
                  id="edit-supplier"
                  className="h-11"
                  value={editForm.supplier}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, supplier: event.target.value }))}
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-11 px-5" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button type="submit" className="h-11 bg-[#822727] px-5 text-base hover:bg-[#9b2f2f]">Guardar cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <AlertDialogContent className="border border-white/10 bg-[#161616] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminacion</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              {`Estas seguro de eliminar ${deleteTarget?.name ?? "este producto"}? Esta accion no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-transparent border-t-0">
            <AlertDialogCancel variant="outline" className="text-black hover:text-black">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-[#822727] hover:bg-[#9b2f2f]" onClick={confirmDelete}>
              Si, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Products;
