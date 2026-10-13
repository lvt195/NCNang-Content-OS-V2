import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminProtectedRoute } from './admin/AdminProtectedRoute';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { AdminProductsPage } from './admin/AdminProductsPage';
import { AdminProductFormPage } from './admin/AdminProductFormPage';
import { AdminBulkImportPage } from './admin/AdminBulkImportPage';
import { AdminCategoriesPage } from './admin/AdminCategoriesPage';
import { AdminMediaLibraryPage } from './admin/AdminMediaLibraryPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Storefront Routes */}
        <Route path="/" element={<CatalogPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />

        {/* Admin Login Route (Publicly accessible) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/bulk" element={<AdminBulkImportPage />} />
            <Route path="products/:id/edit" element={<AdminProductFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="media" element={<AdminMediaLibraryPage />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
