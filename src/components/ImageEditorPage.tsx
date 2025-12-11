import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Upload, Slider, Input, Select, Modal, App } from 'antd';
import { 
  UploadOutlined, 
  ScissorOutlined, 
  SaveOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  RedoOutlined,
  DeleteOutlined,
  CloseOutlined,
  PlusOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import type { StickerContent } from '../types';

interface ImageEditorPageProps {
  onClose: () => void;
}

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const ImageEditorPage: React.FC<ImageEditorPageProps> = ({ onClose }) => {
  const { stickerLibraries, addStickerToLibrary } = useAppStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<'pan' | 'select'>('pan'); // 默认平移模式
  const [stickerName, setStickerName] = useState('');
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [isRemoveBgModalVisible, setIsRemoveBgModalVisible] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState(30);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { message } = App.useApp();

  useEffect(() => {
    if (stickerLibraries.length > 0 && !selectedLibraryId) {
      setSelectedLibraryId(stickerLibraries[0].id);
    }
  }, [stickerLibraries, selectedLibraryId]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageUrl(url);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setSelection(null);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制图片
    ctx.drawImage(originalImage, 0, 0);

    // 绘制选区（使用画布坐标系）
    if (selection) {
      const { startX, startY, endX, endY } = selection;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      
      // 绘制选区边框
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
      
      // 绘制半透明遮罩（选区外部变暗）
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(x, y, width, height);
      ctx.restore();
    }
  }, [originalImage, selection]);

  // 绘制画布 - 当图像或选区变化时
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.button === 0) { // 左键
      if (toolMode === 'select') {
        // 选区模式 - 计算在原始图像上的坐标
        const rect = canvas.getBoundingClientRect();
        
        // 鼠标相对于显示canvas的位置
        const displayX = e.clientX - rect.left;
        const displayY = e.clientY - rect.top;
        
        // 转换为原始canvas坐标（考虑显示尺寸与原始尺寸的比例）
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = displayX * scaleX;
        const y = displayY * scaleY;
        
        setIsSelecting(true);
        setSelectionStart({ x, y });
        setSelection({ startX: x, startY: y, endX: x, endY: y });
      } else {
        // 平移模式
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    } else if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // 中键或Shift+左键 - 强制平移
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };
  
  const handleCanvasClick = () => {
    if (!imageUrl) {
      // 点击画布上传图片
      document.getElementById('canvas-upload-input')?.click();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isSelecting) {
      // 计算当前鼠标位置的原始图像坐标
      const rect = canvas.getBoundingClientRect();
      
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = displayX * scaleX;
      const y = displayY * scaleY;
      
      setSelection({
        startX: selectionStart.x,
        startY: selectionStart.y,
        endX: x,
        endY: y,
      });
    } else if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    
    // 如果是选区模式且不是在拖拽选区，检查是否点击在选区外
    if (toolMode === 'select' && !isSelecting && selection && canvas) {
      const rect = canvas.getBoundingClientRect();
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = displayX * scaleX;
      const y = displayY * scaleY;
      
      // 检查点击位置是否在选区内
      const { startX, startY, endX, endY } = selection;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);
      
      // 如果点击在选区外，清空选区
      if (x < minX || x > maxX || y < minY || y > maxY) {
        setSelection(null);
      }
    }
    
    setIsSelecting(false);
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // 鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // 向下滚缩小，向上滚放大
    const newZoom = Math.max(0.1, Math.min(zoom * delta, 10));
    
    // 以鼠标位置为中心缩放
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // 计算缩放后的偏移，保持鼠标位置不变
      const scaleRatio = newZoom / zoom;
      const newOffsetX = mouseX - (mouseX - offset.x) * scaleRatio;
      const newOffsetY = mouseY - (mouseY - offset.y) * scaleRatio;
      
      setZoom(newZoom);
      setOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const handleRemoveBackground = () => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const bgColor = hexToRgb(backgroundColor);
    if (!bgColor) return;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const diff = Math.sqrt(
        Math.pow(r - bgColor.r, 2) +
        Math.pow(g - bgColor.g, 2) +
        Math.pow(b - bgColor.b, 2)
      );

      if (diff < tolerance) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    // 更新原始图片
    const newImg = new Image();
    newImg.onload = () => {
      setOriginalImage(newImg);
      message.success('背景已移除');
    };
    newImg.src = canvas.toDataURL('image/png');
    
    setIsRemoveBgModalVisible(false);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const handleDeleteSelection = () => {
    if (!selection || !canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { startX, startY, endX, endY } = selection;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // 清除选区内容
    ctx.clearRect(x, y, width, height);

    // 更新原始图片
    const newImg = new Image();
    newImg.onload = () => {
      setOriginalImage(newImg);
      setSelection(null);
      message.success('选区内容已删除');
    };
    newImg.src = canvas.toDataURL('image/png');
  };

  // 裁剪透明边缘，只保留有内容的区域
  const cropTransparentEdges = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    // 查找非透明像素的边界
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) { // 有像素内容
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 如果整个画布都是透明的，返回原画布
    if (minX > maxX || minY > maxY) {
      return canvas;
    }

    // 创建裁剪后的画布
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (croppedCtx) {
      croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
    }

    return croppedCanvas;
  };

  // 压缩图片函数 - 避免localStorage配额超限
  const compressImage = (canvas: HTMLCanvasElement, maxSize: number = 800, quality: number = 0.85): string => {
    // 1. 先裁剪透明边缘
    let processedCanvas = cropTransparentEdges(canvas);
    
    // 2. 如果图片尺寸超过限制，进行缩放
    if (processedCanvas.width > maxSize || processedCanvas.height > maxSize) {
      const scale = Math.min(maxSize / processedCanvas.width, maxSize / processedCanvas.height);
      const newWidth = Math.floor(processedCanvas.width * scale);
      const newHeight = Math.floor(processedCanvas.height * scale);
      
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = newWidth;
      scaledCanvas.height = newHeight;
      const ctx = scaledCanvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(processedCanvas, 0, 0, newWidth, newHeight);
      }
      processedCanvas = scaledCanvas;
    }
    
    // 3. 检查是否有透明像素
    const ctx = processedCanvas.getContext('2d');
    if (!ctx) return processedCanvas.toDataURL('image/png');
    
    const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    let hasTransparency = false;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255) {
        hasTransparency = true;
        break;
      }
    }
    
    // 4. 根据透明度选择格式
    if (hasTransparency) {
      // 有透明像素，使用PNG
      return processedCanvas.toDataURL('image/png');
    } else {
      // 无透明像素，使用JPEG压缩
      return processedCanvas.toDataURL('image/jpeg', quality);
    }
  };

  const handleAddSelectionToSticker = () => {
    if (!selection || !canvasRef.current || !originalImage) {
      message.error('请先创建选区');
      return;
    }

    if (!stickerName.trim()) {
      message.error('请输入贴纸名称');
      return;
    }

    if (!selectedLibraryId) {
      message.error('请选择目标贴纸库');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { startX, startY, endX, endY } = selection;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 1 || height < 1) {
      message.error('选区太小，请重新选择');
      return;
    }

    try {
      // 创建临时canvas提取选区（从原始图像提取，不包含选区遮罩效果）
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // 从原始图像提取选区，而不是从已经绘制了选区效果的canvas
      tempCtx.drawImage(originalImage, x, y, width, height, 0, 0, width, height);

      // 压缩图片
      const compressedDataUrl = compressImage(tempCanvas);
      
      const newSticker: StickerContent = {
        id: `sticker-${Date.now()}`,
        type: 'sticker',
        name: stickerName.trim(),
        visible: true,
        opacity: 1,
        position: { x: 0, y: 0 },
        size: { width, height },
        rotation: 0,
        zIndex: 0,
        content: compressedDataUrl,
      };

      addStickerToLibrary(selectedLibraryId, newSticker);
      message.success('选区已添加到贴纸库');
      setStickerName('');
      setSelection(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        message.error({
          content: '存储空间不足！建议：① 选择更小的区域 ② 删除一些旧贴纸 ③ 导出贴纸库后清空',
          duration: 8,
        });
      } else {
        message.error('保存失败：' + (error as Error).message);
      }
      console.error('保存贴纸失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-300 p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">图像编辑器 - 抠图工具</h2>
          <input 
            type="file" 
            id="canvas-upload-input" 
            accept="image/*" 
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} 
            style={{ display: 'none' }}
          />
          <Upload accept="image/*" beforeUpload={handleImageUpload} maxCount={1} showUploadList={false}>
            <Button icon={<UploadOutlined />} type="primary" size="small">上传图片</Button>
          </Upload>
        </div>
        <Button icon={<CloseOutlined />} onClick={onClose} size="small">
          关闭
        </Button>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧工具面板 */}
        <div className="w-64 bg-white border-r border-gray-300 p-3 overflow-y-auto space-y-3">
          {/* 工具选择 */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <h3 className="font-semibold mb-2 text-sm text-gray-800">工具模式</h3>
            <div className="flex gap-2">
              <Button 
                icon={<MenuUnfoldOutlined />}
                onClick={() => setToolMode('pan')}
                type={toolMode === 'pan' ? 'primary' : 'default'}
                size="small"
                className="flex-1"
              >
                平移
              </Button>
              <Button 
                icon={<PlusOutlined />}
                onClick={() => setToolMode('select')}
                type={toolMode === 'select' ? 'primary' : 'default'}
                size="small"
                className="flex-1"
              >
                选区
              </Button>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {toolMode === 'pan' ? '点击拖拽移动画布' : '拖拽创建矩形选区'}
            </div>
          </div>

          {/* 视图控制 */}
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <h3 className="font-semibold mb-2 text-sm text-gray-800">视图控制</h3>
            <div className="flex gap-1 mb-1">
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" className="flex-1">放大</Button>
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" className="flex-1">缩小</Button>
              <Button icon={<RedoOutlined />} onClick={handleResetZoom} size="small" className="flex-1">重置</Button>
            </div>
            <div className="text-xs text-gray-600">缩放: {(zoom * 100).toFixed(0)}%</div>
          </div>

          {/* 背景移除 */}
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <h3 className="font-semibold mb-2 text-sm text-gray-800">背景移除</h3>
            <Button 
              icon={<ScissorOutlined />} 
              onClick={() => setIsRemoveBgModalVisible(true)}
              block
              type="primary"
              size="small"
              disabled={!imageUrl}
            >
              按容差删除背景色
            </Button>
          </div>

          {/* 选区操作 */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <h3 className="font-semibold mb-2 text-sm text-gray-800">选区操作</h3>
            <div className="space-y-2">
              {/* 贴纸名称 */}
              <div>
                <label className="text-xs mb-1 block text-gray-700">贴纸名称</label>
                <Input
                  value={stickerName}
                  onChange={(e) => setStickerName(e.target.value)}
                  placeholder="输入贴纸名称"
                  size="small"
                  disabled={!selection}
                />
              </div>
              
              {/* 目标贴纸库 */}
              <div>
                <label className="text-xs mb-1 block text-gray-700">目标贴纸库</label>
                <Select
                  value={selectedLibraryId}
                  onChange={setSelectedLibraryId}
                  className="w-full"
                  size="small"
                  disabled={!selection}
                  options={stickerLibraries.map(lib => ({
                    label: lib.name,
                    value: lib.id
                  }))}
                />
              </div>

              {/* 贴纸库预览 */}
              {selectedLibraryId && stickerLibraries.find(lib => lib.id === selectedLibraryId) && (
                <div className="bg-white border border-gray-200 rounded p-2">
                  <div className="text-xs text-gray-600 mb-1">
                    {stickerLibraries.find(lib => lib.id === selectedLibraryId)?.name}
                  </div>
                  <div className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto">
                    {stickerLibraries
                      .find(lib => lib.id === selectedLibraryId)
                      ?.stickers.map(sticker => (
                        <div 
                          key={sticker.id} 
                          className="aspect-square bg-gray-50 border border-gray-200 rounded overflow-hidden"
                          title={sticker.name}
                        >
                          <img 
                            src={(sticker as StickerContent).content} 
                            alt={sticker.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    共 {stickerLibraries.find(lib => lib.id === selectedLibraryId)?.stickers.length || 0} 个贴纸
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <Button 
                icon={<SaveOutlined />}
                onClick={handleAddSelectionToSticker}
                block
                type="primary"
                size="small"
                disabled={!selection || !stickerName.trim() || !selectedLibraryId}
              >
                保存选区为贴纸
              </Button>
              <Button 
                icon={<DeleteOutlined />}
                onClick={handleDeleteSelection}
                block
                danger
                size="small"
                disabled={!selection}
              >
                删除选区内容
              </Button>
              <Button 
                onClick={() => setSelection(null)}
                block
                size="small"
                disabled={!selection}
              >
                取消选区
              </Button>
            </div>
          </div>
        </div>

        {/* 中间画布区域 */}
        <div 
          ref={containerRef}
          className="flex-1 bg-gray-200 flex items-center justify-center overflow-hidden relative"
          style={{
            backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
        >
          {imageUrl ? (
            <div
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                cursor: isPanning ? 'grabbing' : (toolMode === 'select' ? 'crosshair' : 'grab'),
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  maxWidth: 'none',
                  display: 'block',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-600 cursor-pointer hover:text-blue-600 transition-colors">
              <UploadOutlined style={{ fontSize: 64 }} />
              <p className="mt-4 text-lg font-medium">点击此处或顶部按钮上传图片</p>
              <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG、GIF 等格式</p>
            </div>
          )}
        </div>
      </div>

      {/* 容差删除背景色弹窗 */}
      <Modal
        title="按容差删除背景色"
        open={isRemoveBgModalVisible}
        onCancel={() => setIsRemoveBgModalVisible(false)}
        footer={null}
        mask={false}
        style={{ position: 'absolute', right: 20, top: 80 }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">背景颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-10 rounded cursor-pointer border"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">容差 (0-100): {tolerance}</label>
            <Slider
              min={0}
              max={100}
              value={tolerance}
              onChange={setTolerance}
            />
            <div className="text-xs text-gray-500 mt-1">
              容差越大，移除的颜色范围越广
            </div>
          </div>

          <Button
            type="primary"
            icon={<ScissorOutlined />}
            onClick={handleRemoveBackground}
            block
          >
            移除背景
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ImageEditorPage;

