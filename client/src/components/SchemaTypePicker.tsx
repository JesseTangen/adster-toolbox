import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { getSchemaBuilderTypeLabel, type SchemaBuilderType } from "@adster/schema-core";

const schemaTypeOptions: Array<{
  value: SchemaBuilderType;
  description: string;
}> = [
  { value: "", description: "Choose a Schema.org structure" },
  { value: "LocalBusiness", description: "Location and business entity data" },
  { value: "FAQPage", description: "Visible questions and accepted answers" },
];

type SchemaTypePickerProps = {
  value: SchemaBuilderType;
  onValueChange: (value: SchemaBuilderType) => void;
};

export function SchemaTypePicker({ value, onValueChange }: SchemaTypePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = schemaTypeOptions.find(option => option.value === value) ?? schemaTypeOptions[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Schema type"
          aria-expanded={open}
          className="flex h-auto min-h-12 w-full items-center justify-between rounded-xl border border-border/80 bg-white/75 px-3 py-2 text-left shadow-[0_1px_0_rgba(255,255,255,0.7)] outline-none transition hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-[#102b40] dark:shadow-none"
        >
          <span className="min-w-0">
            <span className="block truncate font-mono text-[12px] font-medium text-foreground">{getSchemaBuilderTypeLabel(value)}</span>
            <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{selected?.description}</span>
          </span>
          <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-border/90 p-0 shadow-[0_24px_68px_-28px_oklch(0.25_0.03_55)]">
        <Command>
          <CommandList className="p-1.5">
            <CommandGroup heading="Schema type" className="pb-1">
              {schemaTypeOptions.map(option => (
                <CommandItem
                  key={option.value || "unselected"}
                  value={`${option.value || "Please select"} ${option.description}`}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="min-h-11 rounded-lg px-2.5 py-1.5"
                >
                  <Check className={`h-3.5 w-3.5 text-primary ${value === option.value ? "opacity-100" : "opacity-0"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[11px] font-medium">{getSchemaBuilderTypeLabel(option.value)}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{option.description}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
