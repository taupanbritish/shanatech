import {
  Cloud,
  Code2,
  Database,
  PenTool,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { ServiceIcon as ServiceIconName } from "@/lib/content";

const icons = {
  code: Code2,
  smartphone: Smartphone,
  "pen-tool": PenTool,
  cloud: Cloud,
  database: Database,
  "shield-check": ShieldCheck,
} satisfies Record<ServiceIconName, typeof Code2>;

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceIconName;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} strokeWidth={1.7} />;
}
