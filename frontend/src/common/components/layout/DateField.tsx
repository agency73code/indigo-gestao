"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // se você tiver esse helper; senão remova e use className direto

type Props = {
  /** valor em ISO (yyyy-MM-dd) ou Date. Recomendo ISO no seu estado */
  value?: string | Date | null;
  /** retorna ISO yyyy-MM-dd */
  onChange: (iso: string) => void;
  placeholder?: string;
  error?: string;
  /** restrições opcionais */
  minDate?: Date;
  maxDate?: Date;
  /** desabilitar datas por função (shadcn prop) */
  disabled?: (date: Date) => boolean;
  className?: string;
};

export function DateField({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  error,
  minDate,
  maxDate,
  disabled,
  className,
}: Props) {
  // normaliza value -> Date
  let selected: Date | undefined;
  if (value instanceof Date) selected = value;
  else if (typeof value === "string" && value) {
    // aceita ISO yyyy-MM-dd; se vier dd/MM/yyyy você pode adaptar
    const maybe = parseISO(value);
    selected = isValid(maybe) ? maybe : undefined;
  }

  const [open, setOpen] = React.useState(false);

  const display = selected ? format(selected, "dd/MM/yyyy", { locale: ptBR }) : "";

  return (
    <div className={cn("", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            <CalendarIcon className="mr-4 h-4 w-4" />
            {display || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return;
              // converte para ISO yyyy-MM-dd (sem timezone)
              const iso = format(date, "yyyy-MM-dd");
              onChange(iso);
              setOpen(false);
            }}
            locale={ptBR}
            fromDate={minDate}
            toDate={maxDate}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}