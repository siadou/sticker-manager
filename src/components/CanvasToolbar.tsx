import React, { useState } from 'react';
import { Modal, Form, Input, Button, InputNumber, Select, Tooltip, Divider, Space } from 'antd';
import type { FormProps } from 'antd';

import { 
  FileAddOutlined, 
  FolderOpenOutlined, 
  SaveOutlined, 
  FontSizeOutlined, 
  RedoOutlined,
  ExportOutlined,
  ScissorOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import useAppStore from '../store/useAppStore';
import type { TextContent } from '../types';

interface CanvasToolbarProps {
  onOpenImageEditor: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onOpenImageEditor }) => {
  const { createCanvas, canvasData, zoomIn, zoomOut, resetZoom, addLayer, toggleRightSidebar, isRightSidebarOpen } = useAppStore();
  const [isNewCanvasModalVisible, setIsNewCanvasModalVisible] = useState(false);
  const [form] = Form.useForm<{ width: number; height: number; name: string }>();

  // 预设画布尺寸
  const presetSizes = {
    'A4': { width: 2480, height: 3508, label: 'A4 (210×297mm, 300dpi)' },
    'A4-landscape': { width: 3508, height: 2480, label: 'A4 横向 (297×210mm, 300dpi)' },
    'A5': { width: 1748, height: 2480, label: 'A5 (148×210mm, 300dpi)' },
    'A5-landscape': { width: 2480, height: 1748, label: 'A5 横向 (210×148mm, 300dpi)' },
    '1024x768': { width: 1024, height: 768, label: '1024×768 (标准)' },
    '1920x1080': { width: 1920, height: 1080, label: '1920×1080 (Full HD)' },
    'custom': { width: 1024, height: 768, label: '自定义' },
  };

  const showNewCanvasModal = () => {
    setIsNewCanvasModalVisible(true);
    form.setFieldsValue({ width: 1024, height: 768, name: '未命名画布' });
  };

  const handlePresetChange = (preset: string) => {
    const size = presetSizes[preset as keyof typeof presetSizes];
    if (size) {
      form.setFieldsValue({ width: size.width, height: size.height });
    }
  };

  const handleNewCanvas: FormProps<{ width: number; height: number; name: string }>['onFinish'] = (values) => {
    const width = values.width;
    const height = values.height;
    const name = values.name?.trim() || undefined;

    if (!isNaN(width) && !isNaN(height)) {
      createCanvas(width, height, name);
      setIsNewCanvasModalVisible(false);
    }
  };

  // 打开画布功能
  const handleOpenCanvas = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const canvasData = JSON.parse(event.target?.result as string);
            // 这里需要调用store中的openCanvas方法
            // 由于useAppStore中的openCanvas方法还没有实现，我们可以直接替换当前画布数据
            useAppStore.setState({ canvasData });
          } catch (error) {
            alert('导入失败：无效的JSON文件');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 保存画布功能
  const handleSaveCanvas = () => {
    if (!canvasData) {
      alert('没有可保存的画布数据');
      return;
    }

    const dataStr = JSON.stringify(canvasData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${canvasData.name || '未命名画布'}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 添加文字元素功能
  const handleAddText = () => {
    if (!canvasData) {
      alert('请先创建画布');
      return;
    }

    const newTextLayer: TextContent = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: '文字图层',
      visible: true,
      opacity: 1,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      rotation: 0,
      zIndex: canvasData.layers.length,
      content: '双击编辑文字',
      font: "'AlimamaFangYuanTi', sans-serif",
      fontSize: 24,
      fontWeight: 900,
      color: '#000000',
      alignment: 'center',
      lineHeight: 1.2,
    };

    addLayer(newTextLayer);
  };

  // 导出画布为图片
  const handleExportImage = async () => {
    if (!canvasData) {
      alert('没有可导出的画布');
      return;
    }

    try {
      // 创建一个临时canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasData.canvasSettings.width;
      canvas.height = canvasData.canvasSettings.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        alert('无法创建画布上下文');
        return;
      }

      // 绘制背景
      ctx.fillStyle = canvasData.canvasSettings.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 按zIndex排序图层
      const sortedLayers = [...canvasData.layers].sort((a, b) => a.zIndex - b.zIndex);

      // 绘制所有可见图层
      for (const layer of sortedLayers) {
        if (!layer.visible) continue;

        ctx.save();
        ctx.globalAlpha = layer.opacity;

        // 应用变换
        ctx.translate(layer.position.x + layer.size.width / 2, layer.position.y + layer.size.height / 2);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-layer.size.width / 2, -layer.size.height / 2);

        if (layer.type === 'sticker') {
          // 绘制贴纸
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, layer.size.width, layer.size.height);
              resolve();
            };
            img.onerror = reject;
            img.src = (layer as any).content;
          });
        } else if (layer.type === 'text') {
          // 绘制文字
          const textLayer = layer as any;
          ctx.font = `${textLayer.fontWeight || 400} ${textLayer.fontSize}px ${textLayer.font}`;
          ctx.fillStyle = textLayer.color;
          ctx.textAlign = textLayer.alignment;
          ctx.textBaseline = 'top';

          const lines = textLayer.content.split('\n');
          const lineHeight = textLayer.fontSize * textLayer.lineHeight;
          
          lines.forEach((line: string, index: number) => {
            let x = 0;
            if (textLayer.alignment === 'center') x = layer.size.width / 2;
            else if (textLayer.alignment === 'right') x = layer.size.width;
            
            ctx.fillText(line, x, index * lineHeight);
          });
        }

        ctx.restore();
      }

      // 导出为PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('导出失败');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${canvasData.name || '画布'}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('导出图片失败:', error);
      alert('导出图片失败，请检查图片资源是否可访问');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm select-none">
      {/* 左侧：文件操作 */}
      <div className="flex items-center gap-2">
        <Space size={4}>
          <Tooltip title="新建画布">
            <Button 
              icon={<FileAddOutlined />} 
              onClick={showNewCanvasModal}
            >
              新建
            </Button>
          </Tooltip>
          <Tooltip title="打开画布文件 (.json)">
            <Button 
              icon={<FolderOpenOutlined />} 
              onClick={handleOpenCanvas}
            >
              打开
            </Button>
          </Tooltip>
          <Tooltip title="保存为文件 (.json)">
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSaveCanvas}
            >
              保存
            </Button>
          </Tooltip>
        </Space>
        
        <Divider type="vertical" className="h-6 mx-2" />
        
        <Tooltip title="导出为图片 (.png)">
          <Button 
            type="primary"
            icon={<ExportOutlined />} 
            onClick={handleExportImage}
            className="bg-green-600 hover:bg-green-500 border-green-600 hover:border-green-500"
          >
            导出图片
          </Button>
        </Tooltip>
      </div>

      {/* 中间：核心工具 */}
      <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
        <Space size={8}>
          <Tooltip title="智能抠图工具">
            <Button 
              type="primary"
              icon={<ScissorOutlined />} 
              onClick={onOpenImageEditor}
              className="bg-purple-600 hover:bg-purple-500 border-purple-600 hover:border-purple-500 h-9 px-4"
            >
              抠图工具
            </Button>
          </Tooltip>
          <Tooltip title="添加文字图层">
            <Button 
              icon={<FontSizeOutlined />} 
              onClick={handleAddText}
              className="h-9 px-4"
            >
              添加文字
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* 右侧：视图控制 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Tooltip title="放大 (Zoom In)">
            <Button 
              type="text" 
              size="small" 
              icon={<ZoomInOutlined />} 
              onClick={() => zoomIn()} 
            />
          </Tooltip>
          <Divider type="vertical" className="h-4 mx-1" />
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(useAppStore.getState().zoomLevel * 100)}%</span>
          <Divider type="vertical" className="h-4 mx-1" />
          <Tooltip title="缩小 (Zoom Out)">
            <Button 
              type="text" 
              size="small" 
              icon={<ZoomOutOutlined />} 
              onClick={() => zoomOut()} 
            />
          </Tooltip>
          <Tooltip title="重置视图 (100%)">
            <Button 
              type="text" 
              size="small" 
              icon={<RedoOutlined />} 
              onClick={() => resetZoom()} 
            />
          </Tooltip>
        </div>

        <Divider type="vertical" className="h-6 mx-2" />

        <Tooltip title={isRightSidebarOpen ? '隐藏属性面板' : '显示属性面板'}>
          <Button 
            type={isRightSidebarOpen ? 'primary' : 'default'}
            icon={isRightSidebarOpen ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
            onClick={toggleRightSidebar}
          />
        </Tooltip>
      </div>
        
      <Modal
        title="新建画布"
        open={isNewCanvasModalVisible}
        onCancel={() => setIsNewCanvasModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleNewCanvas}
        >
          <Form.Item
            label="预设尺寸"
          >
            <Select 
              defaultValue="1024x768" 
              onChange={handlePresetChange}
              options={Object.entries(presetSizes).map(([key, value]) => ({
                label: value.label,
                value: key
              }))}
            />
          </Form.Item>
          <Space className="w-full" align="baseline">
            <Form.Item
              name="width"
              label="宽度 (px)"
              rules={[{ required: true, message: '请输入宽度' }]}
            >
              <InputNumber min={1} placeholder="宽度" />
            </Form.Item>
            <Form.Item
              name="height"
              label="高度 (px)"
              rules={[{ required: true, message: '请输入高度' }]}
            >
              <InputNumber min={1} placeholder="高度" />
            </Form.Item>
          </Space>
          <Form.Item
            name="name"
            label="画布名称"
          >
            <Input placeholder="输入画布名称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建画布
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CanvasToolbar;