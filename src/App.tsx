import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { LazyMotion, domAnimation } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ModifyProducts from "./pages/ModifyProducts";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <LazyMotion features={domAnimation}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Index />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/add-product"
                  element={
                    <PrivateRoute>
                      <AddProduct />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-product/:id"
                  element={
                    <PrivateRoute>
                      <EditProduct />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/modify-products"
                  element={
                    <PrivateRoute>
                      <ModifyProducts />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <PrivateRoute>
                      <AdminUsers />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </LazyMotion>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;