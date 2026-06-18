import { useCallback, useMemo, useRef, useState } from 'react';
import EditorPanel from './components/EditorPanel';
import PreviewArea from './components/PreviewArea';
import PosterCard from './components/PosterCard';
import { DEFAULT_DATA, FIGMA, getLayouts, POSTER_SIZES } from './constants/posterConfig';
import { exportAllPosters, exportPoster } from './utils/exportUtils';
import { fetchDoubanTopicData } from './utils/doubanFetch';
import './App.css';

function readFileAsDataUrl(file, callback) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target.result);
  reader.readAsDataURL(file);
}

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [exporting, setExporting] = useState(false);
  const [doubanUrl, setDoubanUrl] = useState('');
  const [fetchingDouban, setFetchingDouban] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [exportFormat, setExportFormat] = useState('png');

  const layouts = useMemo(() => getLayouts(), []);

  const posterRefA = useRef(null);
  const posterRefB = useRef(null);

  const handleChange = useCallback((field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleHeroUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    readFileAsDataUrl(file, (url) => setData((prev) => ({ ...prev, heroImage: url })));
    e.target.value = '';
  }, []);

  const handleAvatarUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    readFileAsDataUrl(file, (url) => setData((prev) => ({ ...prev, avatar: url })));
    e.target.value = '';
  }, []);

  const handleFetchDouban = useCallback(async () => {
    const url = doubanUrl.trim();
    if (!url) return;

    setFetchingDouban(true);
    setFetchError('');

    try {
      const result = await fetchDoubanTopicData(url);
      setData((prev) => ({
        ...prev,
        groupName: result.groupName,
        members: result.members,
        headline: result.headline || prev.headline,
        heroImage: result.heroImage,
        avatar: result.avatar,
      }));
    } catch (err) {
      setFetchError(err.message || '抓取失败，请稍后重试');
    } finally {
      setFetchingDouban(false);
    }
  }, [doubanUrl]);

  const handleExportA = useCallback(async () => {
    setExporting(true);
    try {
      const { width, height, exportName } = POSTER_SIZES.a;
      await exportPoster(posterRefA.current, exportName, width, height, exportFormat);
    } catch (err) {
      alert('导出失败，请稍后重试');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [exportFormat]);

  const handleExportB = useCallback(async () => {
    setExporting(true);
    try {
      const { width, height, exportName } = POSTER_SIZES.b;
      await exportPoster(posterRefB.current, exportName, width, height, exportFormat);
    } catch (err) {
      alert('导出失败，请稍后重试');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [exportFormat]);

  const handleExportAll = useCallback(async () => {
    setExporting(true);
    try {
      await exportAllPosters(
        [
          {
            node: posterRefA.current,
            filename: POSTER_SIZES.a.exportName,
            width: POSTER_SIZES.a.width,
            height: POSTER_SIZES.a.height,
          },
          {
            node: posterRefB.current,
            filename: POSTER_SIZES.b.exportName,
            width: POSTER_SIZES.b.width,
            height: POSTER_SIZES.b.height,
          },
        ],
        exportFormat,
      );
    } catch (err) {
      alert('导出失败，请稍后重试');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [exportFormat]);

  return (
    <div className="app">
      <EditorPanel
        data={data}
        onChange={handleChange}
        onHeroUpload={handleHeroUpload}
        onAvatarUpload={handleAvatarUpload}
        onFetchDouban={handleFetchDouban}
        doubanUrl={doubanUrl}
        onDoubanUrlChange={setDoubanUrl}
        fetchingDouban={fetchingDouban}
        fetchError={fetchError}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onExportA={handleExportA}
        onExportB={handleExportB}
        onExportAll={handleExportAll}
        exporting={exporting}
      />

      <PreviewArea data={data} layouts={layouts} />

      <div className="export-layer" aria-hidden="true">
        <PosterCard
          layout={layouts.a}
          data={data}
          posterRef={posterRefA}
          bg={FIGMA.a.bg}
        />
        <PosterCard
          layout={layouts.b}
          data={data}
          posterRef={posterRefB}
          bg={FIGMA.b.bg}
        />
      </div>
    </div>
  );
}
