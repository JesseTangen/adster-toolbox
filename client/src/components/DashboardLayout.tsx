import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { useTheme } from "@/contexts/ThemeContext";
import { headerLogoSrc } from "@/lib/headerLogo";
import { BookOpen, Braces, ClipboardCheck, LayoutDashboard, LogOut, Network, Moon, PanelLeft, Sparkles, Sun, LayoutPanelTop } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Braces, label: "LocalBusiness Schema", path: "/local-schema" },
  { icon: LayoutPanelTop, label: "Wireframe Builder", path: "/wireframe-builder" },
  { icon: Network, label: "Sitemap Planner", path: "/sitemap-planner" },
  { icon: ClipboardCheck, label: "QA Checklists", path: "/qa-checklists" },
];

const plannedMenuItems = [
  { icon: BookOpen, label: "Knowledge Base" },
  { icon: Sparkles, label: "Prompt Library" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
  onSignOut,
}: {
  children: React.ReactNode;
  onSignOut: () => void;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth} onSignOut={onSignOut}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  onSignOut: () => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  onSignOut,
}: DashboardLayoutContentProps) {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">Adster Creative Toolbox</span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            <div className="mx-3 mt-5 border-t border-sidebar-border pt-4 group-data-[collapsible=icon]:mx-2">
              <p className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground group-data-[collapsible=icon]:hidden">Planned modules</p>
              <SidebarMenu className="px-0 py-0">
                {plannedMenuItems.map(item => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => toast.info(`${item.label} is planned for a future toolbox release.`)}
                      tooltip={`${item.label} — planned`}
                      className="h-9 font-normal text-muted-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="space-y-2 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
            <div className="flex items-center justify-center gap-3 rounded-xl px-2 py-2 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0">
              <img src={headerLogoSrc} alt="Adster Creative" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
            </div>
            <button onClick={onSignOut} className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-2 text-[10px] font-medium text-muted-foreground transition hover:bg-sidebar-accent group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0" aria-label="Sign out of Toolbox"><LogOut className="h-3.5 w-3.5" /><span className="group-data-[collapsible=icon]:hidden">Sign out</span></button>
            <button onClick={toggleTheme} role="switch" aria-checked={theme === "dark"} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-2 text-[10px] font-medium text-muted-foreground transition hover:bg-sidebar-accent group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0" aria-label="Toggle dark mode"><span className="flex items-center gap-2"><span className="relative flex h-4 w-7 items-center rounded-full bg-muted transition group-data-[collapsible=icon]:hidden"><span className={`h-3 w-3 rounded-full bg-primary transition-transform ${theme === "dark" ? "translate-x-3.5" : "translate-x-0.5"}`} /></span><span className="group-data-[collapsible=icon]:block">{theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</span><span className="group-data-[collapsible=icon]:hidden"> mode</span></span></button>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <img src={headerLogoSrc} alt="Adster Creative" className="h-7 w-7 rounded-lg object-contain" />
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">{activeMenuItem?.label ?? "Dashboard"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
