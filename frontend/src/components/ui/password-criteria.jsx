import { CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPasswordCriteria } from "@/lib/password-policy";

function PasswordCriteria({ password = "", className = "" }) {
  const criteria = getPasswordCriteria(password); // calculamos en tiempo real qué criterios de seguridad cumple la contraseña

  return (
    <Alert className={`border-white/10 bg-black/20 text-white ${className}`.trim()}>
      <AlertTitle className="text-sm font-semibold text-white">
        Clave segura
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-2">
          {criteria.map((criterion) => (
            <li
              key={criterion.key}
              className={`flex items-center gap-2 text-xs ${criterion.valid ? "text-emerald-300" : "text-white/50"}`}
            >
              {/* ícono visual de cumplimiento por criterio */}
              {criterion.valid ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-white/30" />
              )}
              <span>{criterion.label}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export default PasswordCriteria;
