"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Settings, Layers, Film, GalleryVertical, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSwitcher } from "@/components/layout/ProjectSwitcher";

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

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center px-4 gap-3 shrink-0">
      {showBack && (
        <Link href="/">
          <Button variant="ghost" size="icon" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <Layers className="h-5 w-5 text-accent shrink-0" />
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
            title={editable ? "Click to rename" : undefined}
          >
            {title}
          </span>
        ) : null}
      </div>
      {!showBack && (
        <div className="ml-1">
          <ProjectSwitcher />
        </div>
      )}
      {!showBack && <NavTabs />}
      <div className="flex-1" />
      {onSettingsClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </header>
  );
}

function NavTabs() {
  const pathname = usePathname() || "/";
  const tabs = [
    { href: "/", label: "Carruseles", icon: <Layers className="h-3.5 w-3.5" />, match: (p: string) => p === "/" || p.startsWith("/carousel") },
    { href: "/reels", label: "Reels", icon: <Film className="h-3.5 w-3.5" />, match: (p: string) => p.startsWith("/reels") },
    { href: "/stories", label: "Historias", icon: <GalleryVertical className="h-3.5 w-3.5" />, match: (p: string) => p.startsWith("/stories") },
    { href: "/studio", label: "Studio", icon: <Wand2 className="h-3.5 w-3.5" />, match: (p: string) => p.startsWith("/studio") },
  ];
  return (
    <nav className="ml-4 flex items-center gap-1">
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
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
