import React, { lazy, Suspense } from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AdminRoute } from '@/components/routes/AdminRoute';
import { SuperAdminRoute } from '@/components/routes/SuperAdminRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from './components/ui/skeleton';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const EditProduct = lazy(() => import('./pages/EditProduct'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const Cart = lazy(() => import('./pages/Cart'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const MyProducts = lazy(() => import('./pages/MyProducts'));

// Loading fallback
const PageLoader = () => (
  <div className="container mx-auto p-4 mt-20">
    <Skeleton className="h-12 w-full mb-4" />
    <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))} 
    </div>
  </div>
);

export const Routes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <RouterRoutes>
        {/* Public Routes */}
        <Route 
          path="/" 
          
          element={session ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={session ? <Navigate to="/products" replace /> : <Login />} 
        />

        <Route
          path="/home"
          element={<Home />}
        />

        {/* Protected Routes */}
        <Route 
          path="/products" 
          element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
          } 
        />
        <Route
          path="/my-products"
          element={
            <PrivateRoute>
              <MyProducts />
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
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute>
              <Wishlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route
          path="/admin/manage"
          element={
            <PrivateRoute>
              <SuperAdminRoute>
                <AdminManagement />
              </SuperAdminRoute>
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </Suspense>
  );
};
