import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import type { FormProps } from 'antd';
import { DeleteOutlined, FileAddOutlined, ExportOutlined } from '@ant-design/icons';

import useAppStore from '../store/useAppStore';
import { BUILT_IN_TEMPLATES } from '../constants/builtInTemplates';
import type { StickerContent, TextContent } from '../types';

const TemplateManager: React.FC = () => {
  const { templates, createTemplate, importTemplate, exportTemplate, deleteTemplate, stickerLibraries } = useAppStore();
  const applyTemplate = useAppStore((state) => state.openCanvas);

  const [isCreateTemplateModalVisible, setIsCreateTemplateModalVisible] = useState(false);
  const [isSelectLibraryModalVisible, setIsSelectLibraryModalVisible] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  
  const [form] = Form.useForm<{ name: string }>();

  // 合并内置模板和用户模板
  const allTemplates = useMemo(() => [...BUILT_IN_TEMPLATES, ...templates], [templates]);

  const showCreateTemplateModal = () => {
    setIsCreateTemplateModalVisible(true);
    form.setFieldsValue({ name: '' });
  };

  const handleCreateTemplate: FormProps<{ name: string }>['onFinish'] = (values) => {
    const name = values.name?.trim();
    if (!name) return;

    // 默认创建一个500x500的空白模板
    const canvasSettings = { width: 500, height: 500, background: '#ffffff' };
    const layers: TextContent[] = [];

    createTemplate(name, canvasSettings, layers);
    setIsCreateTemplateModalVisible(false);
    alert('模板创建成功');
  };


  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const templateData = JSON.parse(event.target?.result as string);
        importTemplate(templateData);
        alert('模板导入成功');
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败: 无效的JSON文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 应用模板到画布
  const handleApplyTemplate = (templateId: string) => {
    // 检查是否是内置的特殊模板
    if (templateId === 'template-builtin-a4-5x5') {
      setSelectedTemplateId(templateId);
      setIsSelectLibraryModalVisible(true);
      return;
    }

    const template = allTemplates.find(t => t.id === templateId);
    if (!template) {
      message.error('模板不存在');
      return;
    }

    // 创建基于模板的新画布
    const newCanvas = {
      id: `canvas-${Date.now()}`,
      name: `${template.name} - 副本`,
      canvasSettings: { ...template.canvasSettings },
      layers: template.layers.map(layer => ({
        ...layer,
        id: `layer-${Date.now()}-${Math.random()}`, // 生成新的ID
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: template.id,
    };

    applyTemplate(newCanvas);
    message.success('模板已应用到画布');
  };

  // 处理生成内置模板
  const handleGenerateBuiltInTemplate = () => {
    if (!selectedLibraryId || !selectedTemplateId) return;
    
    const library = stickerLibraries.find(l => l.id === selectedLibraryId);
    if (!library) {
      message.error('所选贴纸库不存在');
      return;
    }

    // 模板参数 (A4 300dpi: 2480x3508)
    const CANVAS_WIDTH = 2480;
    const CANVAS_HEIGHT = 3508;
    const COLS = 5;
    const ROWS = 5; // 虽然A4能放更多，但需求说5*5
    
    const MARGIN_X = 100;
    const MARGIN_Y = 100;
    const CELL_GAP = 60;
    
    // 计算单元格尺寸
    // Available Width = 2480 - 200 = 2280
    // Total Gap = 4 * 60 = 240
    // Content Width = 2280 - 240 = 2040
    // Cell Width = 2040 / 5 = 408
    
    const CELL_WIDTH = Math.floor((CANVAS_WIDTH - MARGIN_X * 2 - (COLS - 1) * CELL_GAP) / COLS);
    
    // 根据自定义字段数量动态计算文字区域高度
    const customFieldCount = library.customFieldDefs?.length || 0;
    const textLineCount = 1 + customFieldCount; // 名称 + 自定义字段数
    const TEXT_HEIGHT = Math.max(80, textLineCount * 70); // 每行约70px，最少80px
    
    // 调整图片高度，确保图片和文字都在单元格内
    const IMG_HEIGHT = CELL_WIDTH; 
    // 单元格总高度（含间隙）
    const CELL_HEIGHT = IMG_HEIGHT + TEXT_HEIGHT;

    const layers: (StickerContent | TextContent)[] = [];
    const stickers = library.stickers.slice(0, COLS * ROWS); // 最多取25个

    stickers.forEach((sticker, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);

      const x = MARGIN_X + col * (CELL_WIDTH + CELL_GAP);
      const y = MARGIN_Y + row * (CELL_HEIGHT + CELL_GAP);

      // 1. 添加图片层
      const imgLayer: StickerContent = {
        ...sticker,
        id: `layer-img-${Date.now()}-${index}`,
        position: { x, y }, // 图片在单元格顶部
        size: { width: CELL_WIDTH, height: IMG_HEIGHT },
        rotation: 0,
        visible: true,
        opacity: 1,
        zIndex: layers.length,
        type: 'sticker', // 确保类型正确
      };
      layers.push(imgLayer);

      // 2. 添加文字层
      // 第一行显示贴纸名称
      const contentLines = [sticker.name];
      
      // 追加所有自定义字段的值（按行）
      if (library.customFieldDefs && library.customFieldDefs.length > 0) {
        library.customFieldDefs.forEach((fieldDef) => {
          const fieldValue = sticker.customData?.[fieldDef.key];
          if (fieldValue) {
            contentLines.push(fieldValue);
          }
        });
      }
      
      const content = contentLines.join('\n');
      
      // 根据行数动态调整字体大小
      const baseFontSize = 60;
      const fontSize = contentLines.length > 1 
        ? Math.max(30, Math.floor(baseFontSize / Math.sqrt(contentLines.length))) 
        : baseFontSize;

      const textLayer: TextContent = {
        id: `layer-text-${Date.now()}-${index}`,
        type: 'text',
        name: `${sticker.name} - 名称`,
        content: content,
        font: "'AlimamaFangYuanTi', sans-serif",
        fontSize: fontSize,
        fontWeight: 900,
        color: '#000000',
        alignment: 'center',
        lineHeight: contentLines.length > 1 ? 1.3 : 1.2, // 多行时增加行间距
        position: { x, y: y + IMG_HEIGHT + 10 }, // 图片下方
        size: { width: CELL_WIDTH, height: TEXT_HEIGHT },
        rotation: 0,
        visible: true,
        opacity: 1,
        zIndex: layers.length,
        // 补充缺失属性
        lockAspectRatio: true
      } as TextContent;
      layers.push(textLayer);
    });

    const newCanvas = {
      id: `canvas-${Date.now()}`,
      name: `A4排版 - ${library.name}`,
      canvasSettings: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        background: '#ffffff',
      },
      layers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: selectedTemplateId,
    };

    applyTemplate(newCanvas);
    message.success(`已生成排版画布，包含 ${stickers.length} 个贴纸`);
    setIsSelectLibraryModalVisible(false);
  };

  return (
    <div className="bg-white rounded shadow p-2">
      <div className="manager-header flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">模板</h3>
        <div className="header-buttons flex space-x-1">
          <button 
            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 text-xs"
            onClick={showCreateTemplateModal}
          >
            新建
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            style={{ display: 'none' }}
            id="import-template"
          />
          <label 
            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors duration-200 text-xs cursor-pointer"
            htmlFor="import-template"
          >
            导入
          </label>
        </div>

        <Modal
          title="创建模板"
          open={isCreateTemplateModalVisible}
          onCancel={() => setIsCreateTemplateModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTemplate}
          >
            <Form.Item
              name="name"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input placeholder="输入模板名称" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                创建模板
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <div className="template-list space-y-1">
        {allTemplates.map((template) => (
          <div key={template.id} className="template-item flex items-center justify-between p-2 rounded border border-gray-200 hover:border-gray-300 transition-all duration-150">
            <div className="template-info flex flex-col">
              <div className="template-name text-sm font-medium text-gray-800">
                {template.name}
                {template.id.startsWith('template-builtin') && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 rounded">内置</span>
                )}
              </div>
              <div className="template-meta text-xs text-gray-500">
                {template.canvasSettings.width}x{template.canvasSettings.height}px
              </div>
            </div>
            <div className="template-actions flex space-x-1">
              <Button 
                size="small"
                type="primary"
                ghost
                onClick={() => handleApplyTemplate(template.id)}
                title="应用到画布"
                icon={<FileAddOutlined />}
              >
                应用
              </Button>
              
              {!template.id.startsWith('template-builtin') && (
                <>
                  <Button 
                    size="small"
                    icon={<ExportOutlined />}
                    onClick={() => exportTemplate(template.id)}
                    title="导出"
                  />
                  <Button 
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTemplate(template.id)}
                    title="删除"
                  />
                </>
              )}
            </div>
          </div>
        ))}
        {allTemplates.length === 0 && (
          <div className="empty-state text-center py-6 text-gray-500">
            <p className="text-sm mb-1">暂无模板</p>
            <p className="text-xs">点击"新建"或"导入"开始</p>
          </div>
        )}
      </div>

      {/* 选择贴纸库的弹窗 */}
      <Modal
        title="选择要填充的贴纸库"
        open={isSelectLibraryModalVisible}
        onCancel={() => setIsSelectLibraryModalVisible(false)}
        onOk={handleGenerateBuiltInTemplate}
        okText="生成画布"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="选择贴纸库">
            <Select
              placeholder="请选择一个贴纸库"
              onChange={(value) => setSelectedLibraryId(value)}
              options={stickerLibraries.map(lib => ({
                label: `${lib.name} (${lib.stickers.length}个贴纸)`,
                value: lib.id,
                disabled: lib.stickers.length === 0
              }))}
            />
            <div className="text-gray-500 text-xs mt-2">
              * 将自动选取库中的前25个贴纸填充到A4网格中
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateManager;