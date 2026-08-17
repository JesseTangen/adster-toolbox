import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TEAM_ACCESS_SESSION_KEY } from "./lib/teamAccess";
import Home from "./pages/Home";
import LocalSchema from "./pages/LocalSchema";
import QaChecklists from "./pages/QaChecklists";
import TeamAccess from "./pages/TeamAccess";
import WireframeBuilder from "./pages/WireframeBuilder";
import { useState } from "react";

function AppRoutes({ onSignOut }: { onSignOut: () => void }) {
  return (
    <DashboardLayout onSignOut={onSignOut}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/local-schema"} component={LocalSchema} />
        <Route path={"/wireframe-builder"} component={WireframeBuilder} />
        <Route path={"/qa-checklists"} component={QaChecklists} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const pagesBasePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
  const [hasTeamAccess, setHasTeamAccess] = useState(() => sessionStorage.getItem(TEAM_ACCESS_SESSION_KEY) === "granted");
  const grantAccess = () => {
    sessionStorage.setItem(TEAM_ACCESS_SESSION_KEY, "granted");
    setHasTeamAccess(true);
  };
  const revokeAccess = () => {
    sessionStorage.removeItem(TEAM_ACCESS_SESSION_KEY);
    setHasTeamAccess(false);
  };
  const routes = hasTeamAccess ? <AppRoutes onSignOut={revokeAccess} /> : <TeamAccess onGranted={grantAccess} />;

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          {pagesBasePath ? <WouterRouter base={pagesBasePath}>{routes}</WouterRouter> : routes}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
