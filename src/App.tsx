import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const Certificates = lazy(() => import("./pages/Certificates"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Settings = lazy(() => import("./pages/Settings"));
const InstagramPage = lazy(() => import("./pages/Instagram"));
const UsersPage = lazy(() => import("./pages/Users"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div role="status" className="p-8 text-center">Yuklanmoqda...</div>}>
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
