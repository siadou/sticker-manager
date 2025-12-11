import React, { useState } from 'react';
import { Modal, Form, Input, Button, Popconfirm, Tooltip } from 'antd';
import type { FormProps } from 'antd';
import { DeleteOutlined, DownOutlined, EditOutlined, ExportOutlined, PlusOutlined, ImportOutlined } from '@ant-design/icons';

import useAppStore from '../store/useAppStore';
import type { StickerContent } from '../types';
import StickerLibraryEditorModal from './StickerLibraryEditorModal';

const StickerLibraryManager: React.FC = () => {
  const { stickerLibraries, createStickerLibrary, importStickerLibrary, exportStickerLibrary, removeStickerFromLibrary, deleteStickerLibrary } = useAppStore();
  const [isCreateLibraryModalVisible, setIsCreateLibraryModalVisible] = useState(false);
  const [expandedLibraryId, setExpandedLibraryId] = useState<string | null>(null);
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);
  const [form] = Form.useForm<{ name: string }>();

  const showCreateLibraryModal = () => {
    setIsCreateLibraryModalVisible(true);
    form.setFieldsValue({ name: '' });
  };

  const handleCreateLibrary: FormProps<{ name: string }>['onFinish'] = (values) => {
    const name = values.name?.trim();
    if (name) {
      createStickerLibrary(name);
      setIsCreateLibraryModalVisible(false);
    }
  };

  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const libraryData = JSON.parse(event.target?.result as string);
        importStickerLibrary(libraryData);
        alert('贴纸库导入成功');
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败: 无效的JSON文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleLibraryExpand = (libraryId: string) => {
    setExpandedLibraryId(expandedLibraryId === libraryId ? null : libraryId);
  };

  const handleDeleteSticker = (libraryId: string, stickerId: string) => {
    removeStickerFromLibrary(libraryId, stickerId);
  };

  const handleDeleteLibrary = (libraryId: string) => {
    deleteStickerLibrary(libraryId);
  };

  const handleStickerDragStart = (e: React.DragEvent, sticker: StickerContent) => {
    e.dataTransfer.setData('stickerData', JSON.stringify(sticker));
    e.dataTransfer.effectAllowed = 'copy';
    
    // 添加拖拽效果
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleStickerDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  return (
    <div className="bg-white rounded shadow p-2">
      <div className="manager-header flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-gray-800">贴纸库</h3>
        <div className="header-buttons flex items-center space-x-2">
          <Tooltip title="新建贴纸库">
            <Button 
              type="primary" 
              size="small" 
              icon={<PlusOutlined />} 
              onClick={showCreateLibraryModal}
            />
          </Tooltip>
          
          <input
            type="file"
            accept=".json"
            onChange={handleImportLibrary}
            style={{ display: 'none' }}
            id="import-library"
          />
          <Tooltip title="导入贴纸库">
            <Button 
              size="small" 
              icon={<ImportOutlined />} 
              onClick={() => document.getElementById('import-library')?.click()}
            />
          </Tooltip>
        </div>

        <Modal
          title="创建贴纸库"
          open={isCreateLibraryModalVisible}
          onCancel={() => setIsCreateLibraryModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateLibrary}
          >
            <Form.Item
              name="name"
              label="贴纸库名称"
              rules={[{ required: true, message: '请输入贴纸库名称' }]}
            >
              <Input placeholder="输入贴纸库名称" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                创建贴纸库
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <div className="library-list space-y-1">
        {stickerLibraries.map((library) => {
          const isExpanded = expandedLibraryId === library.id;
          
          return (
            <div key={library.id} className="library-item rounded border border-gray-200 hover:border-gray-300 transition-all duration-150">
              <div 
                className="library-header flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleLibraryExpand(library.id)}
              >
                <div className="library-info flex items-center gap-2 flex-1 min-w-0">
                  <div className={`transform transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                    <DownOutlined style={{ fontSize: '10px' }} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="library-name text-sm font-medium text-gray-800 truncate pr-2" title={library.name}>
                      {library.name}
                    </div>
                    <div className="library-meta text-xs text-gray-400">
                      {library.stickers.length} 个贴纸
                    </div>
                  </div>
                </div>
                
                <div className="library-actions flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditingLibraryId(library.id)}
                      className="text-gray-500 hover:text-blue-600"
                    />
                  </Tooltip>
                  <Tooltip title="导出">
                    <Button
                      type="text"
                      size="small"
                      icon={<ExportOutlined />}
                      onClick={() => exportStickerLibrary(library.id)}
                      className="text-gray-500 hover:text-green-600"
                    />
                  </Tooltip>
                  <Popconfirm
                    title="确定要删除此贴纸库吗？"
                    onConfirm={() => handleDeleteLibrary(library.id)}
                    okText="确定"
                    cancelText="取消"
                    placement="left"
                  >
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="text-gray-500 hover:text-red-600"
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>

              {isExpanded && (
                <div className="library-content p-3 border-t border-gray-200 bg-gray-50">
                  {library.stickers.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-xs">此库中暂无贴纸</p>
                      <p className="text-xs">使用图像编辑器添加贴纸</p>
                    </div>
                  ) : (
                    <div className="stickers-grid grid grid-cols-3 gap-2">
                      {library.stickers.map((sticker) => (
                        <div
                          key={sticker.id}
                          className="sticker-item relative group bg-white rounded border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-move"
                          draggable
                          onDragStart={(e) => handleStickerDragStart(e, sticker)}
                          onDragEnd={handleStickerDragEnd}
                        >
                          <div className="sticker-preview aspect-square flex items-center justify-center p-2">
                            <img
                              src={sticker.content}
                              alt={sticker.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="sticker-info p-1 border-t border-gray-100">
                            <p className="text-xs text-gray-600 truncate text-center">{sticker.name}</p>
                          </div>
                          <Popconfirm
                            title="确定要删除此贴纸吗？"
                            onConfirm={() => handleDeleteSticker(library.id, sticker.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <button
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DeleteOutlined />
                            </button>
                          </Popconfirm>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {stickerLibraries.length === 0 && (
          <div className="empty-state text-center py-6 text-gray-500">
            <p className="text-sm mb-1">暂无贴纸库</p>
            <p className="text-xs">点击"新建"或"导入"开始</p>
          </div>
        )}
      </div>

      <StickerLibraryEditorModal
        visible={!!editingLibraryId}
        libraryId={editingLibraryId}
        onClose={() => setEditingLibraryId(null)}
      />
    </div>
  );
};

export default StickerLibraryManager;
