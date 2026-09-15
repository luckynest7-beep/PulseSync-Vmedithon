import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import './App.css';
import { useHealthStore } from './lib/store';
import { ActiveTab, Reading } from './lib/types';
import { Header } from './components/Navigation/Header';
import { BottomTabBar } from './components/Navigation/BottomTabBar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { TimelineView } from './components/Timeline/TimelineView';
import { DoctorShareView } from './components/Share/DoctorShareView';
import { SettingsView } from './components/Settings/SettingsView';
import { AddReadingModal } from './components/AddReading/AddReadingModal';
import { ReadingDetailModal } from './components/Timeline/ReadingDetailModal';
import { Toast, ToastMessage } from './components/Common/Toast';
import { EmergencyAlertModal } from './components/Common/EmergencyAlertModal';
import { checkCriticalAlert } from './lib/thresholds';

export const App: React.FC = () => {
  const {
    readings,
    profile,
    insight,
    isNudgeDismissed,
    addReading,
    deleteReading,
    updateProfile,
    dismissNudge,
    resetToDemoData,
    refreshInsight,
  } = useHealthStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [emergencyReason, setEmergencyReason] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `tst_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveReading = (data: Omit<Reading, 'id' | 'createdAt' | 'flag'>) => {
    const saved = addReading(data);
    setIsAddModalOpen(false);

    const critical = checkCriticalAlert(saved.type, {
      systolic: saved.systolic,
      diastolic: saved.diastolic,
      glucose: saved.glucose,
    });
    if (critical) {
      setEmergencyReason(critical.reason);
    }

    if (saved.flag === 'high') {
      showToast(
        `Reading Saved: ${
          saved.type === 'bp'
            ? `BP ${saved.systolic}/${saved.diastolic} mmHg`
            : `Glucose ${saved.glucose} mg/dL`
        } — Flagged Elevated!`,
        'error'
      );
    } else if (saved.flag === 'low') {
      showToast(
        `Reading Saved: ${
          saved.type === 'bp'
            ? `BP ${saved.systolic}/${saved.diastolic} mmHg`
            : `Glucose ${saved.glucose} mg/dL`
        } — Flagged Low!`,
        'error'
      );
    } else {
      // Normal reading celebration micro-delight
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#06b6d4', '#10b981', '#3b82f6'],
        });
      } catch {}
      showToast(
        `Reading Saved: ${
          saved.type === 'bp'
            ? `BP ${saved.systolic}/${saved.diastolic} mmHg (Normal)`
            : `Glucose ${saved.glucose} mg/dL (Target)`
        }`,
        'success'
      );
    }

    // Switch to timeline view so user immediately sees their reading
    setActiveTab('timeline');
  };

  return (
    <div className="app-container">
      <div className="mobile-shell">
        {/* Toast Notifications */}
        <Toast toasts={toasts} onDismiss={handleDismissToast} />

        {/* Global Header */}
        <Header profile={profile} onOpenSettings={() => setActiveTab('settings')} />

        {/* Active Screen Tab View */}
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            readings={readings}
            insight={insight}
            isNudgeDismissed={isNudgeDismissed}
            onDismissNudge={dismissNudge}
            onSelectReading={setSelectedReading}
            onRefreshInsight={refreshInsight}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            readings={readings}
            onSelectReading={setSelectedReading}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'share' && (
          <DoctorShareView
            profile={profile}
            readings={readings}
            insight={insight}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={updateProfile}
            onResetDemoData={resetToDemoData}
            onShowToast={showToast}
          />
        )}

        {/* Bottom Tab Navigation */}
        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Add Reading Modal (Camera OCR / Voice Mic / Manual Keypad) */}
        <AddReadingModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaveReading={handleSaveReading}
        />

        {/* Reading Detail Bottom Sheet */}
        <ReadingDetailModal
          reading={selectedReading}
          onClose={() => setSelectedReading(null)}
          onDelete={(id) => {
            deleteReading(id);
            showToast('Reading successfully deleted.', 'info');
          }}
        />

        {/* Emergency Alert — shown when a reading is at a critical extreme */}
        <EmergencyAlertModal
          reason={emergencyReason}
          profile={profile}
          onDismiss={() => setEmergencyReason(null)}
          onOpenSettings={() => {
            setEmergencyReason(null);
            setActiveTab('settings');
          }}
        />
      </div>
    </div>
  );
};

export default App;
