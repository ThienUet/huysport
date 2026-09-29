import { Route, Routes } from "react-router-dom";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ProtectedRoute from "@/components/ProtectedRoute";

import IndexPage from "@/pages/index";
import ProductsPage from "@/pages/products";
import OrdersPage from "@/pages/orders";
import CustomersPage from "@/pages/customers";
import ChatbotPage from "@/pages/chatbot";
import AnalyticsPage from "@/pages/analytics";
import MarketingPage from "@/pages/marketing";
import SettingsPage from "@/pages/settings";
import HelpPage from "@/pages/help";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <IndexPage />
          </ProtectedRoute>
        }
        path="/"
      />
      <Route
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
        path="/products"
      />
      <Route
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
        path="/orders"
      />
      <Route
        element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        }
        path="/customers"
      />
      <Route
        element={
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        }
        path="/chatbot"
      />
      <Route
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
        path="/analytics"
      />
      <Route
        element={
          <ProtectedRoute>
            <MarketingPage />
          </ProtectedRoute>
        }
        path="/marketing"
      />
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
        path="/settings"
      />
      <Route
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        }
        path="/help"
      />
      <Route
        element={
          <ProtectedRoute>
            <DocsPage />
          </ProtectedRoute>
        }
        path="/docs"
      />
      <Route
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
        path="/pricing"
      />
      <Route
        element={
          <ProtectedRoute>
            <BlogPage />
          </ProtectedRoute>
        }
        path="/blog"
      />
      <Route
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
        path="/about"
      />
    </Routes>
  );
}

export default App;
