"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/auth";
import { getCommandPaletteContextAction, type CommandPaletteMission } from "@/app/actions/commandPalette";
import { forceRefreshGrowthScoreAction } from "@/app/actions/audit";

interface NavCommand {
  kind: "nav";
  id: string;
  label: string;
  hint: string;
  href: string;
}

interface ActionCommand {
  kind: "action";
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

interface MissionCommand {
  kind: "mission";
  id: string;
  label: string;
  hint: string;
}

type Command = NavCommand | ActionCommand | MissionCommand;

const NAV_COMMANDS: NavCommand[] = [
  { kind: "nav", id: "dashboard", label: "Dashboard", hint: "Ir", href: "/dashboard" },
  { kind: "nav", id: "marketplace", label: "Centro de Mejoras", hint: "Ir", href: "/marketplace" },
  { kind: "nav", id: "account", label: "Mi cuenta", hint: "Ir", href: "/account" },
  { kind: "nav", id: "faq", label: "Preguntas frecuentes", hint: "Ir", href: "/faq" },
  { kind: "nav", id: "contacto", label: "Contacto", hint: "Ir", href: "/contacto" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [missions, setMissions] = useState<CommandPaletteMission[] | null>(null);
  const [canRefresh, setCanRefresh] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    }
    function handleToggleEvent() {
      setOpen((v) => !v);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-command-palette", handleToggleEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-command-palette", handleToggleEvent);
    };
  }, [close]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      if (missions === null) {
        startTransition(async () => {
          const result = await getCommandPaletteContextAction();
          setMissions(result.missions);
          setCanRefresh(result.canRefresh);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe cargar misiones al abrir, no en cada render
  }, [open]);

  const actionCommands: ActionCommand[] = useMemo(() => {
    const commands: ActionCommand[] = [];
    if (canRefresh) {
      commands.push({
        kind: "action",
        id: "refresh-score",
        label: "Reanalizar mi web ahora",
        hint: "Acción",
        run: () => {
          startTransition(async () => {
            await forceRefreshGrowthScoreAction();
            router.push("/dashboard");
            router.refresh();
          });
        },
      });
    }
    commands.push({
      kind: "action",
      id: "sign-out",
      label: "Cerrar sesión",
      hint: "Acción",
      run: () => {
        startTransition(async () => {
          await signOutAction();
        });
      },
    });
    return commands;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router/startTransition son estables entre renders
  }, [canRefresh]);

  const missionCommands: MissionCommand[] = useMemo(
    () =>
      (missions ?? []).map((m) => ({
        kind: "mission" as const,
        id: m.id,
        label: m.title,
        hint: m.type === "weekly" ? `Misión semanal · +${m.xpReward} XP` : `Quick Win pendiente · +${m.xpReward} XP`,
      })),
    [missions],
  );

  const allCommands: Command[] = useMemo(
    () => [...NAV_COMMANDS, ...missionCommands, ...actionCommands],
    [missionCommands, actionCommands],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter((c) => c.label.toLowerCase().includes(q));
  }, [allCommands, query]);

  function runCommand(command: Command) {
    if (command.kind === "nav") {
      router.push(command.href);
    } else if (command.kind === "mission") {
      router.push("/dashboard");
    } else {
      command.run();
    }
    close();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const command = filtered[selectedIndex];
      if (command) runCommand(command);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Busca una página o una misión pendiente…"
          className="w-full border-b border-border px-5 py-4 text-sm text-foreground placeholder:text-zinc-500 outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-zinc-500">Sin resultados.</p>
          )}
          {filtered.map((command, i) => (
            <button
              key={`${command.kind}-${command.id}`}
              type="button"
              onClick={() => runCommand(command)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500",
                i === selectedIndex ? "bg-brand-50 text-brand-700" : "text-foreground hover:bg-surface-muted",
              )}
            >
              <span className="truncate font-medium">{command.label}</span>
              <span className="shrink-0 whitespace-nowrap text-xs text-zinc-500">{command.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
