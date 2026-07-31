import React, { useState, useEffect } from "react";
import { ActiveTab } from "../types";
import {
  GraduationCap,
  Flame,
  Clock,
  LayoutDashboard,
  CalendarDays,
  Timer,
  Bot,
  BrainCircuit,
  BarChart3,
  FileText,
  Menu,
  X,
  Sparkles,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  examDate: string;
  streak: number;
  onOpenDossier: () => void;
  onOpenSettings: () => void;
  onOpenWizard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  examDate,
  streak,
  onOpenDossier,
  onOpenSettings,
  onOpenWizard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const target = new Date(examDate).getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [examDate]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schedule", label: "AI Planner", icon: CalendarDays },
    { id: "focus", label: "Focus Room", icon: Timer },
    { id: "tutor", label: "AI Tutor", icon: Bot },
    { id: "quiz", label: "Practice Vault", icon: BrainCircuit },
    { id: "diagnostics", label: "Diagnostics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lg:text-xl text-white tracking-tight">
                OBSIDIAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">APEX</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Matric AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              All-Year Academic & Board Exam Planner
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Top Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <div
            title="Current Daily Study Streak"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm"
          >
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* Setup Wizard Trigger */}
          <button
            id="btn-open-wizard"
            onClick={onOpenWizard}
            title="Open Student Setup Wizard & Custom Plan Creator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 text-xs font-bold transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-violet-400" />
            <span className="hidden xl:inline">Plan Setup</span>
          </button>

          {/* Competition Dossier Button */}
          <button
            id="btn-open-dossier"
            onClick={onOpenDossier}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all border border-emerald-400/30"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">Dossier</span>
          </button>

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title="Open Application & Profile Settings"
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/50 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border ${
                  isActive
                    ? "bg-violet-600 text-white border-violet-500 shadow-md"
                    : "bg-slate-900/80 text-slate-300 border-white/5 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 text-violet-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
