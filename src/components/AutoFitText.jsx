import { useEffect, useRef } from 'react';

/**
 * 自动缩小字号以适应容器，防止长文本撑坏布局
 */
export function AutoFitText({
  text,
  maxSize,
  minSize,
  singleLine = false,
  maxLines = 1,
  lineHeight = 1.3,
  style = {},
  className = '',
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let size = maxSize;
    el.style.fontSize = `${size}px`;

    const overflows = () => {
      if (singleLine) {
        return el.scrollWidth > el.clientWidth + 1;
      }
      return el.scrollHeight > el.clientHeight + 1;
    };

    while (size > minSize && overflows()) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }, [text, maxSize, minSize, singleLine, maxLines, lineHeight]);

  const maxHeight = singleLine ? undefined : `${maxSize * lineHeight * maxLines}px`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        fontSize: maxSize,
        lineHeight,
        maxHeight,
        overflow: 'hidden',
        ...(singleLine
          ? { whiteSpace: 'nowrap', textOverflow: 'ellipsis' }
          : {
              display: '-webkit-box',
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }),
      }}
    >
      {text}
    </div>
  );
}
