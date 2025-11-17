import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import CanvasToolbar from './CanvasToolbar';
import LayerCanvas from './LayerCanvas';

const CanvasContainer: React.FC = () => {
  const { canvasData, createCanvas } = useAppStore();


  // 默认创建一个画布
  useEffect(() => {
    if (!canvasData) {
      createCanvas(1024, 768, '默认画布');
    }
  }, [canvasData, createCanvas]);

  if (!canvasData) {
    return <div className="canvas-container">加载中...</div>;
  }

  return (
    <div className="canvas-container">
      <CanvasToolbar />
      <div className="canvas-workspace">
        <div className="canvas-area">
          <div
            className="canvas"
            style={{
              width: `${canvasData.canvasSettings.width}px`,
              height: `${canvasData.canvasSettings.height}px`,
              background: canvasData.canvasSettings.background,
              position: 'relative',
              border: '1px solid #ccc',
            }}
          >
            <LayerCanvas />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasContainer;