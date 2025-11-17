import React from 'react';
import useAppStore from '../store/useAppStore';
import LayerPanel from './LayerPanel';
import ElementPropertyPanel from './ElementPropertyPanel';

const RightSidebar: React.FC = () => {
  const { toggleRightSidebar, isRightSidebarOpen } = useAppStore();

  return (
    <aside className={`right-sidebar ${isRightSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>控制面板</h2>
        <button className="toggle-btn" onClick={toggleRightSidebar}>
          {isRightSidebarOpen ? '>>' : '<<'}
        </button>
      </div>
      <div className="sidebar-content">
        <LayerPanel />
        <ElementPropertyPanel />
      </div>
    </aside>
  );
};

export default RightSidebar;