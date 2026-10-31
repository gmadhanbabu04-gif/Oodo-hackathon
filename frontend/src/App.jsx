import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BillingRunModal from './components/BillingRunModal';
import InvoiceModal from './components/InvoiceModal';
import PaymentModal from './components/PaymentModal';
import SubscriptionModal from './components/SubscriptionModal';
import ProductModal from './components/ProductModal';
import PlanModal from './components/PlanModal';
import DiscountModal from './components/DiscountModal';
import StaffModal from './components/StaffModal';
import AuthModal from './components/AuthModal';

import DashboardView from './views/DashboardView';
import SubscriptionsView from './views/SubscriptionsView';
import InvoicesView from './views/InvoicesView';
import PaymentsView from './views/PaymentsView';
import ProductsView from './views/ProductsView';
import PlansView from './views/PlansView';
import TemplatesView from './views/TemplatesView';
import DiscountsView from './views/DiscountsView';
import CustomerPortalView from './views/CustomerPortalView';
import StaffManagementView from './views/StaffManagementView';

import { getActiveUser, switchDemoRole } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getActiveUser());
  const [currentView, setCurrentView] = useState(
    currentUser?.role === 'customer' ? 'portal' : 'dashboard'
  );

  // Modals state
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Refresh trigger counter to reload data across views
  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh() {
    setRefreshKey(prev => prev + 1);
  }

  function handleSwitchRole(role) {
    const newUser = switchDemoRole(role);
    setCurrentUser(newUser);
    if (role === 'customer') {
      setCurrentView('portal');
    } else {
      setCurrentView('dashboard');
    }
    triggerRefresh();
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    if (user.role === 'customer') {
      setCurrentView('portal');
    } else {
      setCurrentView('dashboard');
    }
    triggerRefresh();
  }

  function handleApplyTemplate(tmpl) {
    setSubscriptionModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenBillingModal={() => setBillingModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentView={currentView}
          setView={setCurrentView}
          currentUser={currentUser}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Admin / Staff Views */}
          {currentView === 'dashboard' && (
            <DashboardView
              key={refreshKey}
              onOpenBillingModal={() => setBillingModalOpen(true)}
              onSelectInvoice={setSelectedInvoice}
            />
          )}

          {currentView === 'subscriptions' && (
            <SubscriptionsView
              key={refreshKey}
              onOpenNewSubscription={() => setSubscriptionModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {currentView === 'invoices' && (
            <InvoicesView
              key={refreshKey}
              onSelectInvoice={setSelectedInvoice}
              onOpenBillingModal={() => setBillingModalOpen(true)}
              onOpenPayment={setPaymentInvoice}
              currentUser={currentUser}
            />
          )}

          {currentView === 'payments' && (
            <PaymentsView
              key={refreshKey}
              currentUser={currentUser}
            />
          )}

          {currentView === 'products' && (
            <ProductsView
              key={refreshKey}
              onOpenNewProduct={() => setProductModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {currentView === 'plans' && (
            <PlansView
              key={refreshKey}
              onOpenNewPlan={() => setPlanModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {currentView === 'templates' && (
            <TemplatesView
              key={refreshKey}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {currentView === 'discounts' && (
            <DiscountsView
              key={refreshKey}
              onOpenNewDiscount={() => setDiscountModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {currentView === 'staff' && (
            <StaffManagementView
              key={refreshKey}
              onOpenNewStaff={() => setStaffModalOpen(true)}
            />
          )}

          {/* Customer Specific Views */}
          {currentView === 'portal' && (
            <CustomerPortalView
              key={refreshKey}
              currentUser={currentUser}
              onSelectInvoice={setSelectedInvoice}
              onOpenPayment={setPaymentInvoice}
              onOpenNewSubscription={() => setSubscriptionModalOpen(true)}
              setView={setCurrentView}
            />
          )}

          {currentView === 'catalog' && (
            <ProductsView
              key={refreshKey}
              onOpenNewProduct={() => setProductModalOpen(true)}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <BillingRunModal
        isOpen={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        onBillingComplete={triggerRefresh}
      />

      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onRefresh={triggerRefresh}
        onOpenPayment={(inv) => setPaymentInvoice(inv)}
        currentUser={currentUser}
      />

      <PaymentModal
        invoice={paymentInvoice}
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onPaymentRecorded={triggerRefresh}
        currentUser={currentUser}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscriptionCreated={triggerRefresh}
        currentUser={currentUser}
      />

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onProductCreated={triggerRefresh}
      />

      <PlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onPlanCreated={triggerRefresh}
      />

      <DiscountModal
        isOpen={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        onDiscountCreated={triggerRefresh}
      />

      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        onStaffAdded={triggerRefresh}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
