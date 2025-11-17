import React from 'react';
import useAppStore from '../store/useAppStore';

const TemplateManager: React.FC = () => {
  const { templates, createTemplate, importTemplate, exportTemplate, deleteTemplate } = useAppStore();

  const handleCreateTemplate = () => {
    const name = prompt('请输入模板名称:');
    if (!name?.trim()) return;

    // 默认创建一个500x500的空白模板
    const canvasSettings = { width: 500, height: 500, background: '#ffffff' };
    const layers: any[] = [];

    createTemplate(name.trim(), canvasSettings, layers);
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

  return (
    <div className="template-manager">
      <div className="manager-header">
        <h3>模板</h3>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={handleCreateTemplate}>
            新建
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            style={{ display: 'none' }}
            id="import-template"
          />
          <label className="btn btn-secondary" htmlFor="import-template">
            导入
          </label>
        </div>
      </div>
      <div className="template-list">
        {templates.map((template) => (
          <div key={template.id} className="template-item">
            <div className="template-info">
              <div className="template-name">{template.name}</div>
              <div className="template-meta">
                {template.canvasSettings.width}x{template.canvasSettings.height}px
              </div>
            </div>
            <div className="template-actions">
              <button 
                className="action-btn export-btn"
                onClick={() => exportTemplate(template.id)}
                title="导出"
              >
                导出
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => deleteTemplate(template.id)}
                title="删除"
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="empty-state">
            <p>暂无模板</p>
            <p>点击"新建"或"导入"开始</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;