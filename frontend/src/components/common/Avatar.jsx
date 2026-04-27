import { useState } from 'react';
import { getFileUrl } from '../../utils/fileUrl';

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 40,
  style = {},
  textStyle = {},
}) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const showImage = src && !failed;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #d4a853, #8b6914)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: 'white',
        fontWeight: 700,
        flexShrink: 0,
        ...style,
      }}
    >
      {showImage ? (
        <img
          src={getFileUrl(src)}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={textStyle}>{initial}</span>
      )}
    </div>
  );
}
