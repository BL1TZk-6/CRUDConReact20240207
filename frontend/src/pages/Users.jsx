import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, CalendarRange, ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import PasswordCriteria from "@/components/ui/password-criteria";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useUserData from "@/components/users/hooks/useUserData";
import { isStrongPassword } from "@/lib/password-policy";
import { useAuth } from "@/hooks/useAuth";

const emptyUserForm = {
  name: "",
  lastName: "",
  email: "",
  birthDate: "",
  password: "",
  userType: "usuario",
  isVerified: false,
};

const userTypeOptions = [
  { value: "admin", label: "Admin" },
  { value: "supervisor", label: "Supervisor" },
  { value: "vendedor", label: "Vendedor" },
  { value: "usuario", label: "Usuario" },
];

const badgeCellClassName = "inline-flex h-7 min-w-24 justify-center rounded-full px-3 text-center text-xs font-semibold";

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateUserForm = (form, isEdit = false) => {
  const errors = {};
  
  if (!form.name.trim()) {
    errors.name = "El nombre es requerido";
  }
  if (!form.lastName.trim()) {
    errors.lastName = "El apellido es requerido";
  }
  if (!form.email.trim()) {
    errors.email = "El correo es requerido";
  } else if (!validateEmail(form.email)) {
    errors.email = "El correo debe ser válido";
  }
  if (!form.birthDate) {
    errors.birthDate = "La fecha de nacimiento es requerida";
  }
  if (!isEdit && !form.password) {
    errors.password = "La contraseña es requerida";
  } else if (!isEdit && form.password && !isStrongPassword(form.password)) {
    errors.password = "Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo";
  }
  if (!form.userType) {
    errors.userType = "El tipo de usuario es requerido";
  }
  
  return errors;
};

const dateFilterOptions = [
  { value: "all", label: "Todos los cumpleaños" },
  { value: "current-month", label: "Este mes" },
  { value: "next-30-days", label: "Próximos 30 días" },
];

const verificationFilterOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "verified", label: "Verificados" },
  { value: "pending", label: "Pendientes" },
];

const sortOptions = [
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "verified-first", label: "Verificados primero" },
  { value: "date-desc", label: "Cumpleaños más próximos" },
  { value: "date-asc", label: "Cumpleaños más lejanos" },
];

