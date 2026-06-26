import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';

// Customer Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Receipt from './pages/Receipt';
import ProductDetailPage from './pages/ProductDetailPage';

// Vendor Pages
import VendorInboxPage from './pages/vendor/VendorInboxPage';
import VendorSignupPage from './pages/vendor/VendorSignupPage';
import VendorLoginPage from './pages/vendor/VendorLoginPage';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorEarningsPage from './pages/vendor/VendorEarningsPage';
import VendorSettingsPage from './pages/vendor/VendorSettingsPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVendorsPage from './pages/admin/AdminVendorsPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  return (
    <CartProvider>
      <ChatProvider>
        <Router>

          <Toaster position="bottom-right" />

          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={
              <>
                <Navbar />

                <Home />

                <Footer />
              </>
            } />

            <Route path="/shop" element={
              <>
                <Navbar />

                <Shop />

                <Footer />
              </>
            } />

            <Route path="/cart" element={
              <>
                <Navbar />

                <Cart />

                <Footer />
              </>
            } />

            <Route path="/checkout" element={
              <>
                <Navbar />

                <Checkout />

                <Footer />
              </>
            } />

            <Route path="/track-order" element={
              <>
                <Navbar />

                <TrackOrder />

                <Footer />
              </>
            } />

            <Route path="/receipt/:orderId" element={
              <>
                <Navbar />

                <Receipt />

                <Footer />
              </>
            } />

            <Route path="/product/:productId" element={
              <>
                <Navbar />

                <ProductDetailPage />

                <Footer />
              </>
            } />

            {/* Vendor Routes */}
            <Route path="/vendor/inbox" element={<VendorInboxPage />} />
            <Route path="/vendor/signup" element={<VendorSignupPage />} />
            <Route path="/vendor/login" element={<VendorLoginPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
            <Route path="/vendor/products" element={<VendorProductsPage />} />
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            <Route path="/vendor/earnings" element={<VendorEarningsPage />} />
            <Route path="/vendor/settings" element={<VendorSettingsPage />} />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/vendors" element={<AdminVendorsPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ChatProvider>
    </CartProvider>
  );
}

export default App;