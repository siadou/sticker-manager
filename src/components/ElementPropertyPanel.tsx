import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { type LayerData, type TextContent } from '../types';

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
      <div className="bg-white rounded border border-gray-200 p-2">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">元素属性</h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-xs mb-1">未选择任何元素</p>
          <p className="text-xs text-gray-400">在画布或图层列表中选择元素</p>
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
    <div className="bg-white rounded border border-gray-200 p-2">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">元素属性</h3>
      
      <div className="space-y-2">
        <div className="property-group border-b border-gray-200 pb-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">位置</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">X:</label>
          <input
            type="number"
            value={layer.position.x}
            onChange={(e) => handlePositionChange('x', e.target.value)}
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
            <div>
              <label className="text-xs text-gray-600">Y:</label>
          <input
            type="number"
            value={layer.position.y}
            onChange={(e) => handlePositionChange('y', e.target.value)}
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
            </div>
        </div>
      </div>
      
        <div className="property-group border-b border-gray-200 pb-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">尺寸</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">宽度:</label>
          <input
            type="number"
            value={layer.size.width}
            onChange={(e) => handleSizeChange('width', e.target.value)}
            min="1"
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
            <div>
              <label className="text-xs text-gray-600">高度:</label>
          <input
            type="number"
            value={layer.size.height}
            onChange={(e) => handleSizeChange('height', e.target.value)}
            min="1"
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={layer.lockAspectRatio !== false}
              onChange={(e) => updateLayer(layer.id, { lockAspectRatio: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-xs text-gray-600">锁定长宽比</label>
        </div>
      </div>
      
        <div className="property-group border-b border-gray-200 pb-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">变换</h4>
          <div>
            <label className="text-xs text-gray-600">旋转:</label>
            <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            value={layer.rotation}
            onChange={(e) => handleRotationChange(e.target.value)}
            min="0"
            max="360"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
              <span className="text-sm text-gray-600">°</span>
            </div>
        </div>
      </div>
      
        <div className="property-group border-b border-gray-200 pb-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">外观</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">透明度:</label>
          <input
            type="number"
            value={layer.opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            min="0"
            max="1"
            step="0.1"
                className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
            <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={(e) => handleVisibilityChange(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
              <label className="text-xs text-gray-600">可见</label>
      </div>
          </div>
        </div>
      
      {/* 文字特定属性 */}
      {layer.type === 'text' && (
          <div className="property-group">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">文字属性</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">内容:</label>
                <textarea
              value={(layer as TextContent).content}
              onChange={(e) => updateLayer(layer.id, { content: e.target.value } as Partial<TextContent>)}
                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
            />
          </div>
              <div>
                <label className="text-xs text-gray-600">字体:</label>
                <select
                  value={(layer as TextContent).font}
                  onChange={(e) => updateLayer(layer.id, { font: e.target.value } as Partial<TextContent>)}
                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'AlimamaFangYuanTi', sans-serif">阿里妈妈方圆体</option>
                  <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                  <option value="'SimHei', sans-serif">黑体</option>
                  <option value="'SimSun', serif">宋体</option>
                </select>
          </div>
              <div>
                <label className="text-xs text-gray-600">字体大小:</label>
                <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              value={(layer as TextContent).fontSize}
              onChange={(e) => updateLayer(layer.id, { fontSize: parseInt(e.target.value) } as Partial<TextContent>)}
              min="1"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  <span className="text-sm text-gray-600">px</span>
                </div>
          </div>
              <div>
                <label className="text-xs text-gray-600">字体粗细:</label>
                <select
                  value={(layer as TextContent).fontWeight}
                  onChange={(e) => updateLayer(layer.id, { fontWeight: parseInt(e.target.value) } as Partial<TextContent>)}
                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="100">100 - Thin</option>
                  <option value="200">200 - Extra Light</option>
                  <option value="300">300 - Light</option>
                  <option value="400">400 - Normal</option>
                  <option value="500">500 - Medium</option>
                  <option value="600">600 - Semi Bold</option>
                  <option value="700">700 - Bold</option>
                  <option value="800">800 - Extra Bold</option>
                  <option value="900">900 - Black</option>
                </select>
          </div>
              <div>
                <label className="text-xs text-gray-600">颜色:</label>
            <input
              type="color"
              value={(layer as TextContent).color}
              onChange={(e) => updateLayer(layer.id, { color: e.target.value } as Partial<TextContent>)}
                  className="w-full mt-1 h-10 px-1 py-1 border border-gray-300 rounded cursor-pointer"
            />
          </div>
              <div>
                <label className="text-xs text-gray-600">对齐方式:</label>
            <select
              value={(layer as TextContent).alignment}
              onChange={(e) => updateLayer(layer.id, { alignment: e.target.value as 'left' | 'center' | 'right' } as Partial<TextContent>)}
                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
              <div>
                <label className="text-xs text-gray-600">行高:</label>
            <input
              type="number"
              value={(layer as TextContent).lineHeight}
              onChange={(e) => updateLayer(layer.id, { lineHeight: parseFloat(e.target.value) } as Partial<TextContent>)}
              min="0.1"
              step="0.1"
                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ElementPropertyPanel;