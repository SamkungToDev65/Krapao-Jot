"use client";

import React, { useState } from "react";
import { FinanceProvider } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Sidebar } from "@/components/navigation/sidebar";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MobileHeader } from "@/components/navigation/mobile-header";
import { QuickAddModal } from "@/components/transactions/quick-add-modal";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { CardsView } from "@/components/cards/cards-view";
import { SubscriptionsView } from "@/components/subscriptions/subscriptions-view";
import { ProfileView } from "@/components/profile/profile-view";
import { LoansView } from "@/components/loans/loans-view";
import { InvestmentsView } from "@/components/investments/investments-view";

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardView
            onNavigate={setCurrentTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        );
      case "transactions":
        return <TransactionsView onOpenQuickAdd={() => setIsQuickAddOpen(true)} />;
      case "investments":
        return <InvestmentsView />;
      case "cards":
        return <CardsView />;
      case "subscriptions":
        return <SubscriptionsView />;
      case "loans":
        return <LoansView />;
      case "profile":
        return <ProfileView onNavigate={setCurrentTab} />;
      default:
        return (
          <DashboardView
            onNavigate={setCurrentTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Mobile Header */}
        <MobileHeader onSelectTab={setCurrentTab} currentTab={currentTab} />

        {/* Dynamic View Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}

function RootAppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold text-[var(--fg-muted)] tracking-wider">กำลังตรวจสอบการเข้าสู่ระบบ...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold text-[var(--fg-muted)] tracking-wider">กำลังโหลด กระเป๋าจด...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <RootAppContent />
    </AuthProvider>
  );
}
