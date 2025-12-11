import React from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, PictureOutlined, LayoutOutlined } from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import StickerLibraryManager from './StickerLibraryManager';
import TemplateManager from './TemplateManager';

const LeftSidebar: React.FC = () => {
  const { leftSidebarTab, setLeftSidebarTab, toggleLeftSidebar, isLeftSidebarOpen } = useAppStore();

  return (
    <aside className={`${isLeftSidebarOpen ? 'w-60' : 'w-10'} bg-gray-800 text-white h-screen flex flex-col transition-all duration-300 overflow-hidden shadow-lg flex-shrink-0`}>
      <div className="sidebar-header flex items-center justify-between px-2 py-2 border-b border-gray-700">
        {isLeftSidebarOpen && <h2 className="text-base font-semibold">资源管理</h2>}
        <button 
          className="toggle-btn p-1 rounded hover:bg-gray-700 transition-colors text-sm" 
          onClick={toggleLeftSidebar}
        >
          {isLeftSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </button>
      </div>
      
      <div className="sidebar-tabs flex gap-1 p-1">
        <button 
          className={`flex-1 tab-btn px-3 py-1.5 rounded transition-colors flex items-center gap-2 text-sm ${leftSidebarTab === 'stickers' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setLeftSidebarTab('stickers')}
        >
          <PictureOutlined />
          {isLeftSidebarOpen && '贴纸库'}
        </button>
        <button 
          className={`flex-1 tab-btn px-3 py-1.5 rounded transition-colors flex items-center gap-2 text-sm ${leftSidebarTab === 'templates' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          onClick={() => setLeftSidebarTab('templates')}
        >
          <LayoutOutlined />
          {isLeftSidebarOpen && '模板'}
        </button>
      </div>
      
      <div className="sidebar-content flex-1 overflow-y-auto p-1">
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