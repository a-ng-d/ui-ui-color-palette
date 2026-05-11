import React from 'react'
import { PaletteDataColorItem } from '@a_ng_d/utils-ui-color-palette'

interface PalettePreviewProps {
  colors: Array<PaletteDataColorItem>
  isFullHeight?: boolean
}

const PalettePreview = ({ colors, isFullHeight }: PalettePreviewProps) => (
  <div
    style={{
      borderRadius: 'var(--border-radius-medium)',
      overflow: 'hidden',
      ...(isFullHeight && { height: '100%' }),
    }}
    className="preview__rows"
  >
    {colors.map((color, colorIndex) => (
      <div key={`color-${colorIndex}`} className="preview__row">
        {color.shades.map((shade, shadeIndex) => (
          <div
            key={`color-${colorIndex}-${shadeIndex}`}
            className="preview__cell preview__cell--compact"
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: '1',
                top: 0,
                left: 0,
                backgroundColor: shade.hex,
              }}
            />
            {shade.backgroundColor !== undefined && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  zIndex: '0',
                  top: 0,
                  left: 0,
                  backgroundColor: Array.isArray(shade.backgroundColor)
                    ? `rgba(${shade.backgroundColor[0]}, ${shade.backgroundColor[1]}, ${shade.backgroundColor[2]}, 1)`
                    : undefined,
                }}
              />
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
)

export default PalettePreview
