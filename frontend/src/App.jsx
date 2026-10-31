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
import CustomerModal from './components/CustomerModal';
import Toast from './components/Toast';

import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import SmartActionCenterView from './views/SmartActionCenterView';
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
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'success' });

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

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
    showToast(`Switched view to ${role.toUpperCase()} role simulation`, 'info');
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    if (user.role === 'customer') {
      setCurrentView('portal');
    } else {
      setCurrentView('dashboard');
    }
    triggerRefresh();
    showToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})`, 'success');
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

          {currentView === 'actionCenter' && (
            <SmartActionCenterView
              key={refreshKey}
              setView={setCurrentView}
            />
          )}

          {currentView === 'customers' && (
            <CustomersView
              key={refreshKey}
              onOpenNewCustomer={() => setCustomerModalOpen(true)}
              setView={setCurrentView}
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
        onBillingComplete={() => {
          triggerRefresh();
          showToast('Automated recurring billing run completed successfully!');
        }}
      />

      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onRefresh={() => {
          triggerRefresh();
          showToast('Invoice updated successfully');
        }}
        onOpenPayment={(inv) => setPaymentInvoice(inv)}
        currentUser={currentUser}
      />

      <PaymentModal
        invoice={paymentInvoice}
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onPaymentRecorded={() => {
          triggerRefresh();
          showToast('Payment reconciled and balance updated!');
        }}
        currentUser={currentUser}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSubscriptionCreated={() => {
          triggerRefresh();
          showToast('New subscription / quote added to pipeline!');
        }}
        currentUser={currentUser}
      />

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onProductCreated={() => {
          triggerRefresh();
          showToast('New product & variants added to catalog!');
        }}
      />

      <PlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onPlanCreated={() => {
          triggerRefresh();
          showToast('New subscription plan published!');
        }}
      />

      <DiscountModal
        isOpen={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        onDiscountCreated={() => {
          triggerRefresh();
          showToast('New discount rule activated!');
        }}
      />

      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        onStaffAdded={() => {
          triggerRefresh();
          showToast('New staff member added to team!');
        }}
      />

      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onCustomerSaved={() => {
          triggerRefresh();
          showToast('New customer account created successfully!');
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'success' })}
      />
    </div>
  );
}
