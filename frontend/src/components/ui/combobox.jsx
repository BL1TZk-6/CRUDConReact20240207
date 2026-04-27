import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function Combobox({
  options = [],
  value,
  onValueChange,
  placeholder = "Selecciona una opcion",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  icon,
  className,
  triggerClassName,
  contentClassName,
}) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-full border border-white/15 bg-black/25 px-4 text-sm text-white transition-colors hover:bg-white/10",
          triggerClassName,
          className,
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-2 overflow-hidden">
          {icon ? <span className="text-white/45">{icon}</span> : null}
          <span className="truncate text-left text-white/85">{selectedOption?.label ?? placeholder}</span>
        </span>
        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-white/45" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("border border-white/10 bg-[#151515] p-0 text-white", contentClassName)}
        style={{ width: "var(--anchor-width)" }}
      >
        <Command className="bg-transparent text-white">
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-white placeholder:text-white/35"
          />
          <CommandList>
            <CommandEmpty className="text-white/45">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  className="text-white data-selected:bg-white/10 data-selected:text-white"
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <span>{option.label}</span>
                  <CheckIcon className={cn("ml-auto h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }