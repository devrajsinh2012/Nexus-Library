import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import Pages
import Landing from "./pages/Landing";
import Catalog from "./pages/Catalog";
import BookDetail from "./pages/BookDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/book/:id" component={BookDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
