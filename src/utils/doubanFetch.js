function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function proxyImageToDataUrl(imageUrl) {
  const res = await fetch(`/api/douban/image?url=${encodeURIComponent(imageUrl)}`);
  if (!res.ok) {
    throw new Error('图片加载失败');
  }
  const blob = await res.blob();
  return readBlobAsDataUrl(blob);
}

export async function fetchDoubanTopicData(url) {
  const res = await fetch('/api/douban/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || '抓取失败');
  }

  const imageTasks = [proxyImageToDataUrl(payload.heroImage)];
  if (payload.avatar) {
    imageTasks.push(proxyImageToDataUrl(payload.avatar));
  }

  const imageResults = await Promise.all(imageTasks);
  const heroImage = imageResults[0];
  const avatar = payload.avatar ? imageResults[1] : heroImage;

  return {
    groupName: payload.groupName,
    members: payload.members,
    headline: payload.headline || payload.topicTitle || '',
    heroImage,
    avatar,
  };
}

/** @deprecated use fetchDoubanTopicData */
export const fetchDoubanGroupData = fetchDoubanTopicData;
