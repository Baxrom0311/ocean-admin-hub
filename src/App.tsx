import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Certificates from "./pages/Certificates";
import Gallery from "./pages/Gallery";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import InstagramPage from "./pages/Instagram";
import UsersPage from "./pages/Users";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="settings" element={<Settings />} />
                <Route path="instagram" element={<InstagramPage />} />
                <Route path="users" element={<PrivateRoute superAdminOnly><UsersPage /></PrivateRoute>} />
                <Route path="audit-logs" element={<PrivateRoute superAdminOnly><AuditLog /></PrivateRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
