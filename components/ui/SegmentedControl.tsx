"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  columns?: 2 | 3 | 4;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  columns = 3,
}: SegmentedControlProps<T>) {
  return (
    <fieldset disabled={disabled} className="space-y-2 disabled:opacity-60">
      <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</legend>
      <div
        className={cn(
          "grid gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-4",
        )}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <label
              key={option.value}
              title={option.hint}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-indigo-500",
                active
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={label}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
              />
              {option.label}
              {option.hint && <span className="mt-0.5 text-[10px] font-normal opacity-70">{option.hint}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
