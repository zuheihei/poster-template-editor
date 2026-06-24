const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

export function extractTopicId(input) {
  const match = String(input).match(/douban\.com\/group\/topic\/(\d+)/i);
  if (!match) {
    throw new Error('请输入有效的豆瓣小组帖链接，例如 https://www.douban.com/group/topic/490857750/');
  }
  return match[1];
}

export function extractGroupId(input) {
  const match = String(input).match(/douban\.com\/group\/([^/?#]+)/i);
  if (!match) {
    throw new Error('请输入有效的小组链接，例如 https://www.douban.com/group/123456/');
  }
  const id = match[1];
  if (id === 'topic' || id === 'discuss') {
    throw new Error('请输入小组主页链接，不是帖子链接');
  }
  return id;
}

export function normalizeGroupUrl(input) {
  const groupId = /^\d+$/.test(String(input).trim())
    ? String(input).trim()
    : extractGroupId(input);
  return `https://www.douban.com/group/${groupId}/`;
}

async function fetchGroupFromApi(groupId) {
  const apiUrl = `https://m.douban.com/rexxar/api/v2/group/${groupId}`;
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': MOBILE_UA,
      Accept: 'application/json, text/plain, */*',
      Referer: normalizeGroupUrl(groupId),
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`抓取失败（HTTP ${res.status}）`);
  }

  const group = await res.json();
  if (!group?.id && !group?.name) {
    throw new Error('未能解析小组信息');
  }

  const avatar = toLargeImageUrl(group.avatar || group.large_avatar || group.icon || '');
  if (!avatar) {
    throw new Error('未能获取小组头像');
  }

  return {
    id: String(group.id || groupId),
    name: group.name || '',
    avatar,
    memberCount: group.member_count,
    sourceUrl: normalizeGroupUrl(group.id || groupId),
  };
}

export async function fetchDoubanGroupHomepage(input) {
  const group = await fetchDoubanGroup(input);
  let heroImage = group.avatar;

  try {
    const pageRes = await fetch(group.sourceUrl, {
      headers: {
        'User-Agent': MOBILE_UA,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
      if (ogMatch?.[1]) {
        heroImage = toLargeImageUrl(ogMatch[1]);
      }
    }
  } catch {
    // 使用头像作为头图回退
  }

  return {
    groupName: group.name,
    members: formatMembers(group.memberCount),
    headline: group.name,
    heroImage,
    avatar: group.avatar,
    sourceUrl: group.sourceUrl,
    groupId: group.id,
  };
}

export async function fetchDoubanGroup(input) {
  const groupId = extractGroupId(input);
  return fetchGroupFromApi(groupId);
}

export async function fetchDoubanGroupsBatch(inputs, { concurrency = 3 } = {}) {
  const urls = [...new Set(
    inputs
      .map((item) => String(item).trim())
      .filter(Boolean),
  )];

  if (!urls.length) {
    throw new Error('请至少提供一个小组链接');
  }

  const groups = [];
  const errors = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(async (url) => {
        try {
          const group = await fetchDoubanGroup(url);
          if (!group.name) throw new Error('小组名称为空');
          return { ok: true, group, url };
        } catch (err) {
          return { ok: false, url, error: err.message || '抓取失败' };
        }
      }),
    );

    results.forEach((result) => {
      if (result.ok) groups.push(result.group);
      else errors.push({ url: result.url, error: result.error });
    });
  }

  return { groups, errors };
}

export function normalizeTopicUrl(input) {
  const topicId = /^\d+$/.test(String(input).trim())
    ? String(input).trim()
    : extractTopicId(input);
  return `https://www.douban.com/group/topic/${topicId}/`;
}

function formatMembers(count) {
  if (count === undefined || count === null || count === '') return '';
  const normalized = String(count).replace(/,/g, '');
  return `${normalized}个成员`;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function toLargeImageUrl(url) {
  if (!url) return url;
  const cleanUrl = url.split('?')[0];
  return cleanUrl
    .replace('/view/group/sqxs/', '/view/group/l/')
    .replace('/view/group_topic/sqxs/', '/view/group_topic/l/')
    .replace('/view/group_topic/large/', '/view/group_topic/l/');
}

function pickHeroImage(topic) {
  const photo = topic.photos?.[0];
  const fromPhoto = photo?.image?.large?.url || photo?.image?.normal?.url;
  if (fromPhoto) return toLargeImageUrl(fromPhoto);

  if (topic.cover_url) return toLargeImageUrl(topic.cover_url);

  const group = topic.group || {};
  return toLargeImageUrl(group.large_avatar || group.avatar || '');
}

function parseTopicPayload(topic) {
  const group = topic.group || {};
  const heroImage = pickHeroImage(topic);
  const avatar = group.avatar || group.large_avatar || '';
  const contentText = stripHtml(topic.content || '');

  if (!group.name) {
    throw new Error('未能解析小组信息');
  }

  if (!heroImage) {
    throw new Error('帖子中没有可用图片');
  }

  return {
    groupName: group.name,
    members: formatMembers(group.member_count),
    headline: topic.title || contentText.split('\n')[0] || '',
    heroImage,
    avatar,
    topicTitle: topic.title || '',
    topicContent: contentText,
    sourceUrl: normalizeTopicUrl(topic.id || topic.url || ''),
    topicId: String(topic.id || ''),
    groupId: String(group.id || ''),
  };
}

async function fetchTopicFromApi(topicId) {
  const apiUrl = `https://m.douban.com/rexxar/api/v2/group/topic/${topicId}`;
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': MOBILE_UA,
      Accept: 'application/json, text/plain, */*',
      Referer: normalizeTopicUrl(topicId),
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`抓取失败（HTTP ${res.status}）`);
  }

  const topic = await res.json();
  if (!topic?.id) {
    throw new Error('未能解析帖子内容，请确认链接可公开访问');
  }

  return parseTopicPayload(topic);
}

