import React, { useEffect, useState } from 'react';
import useAppStore from '../store/useAppStore';
import CanvasToolbar from './CanvasToolbar';
import LayerCanvas from './LayerCanvas';

interface CanvasContainerProps {
  onOpenImageEditor: () => void;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ onOpenImageEditor }) => {
  const { canvasData, createCanvas, zoomLevel } = useAppStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // 默认创建一个画布
  useEffect(() => {
    if (!canvasData) {
      createCanvas(800, 600, '默认画布');
    }
  }, [canvasData, createCanvas]);

  // 处理拖拽进入画布区域
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  // 处理拖拽释放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    // 注意：实际的拖拽处理逻辑在 LayerCanvas 中
    // 这里只是作为备用，通常不会被触发（因为 LayerCanvas 会阻止冒泡）
  };

  if (!canvasData) {
    return <div className="canvas-container">加载中...</div>;
  }

  return (
    <div className="canvas-container flex-1 flex flex-col bg-gray-100 min-w-0">
      <CanvasToolbar onOpenImageEditor={onOpenImageEditor} />
      <div className="canvas-workspace flex-1 overflow-auto p-4">
        <div className="flex items-center justify-center min-h-full">
          <div 
            className="canvas-wrapper inline-block"
            style={{
              padding: '20px',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="canvas"
              style={{
                width: `${canvasData.canvasSettings.width}px`,
                height: `${canvasData.canvasSettings.height}px`,
                background: canvasData.canvasSettings.background,
                position: 'relative',
                border: isDraggingOver ? '2px solid #3b82f6' : '2px solid #ddd',
                boxShadow: isDraggingOver ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <LayerCanvas />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasContainer;