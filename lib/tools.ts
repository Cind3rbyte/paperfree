import { Combine, ImagePlus, Images, LayoutGrid, Minimize2, Scissors, type LucideIcon } from "lucide-react";

export type ToolId = "merge" | "split" | "organize" | "images-to-pdf" | "pdf-to-images" | "compress";

/** Language-independent tool metadata. Titles and descriptions live in the dictionaries. */
export interface ToolDefinition {
  id: ToolId;
  href: `/${ToolId}`;
  icon: LucideIcon;
  /** Tailwind gradient for icon tiles. */
  gradient: string;
  /** Subtle glow on hover. */
  glow: string;
}

export const tools: ToolDefinition[] = [
  { id: "merge", href: "/merge", icon: Combine, gradient: "from-indigo-500 to-violet-500", glow: "group-hover:shadow-indigo-500/20" },
  { id: "split", href: "/split", icon: Scissors, gradient: "from-rose-500 to-pink-500", glow: "group-hover:shadow-rose-500/20" },
  { id: "organize", href: "/organize", icon: LayoutGrid, gradient: "from-amber-500 to-orange-500", glow: "group-hover:shadow-amber-500/20" },
  {
    id: "images-to-pdf",
    href: "/images-to-pdf",
    icon: ImagePlus,
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    id: "pdf-to-images",
    href: "/pdf-to-images",
    icon: Images,
    gradient: "from-sky-500 to-cyan-500",
    glow: "group-hover:shadow-sky-500/20",
  },
  {
    id: "compress",
    href: "/compress",
    icon: Minimize2,
    gradient: "from-fuchsia-500 to-purple-600",
    glow: "group-hover:shadow-fuchsia-500/20",
  },
];

export function getTool(id: ToolId): ToolDefinition {
  const tool = tools.find((entry) => entry.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}
