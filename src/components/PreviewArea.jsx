import { FIGMA, POSTER_SIZES } from '../constants/posterConfig';
import PosterCard from './PosterCard';
import './PreviewArea.css';

export default function PreviewArea({ data, layouts }) {
  const scaleA = 0.28;
  const scaleB = 0.28;

  return (
    <section className="preview-area">
      <h2 className="preview-heading">实时预览</h2>
      <p className="preview-hint">
        基于 Figma 精确还原，共享同一份数据
      </p>

      <div className="preview-grid">
        <PreviewItem
          label={POSTER_SIZES.a.label}
          layout={layouts.a}
          data={data}
          bg={FIGMA.a.bg}
          scale={scaleA}
        />
        <PreviewItem
          label={POSTER_SIZES.b.label}
          layout={layouts.b}
          data={data}
          bg={FIGMA.b.bg}
          scale={scaleB}
        />
      </div>
    </section>
  );
}

function PreviewItem({ label, layout, data, bg, scale }) {
  return (
    <div className="preview-item">
      <p className="preview-label">{label}</p>
      <div
        className="preview-scaler"
        style={{
          width: layout.width * scale,
          height: layout.height * scale,
        }}
      >
        <div
          className="preview-inner"
          style={{
            transform: `scale(${scale})`,
            width: layout.width,
            height: layout.height,
          }}
        >
          <PosterCard layout={layout} data={data} bg={bg} />
        </div>
      </div>
    </div>
  );
}
