import React from 'react';
import useAppStore from '../store/useAppStore';
import LayerPanel from './LayerPanel';
import ElementPropertyPanel from './ElementPropertyPanel';

const RightSidebar: React.FC = () => {
  const { toggleRightSidebar, isRightSidebarOpen } = useAppStore();

  return (
    <aside className={`${isRightSidebarOpen ? 'w-72' : 'w-0'} bg-white h-screen flex flex-col transition-all duration-300 overflow-hidden shadow-lg border-l border-gray-200 flex-shrink-0`}>
      <div className="sidebar-header flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">控制面板</h2>
        <button 
          className="toggle-btn p-1 rounded hover:bg-gray-100 transition-colors text-gray-600 text-xs"
          onClick={toggleRightSidebar}
        >
          {isRightSidebarOpen ? '>>' : '<<'}
        </button>
      </div>
      <div className="sidebar-content flex-1 overflow-y-auto p-2 space-y-2">
        <LayerPanel />
        <ElementPropertyPanel />
      </div>
    </aside>
  );
};

export default RightSidebar;