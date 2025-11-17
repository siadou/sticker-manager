import React from 'react';
import useAppStore from '../store/useAppStore';

const StickerLibraryManager: React.FC = () => {
  const { stickerLibraries, createStickerLibrary, importStickerLibrary, exportStickerLibrary } = useAppStore();

  const handleCreateLibrary = () => {
    const name = prompt('请输入贴纸库名称:');
    if (name?.trim()) {
      createStickerLibrary(name.trim());
    }
  };

  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const libraryData = JSON.parse(event.target?.result as string);
        importStickerLibrary(libraryData);
        alert('贴纸库导入成功');
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败: 无效的JSON文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="sticker-library-manager">
      <div className="manager-header">
        <h3>贴纸库</h3>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={handleCreateLibrary}>
            新建
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportLibrary}
            style={{ display: 'none' }}
            id="import-library"
          />
          <label className="btn btn-secondary" htmlFor="import-library">
            导入
          </label>
        </div>
      </div>
      <div className="library-list">
        {stickerLibraries.map((library) => (
          <div key={library.id} className="library-item">
            <div className="library-info">
              <div className="library-name">{library.name}</div>
              <div className="library-meta">
                {library.stickers.length} 个贴纸
              </div>
            </div>
            <div className="library-actions">
              <button 
                className="action-btn export-btn"
                onClick={() => exportStickerLibrary(library.id)}
                title="导出"
              >
                导出
              </button>
              <button className="action-btn delete-btn" title="删除">
                删除
              </button>
            </div>
          </div>
        ))}
        {stickerLibraries.length === 0 && (
          <div className="empty-state">
            <p>暂无贴纸库</p>
            <p>点击"新建"或"导入"开始</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerLibraryManager;