import './PosterCard.css';

/** 引号装饰图（Figma 390:132，#725940 @ 100%） */
function QuoteMark({ layout }) {
  return (
    <img
      className="poster-quote-img"
      src={layout.image}
      alt=""
      crossOrigin="anonymous"
      style={{
        width: layout.width,
        height: layout.height,
        opacity: layout.opacity,
      }}
    />
  );
}

/**
 * 按 Figma 单组2-2 / 单组2-1 绝对定位渲染海报
 */
export default function PosterCard({ layout, data, posterRef, bg }) {
  const { hero, gradient, avatar, groupName, members, tag, quote, headline } = layout;

  return (
    <div
      ref={posterRef}
      className="poster-card"
      style={{ width: layout.width, height: layout.height }}
    >
      <div
        className="poster-bg"
        style={{ background: bg.color, opacity: bg.opacity }}
      />

      <div
        className="poster-hero"
        style={{
          left: hero.left,
          top: hero.top,
          width: hero.width,
          height: hero.height,
          borderTopLeftRadius: hero.radius,
          borderTopRightRadius: hero.radius,
          borderBottomLeftRadius: hero.radius,
          borderBottomRightRadius: hero.radius,
        }}
      >
        <img
          className="poster-hero-img"
          src={data.heroImage}
          alt=""
          crossOrigin="anonymous"
          style={{
            width: hero.imgWidth,
            height: hero.imgHeight,
            left: hero.imgOffsetX,
            top: hero.imgOffsetY,
          }}
        />
      </div>

      <div
        className="poster-gradient"
        style={{
          left: gradient.left,
          top: gradient.top,
          width: gradient.width,
          height: gradient.height,
          opacity: gradient.opacity,
          borderBottomLeftRadius: hero.radius,
          borderBottomRightRadius: hero.radius,
        }}
      />

      <img
        className="poster-avatar"
        src={data.avatar}
        alt=""
        crossOrigin="anonymous"
        style={{
          left: avatar.left,
          top: avatar.top,
          width: avatar.width,
          height: avatar.height,
          borderRadius: avatar.radius,
        }}
      />

      <div
        className="poster-group-name"
        style={{
          left: groupName.left,
          top: groupName.top,
          fontSize: groupName.fontSize,
          fontWeight: groupName.fontWeight,
          color: '#FFFFFF',
        }}
      >
        {data.groupName}
      </div>

      <div
        className="poster-members"
        style={{
          left: members.left,
          top: members.top,
          fontSize: members.fontSize,
          fontWeight: members.fontWeight,
          opacity: members.opacity,
          color: '#FFFFFF',
        }}
      >
        {data.members}
      </div>

      <div
        className="poster-tag"
        style={{
          left: tag.left,
          top: tag.top,
          width: tag.width,
          height: tag.height,
        }}
      >
        <span
          className="poster-tag-line"
          style={{ width: tag.lineWidth, background: tag.color, top: tag.lineOffsetY }}
        />
        <span
          className="poster-tag-text"
          style={{ fontSize: tag.fontSize, color: tag.color, left: tag.textOffsetX }}
        >
          小组推荐
        </span>
        <span
          className="poster-tag-line poster-tag-line-right"
          style={{
            width: tag.lineWidth,
            background: tag.color,
            top: tag.lineOffsetY,
            right: 0,
          }}
        />
      </div>

      <div
        className="poster-quote-wrap"
        style={{
          left: quote.left,
          top: quote.top,
          width: quote.width,
          height: quote.height,
        }}
      >
        <QuoteMark layout={quote} />
      </div>

      <div
        className="poster-headline"
        style={{
          left: headline.left,
          top: headline.top,
          width: headline.width,
          height: headline.height,
          fontSize: headline.fontSize,
          fontWeight: headline.fontWeight,
          lineHeight: headline.lineHeight,
          color: headline.color,
        }}
      >
        <span className="poster-headline-text">{data.headline}</span>
      </div>
    </div>
  );
}
