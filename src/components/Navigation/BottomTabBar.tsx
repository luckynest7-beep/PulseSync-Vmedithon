import React from 'react';
import { Home, History, Plus, FileText, Settings } from 'lucide-react';
import { ActiveTab } from '../../lib/types';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  return (
    <nav className="bottom-tab-bar" aria-label="Bottom Navigation">
      <button
        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onChangeTab('dashboard')}
      >
        <Home size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 1.8} />
        <span>Home</span>
      </button>

      <button
        className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
        onClick={() => onChangeTab('timeline')}
      >
        <History size={20} strokeWidth={activeTab === 'timeline' ? 2.5 : 1.8} />
        <span>Timeline</span>
      </button>

      {/* Prominent Quick-Add Floating Action Button */}
      <button
        className="add-fab-btn"
        onClick={onOpenAddModal}
        aria-label="Add New Vital Reading"
        title="Capture Vital Reading"
      >
        <Plus size={28} strokeWidth={2.8} />
      </button>

      <button
        className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
        onClick={() => onChangeTab('share')}
      >
        <FileText size={20} strokeWidth={activeTab === 'share' ? 2.5 : 1.8} />
        <span>Share</span>
      </button>

      <button
        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onChangeTab('settings')}
      >
        <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 1.8} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