function parseMobileTopicHtml(html, topicId) {
  if (/没有权限访问|没有访问权限|请登录/.test(html)) {
    return null;
  }

  const titleMatch =
    html.match(/property="og:title"\s+content="([^"]+)"/i) ||
    html.match(/<title>\s*([^<\n]+?)\s*-\s*豆瓣\s*<\/title>/i);
  const imageMatch =
    html.match(/imageUrl:\s*'([^']+)'/i) ||
    html.match(/property="og:image"\s+content="([^"]+)"/i);
  const groupMatch = html.match(
    /<div class="group-card">[\s\S]*?<img src="([^"]+)"[\s\S]*?<p class="name">([^<]+)<\/p>[\s\S]*?<p class="member">([\d,]+)/i,
  );

  const rawTitle = titleMatch?.[1]?.replace(/\s*-\s*小组讨论\s*$/, '').trim();
  const heroImage = toLargeImageUrl(imageMatch?.[1] || '');

  if (!rawTitle || !heroImage || !groupMatch) return null;

  const [, avatar, groupName, memberCount] = groupMatch;

  return {
    groupName: groupName.trim(),
    members: formatMembers(memberCount),
    headline: rawTitle,
    heroImage,
    avatar,
    topicTitle: rawTitle,
    topicContent: '',
    sourceUrl: normalizeTopicUrl(topicId),
    topicId,
    groupId: '',
  };
}

export async function fetchDoubanTopic(input) {
  const topicId = extractTopicId(input);

  try {
    return await fetchTopicFromApi(topicId);
  } catch (apiError) {
    const mobileUrl = `https://m.douban.com/group/topic/${topicId}/`;
    const mobileRes = await fetch(mobileUrl, {
      headers: {
        'User-Agent': MOBILE_UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      redirect: 'follow',
    });

    if (!mobileRes.ok) {
      throw apiError;
    }

    const mobileHtml = await mobileRes.text();
    const fallback = parseMobileTopicHtml(mobileHtml, topicId);
    if (!fallback) {
      throw apiError;
    }

    return fallback;
  }
}

export function isAllowedDoubanImageUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname.endsWith('doubanio.com') && url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** @deprecated use fetchDoubanTopic */
export const fetchDoubanGroupTopic = fetchDoubanTopic;
