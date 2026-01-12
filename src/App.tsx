import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import QuemSomos from "./pages/QuemSomos";
import Solucoes from "./pages/Solucoes";
import Clientes from "./pages/Clientes";
import PressReleases from "./pages/PressReleases";
import Blog from "./pages/Blog";
import Clipping from "./pages/Clipping";
import Dicas from "./pages/Dicas";
import Parceiros from "./pages/Parceiros";
import Contato from "./pages/Contato";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/solucoes" element={<Solucoes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/press-releases" element={<PressReleases />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/clipping" element={<Clipping />} />
            <Route path="/dicas" element={<Dicas />} />
            <Route path="/parceiros" element={<Parceiros />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
