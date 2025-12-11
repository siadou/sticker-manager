import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Upload, Slider, message, Input, Select } from 'antd';
import { UploadOutlined, ScissorOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import useAppStore from '../store/useAppStore';
import type { StickerContent } from '../types';

interface ImageEditorProps {
  visible: boolean;
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ visible, onClose }) => {
  const { stickerLibraries, addStickerToLibrary } = useAppStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [stickerName, setStickerName] = useState('');
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (stickerLibraries.length > 0 && !selectedLibraryId) {
      setSelectedLibraryId(stickerLibraries[0].id);
    }
  }, [stickerLibraries, selectedLibraryId]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
      setProcessedImageUrl(url);
      setImageLoaded(true);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const removeBackground = () => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 解析背景颜色
      const bgColor = hexToRgb(backgroundColor);
      if (!bgColor) return;

      // 移除背景色
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 计算颜色差异
        const diff = Math.sqrt(
          Math.pow(r - bgColor.r, 2) +
          Math.pow(g - bgColor.g, 2) +
          Math.pow(b - bgColor.b, 2)
        );

        // 如果颜色差异小于容差，则设置为透明
        if (diff < tolerance) {
          data[i + 3] = 0; // 设置alpha为0
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // 裁剪到非透明区域
      const croppedCanvas = cropToContent(canvas);
      const processedUrl = croppedCanvas.toDataURL('image/png');
      setProcessedImageUrl(processedUrl);
      message.success('背景已移除');
    };
    img.src = imageUrl;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const cropToContent = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    // 找到非透明像素的边界
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // 创建裁剪后的canvas
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (croppedCtx) {
      croppedCtx.drawImage(
        canvas,
        minX, minY, width, height,
        0, 0, width, height
      );
    }

    return croppedCanvas;
  };

  const handleSaveSticker = () => {
    if (!processedImageUrl) {
      message.error('请先处理图片');
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

    // 获取处理后图片的尺寸
    const img = new Image();
    img.onload = () => {
      const newSticker: StickerContent = {
        id: `sticker-${Date.now()}`,
        type: 'sticker',
        name: stickerName.trim(),
        visible: true,
        opacity: 1,
        position: { x: 0, y: 0 },
        size: { width: img.width, height: img.height },
        rotation: 0,
        zIndex: 0,
        content: processedImageUrl,
      };

      addStickerToLibrary(selectedLibraryId, newSticker);
      message.success('贴纸已保存到贴纸库');
      
      // 重置状态
      setImageUrl(null);
      setProcessedImageUrl(null);
      setStickerName('');
      setImageLoaded(false);
      onClose();
    };
    img.src = processedImageUrl;
  };

  const handleReset = () => {
    setImageUrl(null);
    setProcessedImageUrl(null);
    setStickerName('');
    setTolerance(30);
    setBackgroundColor('#ffffff');
    setImageLoaded(false);
  };

  return (
    <Modal
      title="图像编辑器 - 抠图工具"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div className="image-editor space-y-4">
        {/* 上传图片 */}
        <div className="upload-section">
          <Upload
            accept="image/*"
            beforeUpload={handleImageUpload}
            maxCount={1}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </div>

        {/* 图片预览和canvas */}
        {imageLoaded && (
          <>
            <div className="preview-section grid grid-cols-2 gap-4">
              <div className="original-image">
                <h4 className="text-sm font-semibold mb-2">原始图片</h4>
                <div className="border rounded p-2 bg-gray-50 flex items-center justify-center" style={{ minHeight: '200px' }}>
                  {imageUrl && <img src={imageUrl} alt="原图" className="max-w-full max-h-64 object-contain" />}
                </div>
              </div>
              <div className="processed-image">
                <h4 className="text-sm font-semibold mb-2">处理后图片</h4>
                <div className="border rounded p-2 bg-gray-50 flex items-center justify-center" style={{ minHeight: '200px', backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                  {processedImageUrl && <img src={processedImageUrl} alt="处理后" className="max-w-full max-h-64 object-contain" />}
                </div>
              </div>
            </div>

            {/* 抠图设置 */}
            <div className="settings-section space-y-3">
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
              </div>

              <Button
                type="primary"
                icon={<ScissorOutlined />}
                onClick={removeBackground}
                block
              >
                移除背景
              </Button>
            </div>

            {/* 保存设置 */}
            <div className="save-section space-y-3 border-t pt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">贴纸名称</label>
                <Input
                  value={stickerName}
                  onChange={(e) => setStickerName(e.target.value)}
                  placeholder="输入贴纸名称"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">保存到贴纸库</label>
                <Select
                  value={selectedLibraryId}
                  onChange={setSelectedLibraryId}
                  className="w-full"
                  options={stickerLibraries.map(lib => ({
                    label: lib.name,
                    value: lib.id
                  }))}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveSticker}
                  className="flex-1"
                  disabled={!processedImageUrl || !stickerName.trim()}
                >
                  保存为贴纸
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>
          </>
        )}

        {/* 隐藏的canvas用于处理 */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </Modal>
  );
};

export default ImageEditor;

