// Icons come from Lucide (lucide-react): one name -> one icon, so pages ask for "book" and never import the library directly.
// Icons are decorative: always put the meaning in words next to them (or in an aria-label on the button).
import {
  ArrowDown, ArrowUp, Bell, BookOpen, CalendarDays, ChartColumn, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, CircleAlert, Clock, Compass, Cpu,
  Download, Ellipsis, ExternalLink, FileText, FlaskConical, GraduationCap, House, Inbox, Layers, Library, Link2, List, ListChecks, LogOut, Menu, Monitor, Moon,
  PanelLeftClose, PanelLeftOpen, Pencil, Play, Plus, Printer, RefreshCw, Rss, Search, ShieldCheck, Sparkles, Sun, Target, Trash2, TrendingUp, User, Users, X, type LucideIcon,
} from "lucide-react";

const ICONS = {
  check: Check, clock: Clock, target: Target, layers: Layers, alert: CircleAlert, trend: TrendingUp, chip: Cpu, list: List, home: House, book: BookOpen, tasks: ListChecks,
  spark: Sparkles, chart: ChartColumn, compass: Compass, download: Download, shield: ShieldCheck, user: User, users: Users, link: Link2, file: FileText, rss: Rss, bell: Bell,
  calendar: CalendarDays, inbox: Inbox, menu: Menu, x: X, search: Search, more: Ellipsis, external: ExternalLink, edit: Pencil, trash: Trash2, play: Play, plus: Plus,
  left: ChevronLeft, right: ChevronRight, down: ChevronDown, up: ArrowUp, downArrow: ArrowDown, updown: ChevronsUpDown, logout: LogOut, sun: Sun, moon: Moon, monitor: Monitor,
  panelClose: PanelLeftClose, panelOpen: PanelLeftOpen, library: Library, lab: FlaskConical, grad: GraduationCap, print: Printer, refresh: RefreshCw,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 18, strokeWidth = 2 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const C = ICONS[name];
  return <C size={size} strokeWidth={strokeWidth} fill={name === "play" ? "currentColor" : "none"} aria-hidden="true" focusable="false" />;
}