const getNextBirthdayDistance = (birthDateValue) => {
  if (!birthDateValue) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  const birthDate = new Date(birthDateValue);

  if (Number.isNaN(birthDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  nextBirthday.setHours(0, 0, 0, 0);

  const normalizedToday = new Date(today);
  normalizedToday.setHours(0, 0, 0, 0);

  if (nextBirthday < normalizedToday) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }

  return Math.round((nextBirthday - normalizedToday) / 86400000);
};

function Users() {
  const { user: authUser } = useAuth();
  const {
    users,
    loading,
    errorUser,
    handleaSubmit,
    deleteUser,
    handleUpdateSubmit,
  } = useUserData();
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createForm, setCreateForm] = useState(emptyUserForm);
  const [editForm, setEditForm] = useState({ ...emptyUserForm, id: "" });
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  const rowsPerPage = 10;
  // ocultamos al usuario autenticado para evitar que se edite/elimine desde este módulo
  const visibleUsers = useMemo(
    () => users.filter((candidate) => candidate.id !== authUser?.id),
    [users, authUser?.id],
  );

  const filteredUsers = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    const matches = visibleUsers.filter((user) => {
      const fullName = `${user.name} ${user.lastName}`.toLowerCase();
      const bySearch =
        !term ||
        fullName.includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term);

      const byVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && user.isVerified === true) ||
        (verificationFilter === "pending" && user.isVerified === false);

      const daysUntilBirthday = getNextBirthdayDistance(user.birthDate);
      const byDateFilter =
        dateFilter === "all" ||
        (dateFilter === "current-month" && user.birthDate && new Date(user.birthDate).getMonth() === new Date().getMonth()) ||
        (dateFilter === "next-30-days" && daysUntilBirthday <= 30);

      return bySearch && byVerification && byDateFilter;
    });

    return [...matches].sort((firstUser, secondUser) => {
      switch (sortBy) {
        case "name-desc":
          return `${secondUser.name} ${secondUser.lastName}`.localeCompare(`${firstUser.name} ${firstUser.lastName}`, "es", { sensitivity: "base" });
        case "date-desc":
          return new Date(secondUser.birthDate || 0) - new Date(firstUser.birthDate || 0);
        case "date-asc":
          return new Date(firstUser.birthDate || 0) - new Date(secondUser.birthDate || 0);
        case "verified-first":
          return Number(secondUser.isVerified) - Number(firstUser.isVerified) || `${firstUser.name} ${firstUser.lastName}`.localeCompare(`${secondUser.name} ${secondUser.lastName}`, "es", { sensitivity: "base" });
        case "name-asc":
        default:
          return `${firstUser.name} ${firstUser.lastName}`.localeCompare(`${secondUser.name} ${secondUser.lastName}`, "es", { sensitivity: "base" });
      }
    });
  }, [dateFilter, visibleUsers, searchText, sortBy, verificationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [currentPage, filteredUsers]);

  const verifiedCount = visibleUsers.filter((user) => user.isVerified === true).length;
  const pendingCount = visibleUsers.filter((user) => user.isVerified === false).length;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setExpandedRowId(null);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, searchText, verificationFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const hasActiveFilters = dateFilter !== "all" || verificationFilter !== "all" || searchText.trim() || sortBy !== "name-asc";

  const toggleExpandRow = (rowId) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  const requestDelete = (user) => {
    setDeleteTarget(user);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    deleteUser(deleteTarget.id);
    setExpandedRowId((prev) => (prev === deleteTarget.id ? null : prev));
    setDeleteTarget(null);
  };

  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType || "usuario",
      birthDate: user.birthDate,
      isVerified: user.isVerified,
      password: "",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    const errors = validateUserForm(createForm);
    setCreateErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const created = await handleaSubmit(createForm);
    if (created) {
      setCreateForm(emptyUserForm);
      setCreateErrors({});
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const errors = validateUserForm(editForm, true);
    setEditErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const updated = await handleUpdateSubmit(editForm, editForm.id);
    if (updated) {
      setEditErrors({});
      setIsEditOpen(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 pb-3">
      <div className="space-y-3 rounded-[28px] border border-white/8 bg-black/20 px-4 py-4 shadow-[0_16px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mt-1 text-sm text-white/45"></p>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_230px_230px_250px_auto]">
          <InputGroup className="h-10 rounded-full border-white/15 bg-black/25 text-white shadow-none">
            <InputGroupAddon className="pl-4 text-white/35">
              <Search className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Buscar usuario, correo o ID..."
              className="h-10 rounded-full border-0 bg-transparent text-white placeholder:text-white/35"
              aria-label="Buscar usuarios"
            />
          </InputGroup>

          <Combobox
            value={dateFilter}
            onValueChange={setDateFilter}
            options={dateFilterOptions}
            placeholder="Filtrar por fecha"
            searchPlaceholder="Buscar filtro de fecha..."
            icon={<CalendarRange className="h-4 w-4" />}
          />

          <Combobox
            value={verificationFilter}
            onValueChange={setVerificationFilter}
            options={verificationFilterOptions}
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
            Nuevo usuario
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-2">
          {[
            { key: "all", label: "Todos los usuarios", count: visibleUsers.length },
            { key: "verified", label: "Verificados", count: verifiedCount },
            { key: "pending", label: "Pendientes", count: pendingCount },
          ].map((item) => {
            const isActive = verificationFilter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-1 text-sm font-semibold transition-colors ${isActive
                    ? "border-[#822727] text-white"
                    : "border-transparent text-white/55 hover:text-white"
                  }`}
                onClick={() => setVerificationFilter(item.key)}
              >
                {item.label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-[#822727] text-white" : "bg-white/10 text-white/75"}`}>{item.count}</span>
              </button>
            );
          })}

          <div className="ml-auto text-xs text-white/45">
            {filteredUsers.length} resultados
          </div>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-full px-3 text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => {
                setSearchText("");
                  setDateFilter("all");
                setVerificationFilter("all");
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
          {errorUser ? (
            <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorUser}
            </div>
          ) : null}

          <div className="scrollbar-invisible min-h-0 flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#151515]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#151515]">
                <TableRow className="border-white/10 bg-[#151515] hover:bg-[#151515]">
                  <TableHead className="w-12 text-white/45">
                    <Checkbox aria-label="Seleccionar todos" />
                  </TableHead>
                  <TableHead className="text-white/45">ID No.</TableHead>
                  <TableHead className="text-white/45">Nombre</TableHead>
                  <TableHead className="text-white/45">Usuario</TableHead>
                  <TableHead className="text-white/45">Correo</TableHead>
                  <TableHead className="text-white/45">Estado</TableHead>
                  <TableHead className="text-white/45">Tipo</TableHead>
                  <TableHead className="w-32 text-right text-white/45">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }, (_, index) => (
                    <TableRow key={`loading-row-${index}`} className="border-white/10">
                      <TableCell><Skeleton className="h-4 w-4 rounded-sm bg-white/10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 bg-white/10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 bg-white/10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40 bg-white/10" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full bg-white/10" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full bg-white/10" /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                          <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                          <Skeleton className="h-8 w-8 rounded-md bg-white/10" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}

                {!loading && paginatedUsers.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={8} className="py-8 text-center text-white/55">
                      No hay usuarios para mostrar.
                    </TableCell>
                  </TableRow>
                ) : null}

                {paginatedUsers.map((user, index) => {
                  const cardinalId = (currentPage - 1) * rowsPerPage + index + 1;

                  return (
                  <Fragment key={`${user.id}-group`}>
                    <TableRow className={`border-white/10 hover:bg-white/4 ${expandedRowId === user.id ? "bg-white/4" : ""}`}>
                      <TableCell>
                        <Checkbox aria-label={`Seleccionar ${user.name}`} />
                      </TableCell>
                      <TableCell className="text-white/65">{cardinalId}</TableCell>
                      <TableCell className="font-medium text-white">{`${user.name} ${user.lastName}`.trim()}</TableCell>
                      <TableCell className="text-white/65">{user.email.split("@")[0] || user.email}</TableCell>
                      <TableCell className="text-white/65">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${badgeCellClassName} ${user.isVerified ? "border-white/30 bg-white text-black" : "border-white/15 bg-transparent text-white/75"}`}
                        >
                          {user.isVerified ? "Activo" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${badgeCellClassName} ${user.userType === "admin" ? "border-[#822727] bg-[#822727] text-white" : "border-white/15 bg-transparent text-white/80"}`}
                        >
                          {userTypeOptions.find((option) => option.value === user.userType)?.label || "Usuario"}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-32 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-md border border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={() => toggleExpandRow(user.id)}
                          >
                            {expandedRowId === user.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-md border border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-md border border-[#822727]/35 bg-[#822727]/10 text-[#ff8f8f] hover:bg-[#822727]/20 hover:text-[#ffb6b6]"
                            onClick={() => requestDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRowId === user.id ? (
                      <TableRow className="border-white/10 bg-white/4">
                        <TableCell colSpan={8}>
                          <div className="grid gap-2 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wider text-white/40">ID</p>
                              <p className="mt-1 text-sm text-white">{cardinalId}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wider text-white/40">Nacimiento</p>
                              <p className="mt-1 text-sm text-white">{user.birthDate || "N/A"}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                              <p className="text-[11px] uppercase tracking-wider text-white/40">Estado</p>
                              <p className="mt-1 text-sm text-white">{user.isVerified ? "Verificado" : "Pendiente"}</p>
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
              {filteredUsers.length === 0
                ? "Mostrando 0 de 0"
                : `Mostrando ${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredUsers.length)} de ${filteredUsers.length}`}
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
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription className="text-white/55">Completa el formulario y confirma para agregar el usuario al directorio.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <Alert className="border-[#822727]/40 bg-[#822727]/10 text-white">
              <AlertTitle className="text-sm">Requisitos de seguridad</AlertTitle>
              <AlertDescription className="text-white/70">
                La contraseña debe tener mínimo 8 caracteres con mayúscula, minúscula, número y símbolo.
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
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
                  placeholder="Ej. Carlos"
                  aria-invalid={!!createErrors.name}
                />
                {createErrors.name && <p className="text-xs text-red-500">{createErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-last-name">Apellido</Label>
                <Input 
                  id="create-last-name" 
                  className="h-11" 
                  autoComplete="off" 
                  value={createForm.lastName} 
                  onChange={(event) => {
                    setCreateForm((prev) => ({ ...prev, lastName: event.target.value }));
                    if (createErrors.lastName) setCreateErrors((prev) => ({ ...prev, lastName: "" }));
                  }}
                  placeholder="Ej. Pérez"
                  aria-invalid={!!createErrors.lastName}
                />
                {createErrors.lastName && <p className="text-xs text-red-500">{createErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email">Email</Label>
              <Input 
                id="create-email" 
                className="h-11" 
                type="email" 
                autoComplete="off" 
                value={createForm.email} 
                onChange={(event) => {
                  setCreateForm((prev) => ({ ...prev, email: event.target.value }));
                  if (createErrors.email) setCreateErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="correo@dominio.com"
                aria-invalid={!!createErrors.email}
              />
              {createErrors.email && <p className="text-xs text-red-500">{createErrors.email}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-birth-date">Fecha de nacimiento</Label>
                <Input 
                  id="create-birth-date" 
                  className="h-11" 
                  type="date" 
                  value={createForm.birthDate} 
                  onChange={(event) => {
                    setCreateForm((prev) => ({ ...prev, birthDate: event.target.value }));
                    if (createErrors.birthDate) setCreateErrors((prev) => ({ ...prev, birthDate: "" }));
                  }}
                  aria-invalid={!!createErrors.birthDate}
                />
                {createErrors.birthDate && <p className="text-xs text-red-500">{createErrors.birthDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-password">Contraseña</Label>
                <Input 
                  id="create-password" 
                  className="h-11" 
                  type="password" 
                  autoComplete="off" 
                  value={createForm.password} 
                  onChange={(event) => {
                    setCreateForm((prev) => ({ ...prev, password: event.target.value }));
                    if (createErrors.password) setCreateErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Mínimo 8 caracteres"
                  aria-invalid={!!createErrors.password}
                />
                <PasswordCriteria password={createForm.password} className="mt-2" />
                {createErrors.password && <p className="text-xs text-red-500">{createErrors.password}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-user-type">Tipo de usuario</Label>
              <Select 
                value={createForm.userType} 
                onValueChange={(value) => {
                  setCreateForm((prev) => ({ ...prev, userType: value }));
                  if (createErrors.userType) setCreateErrors((prev) => ({ ...prev, userType: "" }));
                }}
              >
                <SelectTrigger 
                  id="create-user-type" 
                  size="lg"
                  style={{ height: "44px", paddingTop: "10px", paddingBottom: "10px" }}
                  className="rounded-lg border-white/10 bg-black/20 text-white"
                  aria-invalid={!!createErrors.userType}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#161616]">
                  {userTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white cursor-pointer hover:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createErrors.userType && <p className="text-xs text-red-500">{createErrors.userType}</p>}
              <Label htmlFor="create-verification-status">Estado de verificación</Label>
              <Input
                id="create-verification-status"
                disabled
                value="Pendiente hasta verificación por OTP"
                className="h-11 border-white/10 bg-black/20 text-white/70"
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-11 px-5 text-black" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-11 bg-[#822727] px-5 text-base hover:bg-[#9b2f2f]">
                {loading ? "Guardando..." : "Guardar usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border border-white/10 bg-[#161616] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription className="text-white/55">Actualiza la información del usuario y guarda para aplicar cambios.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <Alert className="border-white/15 bg-black/20 text-white">
              <AlertTitle className="text-sm">Edición segura</AlertTitle>
              <AlertDescription className="text-white/70">
                Revisa email y fecha antes de guardar para evitar inconsistencias en el perfil.
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
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
                  placeholder="Nombre completo"
                  aria-invalid={!!editErrors.name}
                />
                {editErrors.name && <p className="text-xs text-red-500">{editErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-last-name">Apellido</Label>
                <Input 
                  id="edit-last-name" 
                  className="h-11" 
                  autoComplete="off" 
                  value={editForm.lastName} 
                  onChange={(event) => {
                    setEditForm((prev) => ({ ...prev, lastName: event.target.value }));
                    if (editErrors.lastName) setEditErrors((prev) => ({ ...prev, lastName: "" }));
                  }}
                  placeholder="Apellido"
                  aria-invalid={!!editErrors.lastName}
                />
                {editErrors.lastName && <p className="text-xs text-red-500">{editErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                className="h-11" 
                type="email" 
                autoComplete="off" 
                value={editForm.email} 
                onChange={(event) => {
                  setEditForm((prev) => ({ ...prev, email: event.target.value }));
                  if (editErrors.email) setEditErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="correo@dominio.com"
                aria-invalid={!!editErrors.email}
              />
              {editErrors.email && <p className="text-xs text-red-500">{editErrors.email}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-birth-date">Fecha de nacimiento</Label>
                <Input 
                  id="edit-birth-date" 
                  className="h-11" 
                  type="date" 
                  value={editForm.birthDate || ""} 
                  onChange={(event) => {
                    setEditForm((prev) => ({ ...prev, birthDate: event.target.value }));
                    if (editErrors.birthDate) setEditErrors((prev) => ({ ...prev, birthDate: "" }));
                  }}
                  aria-invalid={!!editErrors.birthDate}
                />
                {editErrors.birthDate && <p className="text-xs text-red-500">{editErrors.birthDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-user-type">Tipo de usuario</Label>
                <Select
                  value={editForm.userType || "usuario"} 
                  onValueChange={(value) => {
                    setEditForm((prev) => ({ ...prev, userType: value }));
                    if (editErrors.userType) setEditErrors((prev) => ({ ...prev, userType: "" }));
                  }}
                >
                  <SelectTrigger 
                    id="edit-user-type" 
                    size="lg"
                    style={{ height: "44px", paddingTop: "10px", paddingBottom: "10px" }}
                    className="rounded-lg border-white/10 bg-black/20 text-white"
                    aria-invalid={!!editErrors.userType}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#161616]">
                    {userTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white cursor-pointer hover:bg-white/10">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editErrors.userType && <p className="text-xs text-red-500">{editErrors.userType}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-verification-status">Estado de verificación</Label>
                <Input
                  id="edit-verification-status"
                  disabled
                  value={editForm.isVerified ? "Verificado por OTP" : "Pendiente de verificación"}
                  className="h-11 border-white/10 bg-black/20 text-white/70"
                />
              </div>
            </div>

            {editForm.isVerified ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                Este usuario ya fue verificado. El administrador solo puede visualizar este estado.
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/60">
                Este usuario aún no se ha verificado y el estado no puede modificarse manualmente desde este panel.
              </div>
            )}

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-11 px-5 text-black" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-11 bg-[#822727] px-5 text-base hover:bg-[#9b2f2f]">
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <AlertDialogContent className="border border-white/10 bg-[#161616] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              {`¿Estás seguro de eliminar ${deleteTarget?.name ?? "este usuario"}? Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-transparent border-t-0">
            <AlertDialogCancel variant="outline" className="text-black hover:text-black">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-[#822727] hover:bg-[#9b2f2f]" onClick={confirmDelete}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Users;
