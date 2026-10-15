import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import StoreDrawers from './StoreDrawers';
import CRMDashboardModal from './CRMDashboardModal';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-container">
      <Navbar />
      <main style={{ minHeight: '70vh' }}>
        {children}
      </main>
      <Footer />

      {/* Shared Drawers: Cart, Wishlist, Checkout & Toast */}
      <StoreDrawers />

      {/* Admin CRM Modal */}
      <CRMDashboardModal />
    </div>
  );
}
