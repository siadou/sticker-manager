import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { type LayerData, type StickerContent, type TextContent } from '../types';

const ElementPropertyPanel: React.FC = () => {
  const { canvasData, selectedLayerId, updateLayer } = useAppStore();
  const [layer, setLayer] = useState<LayerData | null>(null);

  // 当选中图层变化时更新本地状态
  useEffect(() => {
    if (!canvasData || !selectedLayerId) {
      setLayer(null);
      return;
    }

    const foundLayer = canvasData.layers.find(l => l.id === selectedLayerId);
    setLayer(foundLayer || null);
  }, [canvasData, selectedLayerId]);

  if (!layer) {
    return (
      <div className="element-property-panel">
        <h3>元素属性</h3>
        <div className="no-selection">
          <p>未选择任何元素</p>
          <p>在画布或图层列表中选择一个元素以编辑其属性</p>
        </div>
      </div>
    );
  }

  // 处理位置更新
  const handlePositionChange = (key: 'x' | 'y', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateLayer(layer.id, { position: { ...layer.position, [key]: numValue } });
    }
  };

  // 处理尺寸更新
  const handleSizeChange = (key: 'width' | 'height', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateLayer(layer.id, { size: { ...layer.size, [key]: numValue } });
    }
  };

  // 处理旋转更新
  const handleRotationChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateLayer(layer.id, { rotation: numValue });
    }
  };

  // 处理透明度更新
  const handleOpacityChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      updateLayer(layer.id, { opacity: numValue });
    }
  };

  // 处理可见性更新
  const handleVisibilityChange = (value: boolean) => {
    updateLayer(layer.id, { visible: value });
  };

  return (
    <div className="element-property-panel">
      <h3>元素属性</h3>
      
      <div className="property-group">
        <h4>位置</h4>
        <div className="property-row">
          <label>X:</label>
          <input
            type="number"
            value={layer.position.x}
            onChange={(e) => handlePositionChange('x', e.target.value)}
          />
        </div>
        <div className="property-row">
          <label>Y:</label>
          <input
            type="number"
            value={layer.position.y}
            onChange={(e) => handlePositionChange('y', e.target.value)}
          />
        </div>
      </div>
      
      <div className="property-group">
        <h4>尺寸</h4>
        <div className="property-row">
          <label>宽度:</label>
          <input
            type="number"
            value={layer.size.width}
            onChange={(e) => handleSizeChange('width', e.target.value)}
            min="1"
          />
        </div>
        <div className="property-row">
          <label>高度:</label>
          <input
            type="number"
            value={layer.size.height}
            onChange={(e) => handleSizeChange('height', e.target.value)}
            min="1"
          />
        </div>
      </div>
      
      <div className="property-group">
        <h4>变换</h4>
        <div className="property-row">
          <label>旋转:</label>
          <input
            type="number"
            value={layer.rotation}
            onChange={(e) => handleRotationChange(e.target.value)}
            min="0"
            max="360"
          />
          <span>°</span>
        </div>
      </div>
      
      <div className="property-group">
        <h4>外观</h4>
        <div className="property-row">
          <label>透明度:</label>
          <input
            type="number"
            value={layer.opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            min="0"
            max="1"
            step="0.1"
          />
        </div>
        <div className="property-row">
          <label>可见:</label>
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={(e) => handleVisibilityChange(e.target.checked)}
          />
        </div>
      </div>
      
      {/* 贴纸特定属性 */}
      {layer.type === 'sticker' && (
        <div className="property-group sticker-properties">
          <h4>贴纸属性</h4>
          <div className="property-row">
            <label>图片URL:</label>
            <input
              type="text"
              value={(layer as StickerContent).content}
              onChange={(e) => updateLayer(layer.id, { content: e.target.value } as Partial<StickerContent>)}
            />
          </div>
        </div>
      )}
      
      {/* 文字特定属性 */}
      {layer.type === 'text' && (
        <div className="property-group text-properties">
          <h4>文字属性</h4>
          <div className="property-row">
            <label>内容:</label>
            <input
              type="text"
              value={(layer as TextContent).content}
              onChange={(e) => updateLayer(layer.id, { content: e.target.value } as Partial<TextContent>)}
            />
          </div>
          <div className="property-row">
            <label>字体:</label>
            <input
              type="text"
              value={(layer as TextContent).font}
              onChange={(e) => updateLayer(layer.id, { font: e.target.value } as Partial<TextContent>)}
            />
          </div>
          <div className="property-row">
            <label>字体大小:</label>
            <input
              type="number"
              value={(layer as TextContent).fontSize}
              onChange={(e) => updateLayer(layer.id, { fontSize: parseInt(e.target.value) } as Partial<TextContent>)}
              min="1"
            />
            <span>px</span>
          </div>
          <div className="property-row">
            <label>颜色:</label>
            <input
              type="color"
              value={(layer as TextContent).color}
              onChange={(e) => updateLayer(layer.id, { color: e.target.value } as Partial<TextContent>)}
            />
          </div>
          <div className="property-row">
            <label>对齐方式:</label>
            <select
              value={(layer as TextContent).alignment}
              onChange={(e) => updateLayer(layer.id, { alignment: e.target.value as 'left' | 'center' | 'right' } as Partial<TextContent>)}
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
          <div className="property-row">
            <label>行高:</label>
            <input
              type="number"
              value={(layer as TextContent).lineHeight}
              onChange={(e) => updateLayer(layer.id, { lineHeight: parseFloat(e.target.value) } as Partial<TextContent>)}
              min="0.1"
              step="0.1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementPropertyPanel;