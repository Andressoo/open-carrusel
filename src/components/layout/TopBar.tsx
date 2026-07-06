"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Layers,
  Bot,
  Calendar,
  Wand2,
  Search,
  Upload,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSwitcher } from "@/components/layout/ProjectSwitcher";
import { COPY } from "@/lib/copy";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  editable?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onSettingsClick?: () => void;
}

export function TopBar({
  title,
  showBack,
  editable,
  onTitleChange,
  onSettingsClick,
}: TopBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setEditValue(title || "");
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange?.(trimmed);
    } else {
      setEditValue(title || "");
    }
    setIsEditing(false);
  };

  const triggerPalette = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: navigator.platform.includes("Mac"),
        ctrlKey: !navigator.platform.includes("Mac"),
        bubbles: true,
      })
    );
  };

  return (
    <header className="h-13 min-h-[52px] border-b border-border bg-surface/80 backdrop-blur-md flex items-center px-4 gap-3 shrink-0 sticky top-0 z-40">
      {showBack && (
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      )}

      {/* Brand mark */}
      <Link href="/" className="flex items-center gap-2 min-w-0 group">
        <div className="w-7 h-7 rounded-md bg-accent grid place-items-center text-accent-foreground font-black text-sm group-hover:scale-105 transition-transform">
          S
        </div>
        {isEditing && editable ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setEditValue(title || "");
                setIsEditing(false);
              }
            }}
            className="font-semibold text-sm bg-transparent border-b-2 border-accent outline-none py-0.5 min-w-[120px]"
          />
        ) : title ? (
          <span
            className={`font-semibold text-sm truncate ${editable ? "cursor-pointer hover:text-accent transition-colors" : ""}`}
            onClick={() => editable && startEditing()}
            title={editable ? "Click para renombrar" : undefined}
          >
            {title}
          </span>
        ) : (
          <span className="font-semibold text-sm hidden sm:inline">Storu</span>
        )}
      </Link>

      {!showBack && (
        <>
          <div className="ml-1 hidden md:block">
            <ProjectSwitcher />
          </div>
          <NavTabs />
        </>
      )}

      <div className="flex-1" />

      {/* Cmd+K trigger (visible) */}
      {!showBack && (
        <button
          onClick={triggerPalette}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background/40 hover:bg-background hover:border-accent/40 transition-colors text-xs text-muted-foreground"
          title="Buscar acciones · navegar · crear"
        >
          <Search className="h-3.5 w-3.5" />
          <span>{COPY.palette.placeholder.split("·")[0].trim()}…</span>
          <kbd className="text-[10px] font-mono bg-muted/60 px-1.5 py-0.5 rounded ml-2">
            ⌘K
          </kbd>
        </button>
      )}

      {onSettingsClick && (
        <Button variant="ghost" size="icon" onClick={onSettingsClick} aria-label="Ajustes">
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </header>
  );
}

function NavTabs() {
  const pathname = usePathname() || "/";
  const tabs = [
    {
      href: "/",
      label: COPY.nav.home,
      icon: <Layers className="h-3.5 w-3.5" />,
      match: (p: string) => p === "/" || p.startsWith("/set") || p.startsWith("/carousel"),
    },
    {
      href: "/brief/new",
      label: COPY.nav.brief,
      icon: <Bot className="h-3.5 w-3.5" />,
      match: (p: string) => p.startsWith("/brief") || p.startsWith("/agent") || p.startsWith("/generate"),
    },
    {
      href: "/chat",
      label: "Chat",
      icon: <MessageSquare className="h-3.5 w-3.5" />,
      match: (p: string) => p.startsWith("/chat"),
    },
    {
      href: "/calendar",
      label: COPY.nav.calendar,
      icon: <Calendar className="h-3.5 w-3.5" />,
      match: (p: string) => p.startsWith("/calendar"),
    },
    {
      href: "/assets",
      label: COPY.nav.assets,
      icon: <Upload className="h-3.5 w-3.5" />,
      match: (p: string) => p.startsWith("/assets"),
    },
    {
      href: "/studio",
      label: COPY.nav.templates,
      icon: <Wand2 className="h-3.5 w-3.5" />,
      match: (p: string) => p.startsWith("/studio"),
    },
  ];
  return (
    <nav className="ml-2 hidden lg:flex items-center gap-0.5">
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              active
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-surface"
            }`}
          >
            {t.icon}
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
