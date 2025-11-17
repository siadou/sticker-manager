import React from 'react';
import useAppStore from '../store/useAppStore';

const CanvasToolbar: React.FC = () => {
  const { setActiveTool, createCanvas } = useAppStore();

  const handleNewCanvas = () => {
    const width = prompt('请输入画布宽度:', '1024');
    const height = prompt('请输入画布高度:', '768');
    const name = prompt('请输入画布名称:', '未命名画布');

    if (width && height && !isNaN(parseInt(width)) && !isNaN(parseInt(height))) {
      createCanvas(parseInt(width), parseInt(height), name?.trim() || undefined);
    }
  };

  const handleOpenCanvas = () => {
    // 实现打开画布功能
    alert('打开画布功能开发中...');
  };

  const handleSaveCanvas = () => {
    // 实现保存画布功能
    alert('保存画布功能开发中...');
  };

  return (
    <div className="canvas-toolbar">
      <div className="toolbar-section">
        <button className="btn btn-primary" onClick={handleNewCanvas} title="新建画布">
          新建
        </button>
        <button className="btn btn-secondary" onClick={handleOpenCanvas} title="打开画布">
          打开
        </button>
        <button className="btn btn-secondary" onClick={handleSaveCanvas} title="保存画布">
          保存
        </button>
      </div>

      <div className="toolbar-section">
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveTool('select')} 
          title="选择工具"
        >
          选择
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveTool('move')} 
          title="移动工具"
        >
          移动
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveTool('scale')} 
          title="缩放工具"
        >
          缩放
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveTool('rotate')} 
          title="旋转工具"
        >
          旋转
        </button>
      </div>

      <div className="toolbar-section">
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveTool('sticker')} 
          title="添加贴纸"
        >
          添加贴纸
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveTool('text')} 
          title="添加文字"
        >
          添加文字
        </button>
      </div>

      <div className="toolbar-section">
        <button className="btn btn-secondary" title="放大">
          +
        </button>
        <button className="btn btn-secondary" title="缩小">
          -
        </button>
        <button className="btn btn-secondary" title="重置视图">
          重置
        </button>
      </div>
    </div>
  );
};

export default CanvasToolbar;