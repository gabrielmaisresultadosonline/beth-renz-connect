import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { useDynamicFavicon } from "@/hooks/use-dynamic-favicon";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import QuemSomos from "./pages/QuemSomos";
import Solucoes from "./pages/Solucoes";
import Clientes from "./pages/Clientes";
import PressReleases from "./pages/PressReleases";
import PressReleaseDetail from "./pages/PressReleaseDetail";
import Blog from "./pages/Blog";
import Clipping from "./pages/Clipping";
import Dicas from "./pages/Dicas";
import DicaDetail from "./pages/DicaDetail";
import Parceiros from "./pages/Parceiros";
import Contato from "./pages/Contato";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPressReleases from "./pages/admin/AdminPressReleases";
import AdminClientes from "./pages/admin/AdminClientes";
import AdminClipping from "./pages/admin/AdminClipping";
import AdminDicas from "./pages/admin/AdminDicas";
import AdminParceiros from "./pages/admin/AdminParceiros";
import AdminMensagens from "./pages/admin/AdminMensagens";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminEquipe from "./pages/admin/AdminEquipe";
import AdminServicos from "./pages/admin/AdminServicos";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminHomepage from "./pages/admin/AdminHomepage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useDynamicFavicon();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/quem-somos" element={<QuemSomos />} />
      <Route path="/solucoes" element={<Solucoes />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/press-releases" element={<PressReleases />} />
      <Route path="/press-releases/:id" element={<PressReleaseDetail />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/clipping" element={<Clipping />} />
      <Route path="/dicas" element={<Dicas />} />
      <Route path="/dicas/:id" element={<DicaDetail />} />
      <Route path="/parceiros" element={<Parceiros />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/press-releases" element={<AdminPressReleases />} />
      <Route path="/admin/clientes" element={<AdminClientes />} />
      <Route path="/admin/clipping" element={<AdminClipping />} />
      <Route path="/admin/dicas" element={<AdminDicas />} />
      <Route path="/admin/parceiros" element={<AdminParceiros />} />
      <Route path="/admin/mensagens" element={<AdminMensagens />} />
      <Route path="/admin/config" element={<AdminConfig />} />
      <Route path="/admin/equipe" element={<AdminEquipe />} />
      <Route path="/admin/servicos" element={<AdminServicos />} />
      <Route path="/admin/site-settings" element={<AdminSiteSettings />} />
      <Route path="/admin/homepage" element={<AdminHomepage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
