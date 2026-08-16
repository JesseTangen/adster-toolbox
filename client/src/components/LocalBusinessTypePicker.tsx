import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { findLocalBusinessType, localBusinessTypeGroups } from "../../../shared/localbusiness-types";

type LocalBusinessTypePickerProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function LocalBusinessTypePicker({ value, onValueChange }: LocalBusinessTypePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = findLocalBusinessType(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex h-auto min-h-12 w-full items-center justify-between rounded-xl border border-border/80 bg-white/75 px-3 py-2 text-left shadow-[0_1px_0_rgba(255,255,255,0.7)] outline-none transition hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15"
        >
          <span className="min-w-0">
            <span className="block truncate font-mono text-[12px] font-medium text-foreground">{selected?.value || value}</span>
            <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{selected?.category || "Schema.org LocalBusiness type"}</span>
          </span>
          <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-border/90 p-0 shadow-[0_24px_68px_-28px_oklch(0.25_0.03_55)]">
        <Command>
          <CommandInput placeholder="Search Schema.org type or business…" className="text-[13px]" />
          <CommandList className="max-h-[22rem] p-1.5">
            <CommandEmpty className="py-8 text-[12px] text-muted-foreground">No LocalBusiness type found.</CommandEmpty>
            {localBusinessTypeGroups.map(group => (
              <CommandGroup key={group.category} heading={group.category} className="pb-2">
                {group.types.map(type => (
                  <CommandItem
                    key={type.value}
                    value={`${type.value} ${group.category}`}
                    onSelect={() => {
                      onValueChange(type.value);
                      setOpen(false);
                    }}
                    className="min-h-9 rounded-lg px-2.5 py-1.5"
                  >
                    <Check className={`h-3.5 w-3.5 text-primary ${value === type.value ? "opacity-100" : "opacity-0"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="font-mono text-[11px] font-medium">{type.value}</span>
                      {type.deprecated ? <span className="ml-2 rounded-full bg-[#f4e7c7] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.08em] text-[#886414]">Deprecated</span> : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
