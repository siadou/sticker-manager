import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { type LayerData, type StickerContent, type TextContent, type Size, type Position } from '../types';
import { StickerLayer } from './layers/StickerLayer';
import { TextLayer } from './layers/TextLayer';

const LayerCanvas: React.FC = () => {
  const { canvasData, selectedLayerId, selectLayer, updateLayer, addLayer, zoomLevel } = useAppStore();
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  if (!canvasData) {
    return null;
  }

  // 处理文字双击编辑
  const handleTextDoubleClick = (layer: LayerData) => {
    if (layer.type === 'text') {
      const textLayer = layer as TextContent;
      setEditingTextId(layer.id);
      setEditingText(textLayer.content);
    }
  };

  // 保存文字编辑
  const handleTextBlur = () => {
    if (editingTextId) {
      updateLayer(editingTextId, { content: editingText } as Partial<TextContent>);
      setEditingTextId(null);
      setEditingText('');
    }
  };

  // 根据zIndex排序图层
  const sortedLayers = [...canvasData.layers].sort((a, b) => a.zIndex - b.zIndex);

  const handleLayerClick = (layerId: string) => {
    selectLayer(layerId);
  };

  // 处理画布上图层的拖拽移动
  const handleLayerDragStart = (e: React.DragEvent, layer: LayerData) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // 计算鼠标在图层中的偏移（缩放后的像素坐标）
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // 将偏移量转换为实际画布坐标（除以缩放比例）
    setDragOffset({ x: offsetX / zoomLevel, y: offsetY / zoomLevel });
    
    // 创建自定义的拖拽预览图像（考虑缩放）
    try {
      // 克隆元素作为拖拽预览
      const dragImage = target.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      dragImage.style.left = '-9999px';
      dragImage.style.width = `${layer.size.width * zoomLevel}px`;
      dragImage.style.height = `${layer.size.height * zoomLevel}px`;
      dragImage.style.pointerEvents = 'none';
      
      document.body.appendChild(dragImage);
      
      // 设置自定义拖拽图像，偏移量也需要考虑缩放
      e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
      
      // 拖拽结束后移除临时元素
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    } catch (error) {
      console.warn('设置拖拽预览失败:', error);
    }
    
    e.dataTransfer.setData('layerId', layer.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 不要加onDragOver!!!,父元素处理了onDragOver, 再次preventDefault会阻止drop事件

  const handleLayerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 必须阻止冒泡，防止重复处理
    
    // 尝试获取图层ID（现有图层的移动）
    const layerId = e.dataTransfer.getData('layerId');
    
    // 尝试获取贴纸数据（从贴纸库拖拽新贴纸）
    const stickerData = e.dataTransfer.getData('stickerData');
    
    if (layerId) {
      // 处理现有图层的移动
      const canvasRect = e.currentTarget.getBoundingClientRect();
      // 将屏幕坐标转换为画布坐标（考虑缩放）
      const mouseX = (e.clientX - canvasRect.left) / zoomLevel;
      const mouseY = (e.clientY - canvasRect.top) / zoomLevel;
      // 减去拖拽偏移量得到图层的新位置
      const x = mouseX - dragOffset.x;
      const y = mouseY - dragOffset.y;
      
      updateLayer(layerId, { position: { x, y } });
    } else if (stickerData && canvasData) {
      // 处理从贴纸库添加新贴纸
      try {
        const sticker: StickerContent = JSON.parse(stickerData);
        const canvasRect = e.currentTarget.getBoundingClientRect();
        
        // 计算相对于画布的坐标（考虑缩放）
        const x = (e.clientX - canvasRect.left) / zoomLevel - (sticker.size?.width || 100) / 2;
        const y = (e.clientY - canvasRect.top) / zoomLevel - (sticker.size?.height || 100) / 2;
        
        // 创建新的图层
        const newLayer: StickerContent = {
          id: `layer-${Date.now()}`,
          type: 'sticker',
          name: sticker.name || '贴纸',
          visible: true,
          opacity: 1,
          position: { x: Math.max(0, x), y: Math.max(0, y) },
          size: { width: sticker.size?.width || 100, height: sticker.size?.height || 100 },
          rotation: 0,
          zIndex: canvasData.layers.length,
          content: sticker.content,
        };
        
        addLayer(newLayer);
      } catch (error) {
        console.error('解析贴纸数据失败:', error);
      }
    }
  };

  // 处理图层缩放
  const handleResize = (id: string, newSize: Size, newPosition: Position) => {
    updateLayer(id, { size: newSize, position: newPosition });
  };

  const renderLayer = (layer: LayerData) => {
    const isSelected = layer.id === selectedLayerId;

    if (layer.type === 'sticker') {
      return (
        <StickerLayer
          key={layer.id}
          layer={layer as StickerContent}
          isSelected={isSelected}
          zoomLevel={zoomLevel}
          onResize={handleResize}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleLayerClick(layer.id);
          }}
          onDragStart={(e) => handleLayerDragStart(e, layer)}
        />
      );
    }

    if (layer.type === 'text') {
      return (
        <TextLayer
          key={layer.id}
          layer={layer as TextContent}
          isSelected={isSelected}
          zoomLevel={zoomLevel}
          onResize={handleResize}
          onUpdate={(id, updates) => updateLayer(id, updates)}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleLayerClick(layer.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleTextDoubleClick(layer);
          }}
          onDragStart={(e) => handleLayerDragStart(e, layer)}
          isEditing={editingTextId === layer.id}
          onBlur={handleTextBlur}
          setEditingText={setEditingText}
          editingText={editingText}
        />
      );
    }

    return null;
  };

  return (
    <div 
      className="layer-canvas w-full h-full relative"
      onDrop={handleLayerDrop}
      onMouseDown={() => selectLayer(null)}
    >
      {sortedLayers.map(renderLayer)}
    </div>
  );
};

export default LayerCanvas;