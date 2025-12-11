import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Table, Popconfirm, App } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { StickerLibrary, StickerContent, CustomFieldDef } from '../types';
import useAppStore from '../store/useAppStore';
import { cloneDeep } from 'lodash-es';

interface StickerLibraryEditorModalProps {
  visible: boolean;
  libraryId: string | null;
  onClose: () => void;
}

const StickerLibraryEditorModal: React.FC<StickerLibraryEditorModalProps> = ({
  visible,
  libraryId,
  onClose,
}) => {
  const { stickerLibraries, updateStickerLibrary, updateStickerInLibrary, removeStickerFromLibrary } = useAppStore();
  const [library, setLibrary] = useState<StickerLibrary | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [libraryName, setLibraryName] = useState('');
  const { message } = App.useApp();

  useEffect(() => {
    if (visible && libraryId) {
      const foundLib = stickerLibraries.find((lib) => lib.id === libraryId);
      if (foundLib) {
        setLibrary(cloneDeep(foundLib));
        setLibraryName(foundLib.name);
        setCustomFields(cloneDeep(foundLib.customFieldDefs || []));
        console.log('init');
      }
    } else if (!visible) {
      // 模态框关闭时清空状态
      setLibrary(null);
      setLibraryName('');
      setCustomFields([]);
    }
    // 只在 visible 或 libraryId 改变时初始化，不依赖 stickerLibraries 避免编辑时重复初始化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, libraryId]);

  const handleSaveLibraryInfo = () => {
    if (!libraryId) return;
    updateStickerLibrary(libraryId, {
      name: libraryName,
      customFieldDefs: customFields,
    });
    message.success('贴纸库信息已更新');
  };

  const handleAddCustomField = () => {
    const newField: CustomFieldDef = {
      key: `field_${Date.now()}`,
      label: '新字段',
      type: 'text',
    };
    setCustomFields([...customFields, newField]);
  };

  const handleRemoveCustomField = (key: string) => {
    setCustomFields(customFields.filter((f) => f.key !== key));
  };

  const handleUpdateCustomField = (key: string, updates: Partial<CustomFieldDef>) => {
    setCustomFields(customFields.map((f) => (f.key === key ? { ...f, ...updates } : f)));
  };

  const handleUpdateStickerName = (stickerId: string, name: string) => {
    if (!libraryId || !library) return;
    
    // 更新全局状态
    updateStickerInLibrary(libraryId, stickerId, { name });
    
    // 同步更新本地状态
    setLibrary({
      ...library,
      stickers: library.stickers.map((s) => (s.id === stickerId ? { ...s, name } : s)),
    });
  };

  const handleUpdateStickerCustomData = (stickerId: string, fieldKey: string, value: string) => {
    if (!libraryId || !library) return;
    const sticker = library.stickers.find((s) => s.id === stickerId);
    if (!sticker) return;

    const newCustomData = { ...(sticker.customData || {}), [fieldKey]: value };
    
    // 更新全局状态
    updateStickerInLibrary(libraryId, stickerId, { customData: newCustomData });
    
    // 同步更新本地状态
    setLibrary({
      ...library,
      stickers: library.stickers.map((s) => 
        s.id === stickerId ? { ...s, customData: newCustomData } : s
      ),
    });
  };

  const handleDeleteSticker = (stickerId: string) => {
    if (!libraryId || !library) return;
    
    // 更新全局状态
    removeStickerFromLibrary(libraryId, stickerId);
    
    // 同步更新本地状态
    setLibrary({
      ...library,
      stickers: library.stickers.filter((s) => s.id !== stickerId),
    });
    
    message.success('贴纸已删除');
  };

  const columns = [
    {
      title: '预览',
      dataIndex: 'content',
      key: 'content',
      width: 80,
      render: (content: string) => (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          <img src={content} alt="preview" className="max-w-full max-h-full object-contain" />
        </div>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: StickerContent) => (
        <Input
          defaultValue={text}
          onBlur={(e) => handleUpdateStickerName(record.id, e.target.value)}
        />
      ),
    },
    ...customFields.map((field) => ({
      title: field.label,
      key: field.key,
      width: 150,
      render: (_: unknown, record: StickerContent) => (
        <Input
          defaultValue={record.customData?.[field.key] || ''}
          onBlur={(e) => handleUpdateStickerCustomData(record.id, field.key, e.target.value)}
          placeholder={field.label}
        />
      ),
    })),
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: StickerContent) => (
        <Popconfirm
          title="确定删除此贴纸吗？"
          onConfirm={() => handleDeleteSticker(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title="编辑贴纸库"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button key="save" type="primary" onClick={handleSaveLibraryInfo}>
          保存库设置
        </Button>,
      ]}
    >
      <div className="space-y-6">
        {/* 基础信息 */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-bold mb-3">基础信息</h3>
          <div className="flex items-center gap-4">
            <span className="w-20">库名称:</span>
            <Input
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* 自定义字段配置 */}
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold">自定义字段配置</h3>
            <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddCustomField}>
              添加字段
            </Button>
          </div>
          
          {customFields.length === 0 ? (
            <div className="text-gray-400 text-xs text-center py-2">暂无自定义字段</div>
          ) : (
            <div className="space-y-2">
              {customFields.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <Input
                    value={field.label}
                    onChange={(e) => handleUpdateCustomField(field.key, { label: e.target.value })}
                    placeholder="字段显示名称 (如: 英文名)"
                    className="w-40"
                  />
                  <span className="text-gray-400 text-xs">Key: {field.key}</span>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveCustomField(field.key)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 贴纸列表 */}
        <div>
          <h3 className="text-sm font-bold mb-3">贴纸列表 ({library?.stickers.length || 0})</h3>
          <Table
            dataSource={library?.stickers || []}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
            scroll={{ y: 300 }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StickerLibraryEditorModal;
