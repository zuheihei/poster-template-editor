import { EXPORT_FORMATS } from '../utils/exportUtils';
import './EditorPanel.css';

/**
 * 左侧编辑面板（320px 固定宽）
 */
export default function EditorPanel({
  data,
  onChange,
  onHeroUpload,
  onAvatarUpload,
  onFetchDouban,
  doubanUrl,
  onDoubanUrlChange,
  fetchingDouban,
  fetchError,
  exportFormat,
  onExportFormatChange,
  onExportA,
  onExportB,
  onExportAll,
  exporting,
}) {
  return (
    <aside className="editor-panel">
      <h2 className="editor-title">图文模板编辑器</h2>

      <div className="form-group">
        <label htmlFor="doubanUrl">豆瓣小组帖链接</label>
        <div className="fetch-row">
          <input
            id="doubanUrl"
            type="text"
            value={doubanUrl}
            onChange={(e) => onDoubanUrlChange(e.target.value)}
            placeholder="https://www.douban.com/group/topic/490857750/"
          />
          <button
            type="button"
            className="fetch-btn"
            onClick={onFetchDouban}
            disabled={fetchingDouban || !doubanUrl.trim()}
          >
            {fetchingDouban ? '抓取中…' : '抓取'}
          </button>
        </div>
        {fetchError ? <p className="fetch-error">{fetchError}</p> : null}
        <p className="fetch-hint">自动填充帖子标题、小组名称、成员数、头图和头像</p>
      </div>

      <div className="form-group">
        <label htmlFor="groupName">小组名称</label>
        <input
          id="groupName"
          type="text"
          value={data.groupName}
          onChange={(e) => onChange('groupName', e.target.value)}
          placeholder="请输入小组名称"
        />
      </div>

      <div className="form-group">
        <label htmlFor="members">成员数</label>
        <input
          id="members"
          type="text"
          value={data.members}
          onChange={(e) => onChange('members', e.target.value)}
          placeholder="请输入成员数"
        />
      </div>

      <div className="form-group">
        <label htmlFor="headline">主标题</label>
        <input
          id="headline"
          type="text"
          value={data.headline}
          onChange={(e) => onChange('headline', e.target.value)}
          placeholder="请输入主标题"
        />
      </div>

      <div className="form-group">
        <label>头图</label>
        <label className="upload-btn">
          上传头图
          <input type="file" accept="image/*" onChange={onHeroUpload} hidden />
        </label>
      </div>

      <div className="form-group">
        <label>头像</label>
        <label className="upload-btn">
          上传头像
          <input type="file" accept="image/*" onChange={onAvatarUpload} hidden />
        </label>
      </div>

      <div className="style-note">
        <p className="style-note-title">Figma 模板说明</p>
        <p>海报 A（1242×2110）Figma 原尺寸</p>
        <ul>
          <li>画布 1242×2110 → 缩放导出</li>
          <li>头图 1080×1080，圆角 25px</li>
          <li>色值 #725940 / 背景 #F7F7F7</li>
        </ul>
        <p>海报 B（1242×1863）</p>
        <p>修改一次，两种尺寸同步更新。</p>
      </div>

      <div className="export-section">
        <p className="export-title">导出图片</p>
        <div className="form-group export-format-group">
          <label>导出格式</label>
          <div className="export-format-options">
            {EXPORT_FORMATS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`export-format-btn${exportFormat === id ? ' active' : ''}`}
                onClick={() => onExportFormatChange(id)}
                disabled={exporting}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="export-btn" onClick={onExportA} disabled={exporting}>
          导出海报 A
        </button>
        <button type="button" className="export-btn" onClick={onExportB} disabled={exporting}>
          导出海报 B
        </button>
        <button type="button" className="export-btn primary" onClick={onExportAll} disabled={exporting}>
          一键导出全部
        </button>
      </div>
    </aside>
  );
}
