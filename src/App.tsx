import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import './App.css';
import { useHealthStore } from './lib/store';
import { ActiveTab, Reading } from './lib/types';
import { auth, isFirebaseAuthConfigured } from './lib/firebaseClient';
import { LoginView } from './components/Auth/LoginView';
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
    refreshInsight,
    initForUser,
    clearUser,
  } = useHealthStore();

  // undefined = still resolving a persisted session, null = signed out.
  // Apps that haven't configured Firebase Auth skip the gate entirely — the
  // existing local/mock behavior is unaffected.
  const [authUser, setAuthUser] = useState<User | null | undefined>(
    isFirebaseAuthConfigured ? undefined : null
  );

  useEffect(() => {
    if (!isFirebaseAuthConfigured || !auth) return;
    return onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      if (u) {
        initForUser(u.uid, { displayName: u.displayName || 'Patient', email: u.email || undefined });
      } else {
        clearUser();
      }
    });
  }, []);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
  };

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
    // Real signed-in identity always wins over whatever the capture UI set.
    const saved = addReading(authUser ? { ...data, userId: authUser.uid } : data);
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

  if (isFirebaseAuthConfigured && authUser === undefined) {
    return (
      <div className="app-container">
        <div className="mobile-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (isFirebaseAuthConfigured && authUser === null) {
    return (
      <LoginView
        onAuthenticated={(user, phoneNumber) => {
          // Corrective write: onAuthStateChanged can fire before the Firebase
          // profile update (setting displayName) resolves, so initForUser may
          // have already run with a stale/blank name. This runs after
          // LoginView's own updateProfile(auth) call resolved, so user.displayName
          // is reliably up to date here — safe to write last.
          updateProfile({
            displayName: user.displayName || undefined,
            ...(phoneNumber ? { phoneNumber } : {}),
          });
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="mobile-shell">
        {/* Toast Notifications */}
        <Toast toasts={toasts} onDismiss={handleDismissToast} />

        {/* Global Header */}
        <Header profile={profile} onOpenSettings={() => setActiveTab('settings')} />

        {/* Active Screen Tab View */}
        <div key={activeTab} className="tab-content-enter">
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
              onShowToast={showToast}
              onSignOut={isFirebaseAuthConfigured ? handleSignOut : undefined}
            />
          )}
        </div>

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
