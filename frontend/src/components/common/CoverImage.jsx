import { useState } from 'react';
import { getFileUrl } from '../../utils/fileUrl';

export default function CoverImage({
  src,
  alt = '',
  fallback = null,
  style = {},
  imgStyle = {},
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  if (!showImage) {
    return (
      <div style={style}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={getFileUrl(src)}
      alt={alt}
      onError={() => setFailed(true)}
      style={{
        display: 'block',
        ...style,
        ...imgStyle,
      }}
    />
  );
}
