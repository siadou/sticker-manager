import React from 'react';
import useAppStore from '../store/useAppStore';
import StickerLibraryManager from './StickerLibraryManager';
import TemplateManager from './TemplateManager';

const LeftSidebar: React.FC = () => {
  const { leftSidebarTab, setLeftSidebarTab, toggleLeftSidebar, isLeftSidebarOpen } = useAppStore();

  return (
    <aside className={`left-sidebar ${isLeftSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>资源管理</h2>
        <button className="toggle-btn" onClick={toggleLeftSidebar}>
          {isLeftSidebarOpen ? '<<' : '>>'}
        </button>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab-btn ${leftSidebarTab === 'stickers' ? 'active' : ''}`}
          onClick={() => setLeftSidebarTab('stickers')}
        >
          贴纸库
        </button>
        <button 
          className={`tab-btn ${leftSidebarTab === 'templates' ? 'active' : ''}`}
          onClick={() => setLeftSidebarTab('templates')}
        >
          模板
        </button>
      </div>
      
      <div className="sidebar-content">
        {leftSidebarTab === 'stickers' ? (
          <StickerLibraryManager />
        ) : (
          <TemplateManager />
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;