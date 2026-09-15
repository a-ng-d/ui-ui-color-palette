import { KeyboardEvent, MouseEvent } from 'preact/compat'
import { ComponentChildren } from 'preact'
import { PaletteDataColorItem } from '@yelbolt/engine-ui-color-palette'
import { doClassnames } from '@unoff/utils'
import { Card, texts } from '@unoff/ui'
import PalettePreview from './PalettePreview'

interface PaletteCardProps {
  src?: string
  colors?: Array<PaletteDataColorItem>
  name: string
  description?: string
  subdescription?: string
  indicator?: {
    label: string
    status: 'ACTIVE' | 'INACTIVE'
  }
  actionsSlot?: ComponentChildren
  action: () => void
}

const PaletteCard = ({
  src,
  colors,
  name,
  description,
  subdescription,
  indicator,
  actionsSlot,
  action,
}: PaletteCardProps) => (
  <Card
    tag={indicator?.label}
    src={src}
    insert={
      src === undefined && colors !== undefined ? (
        <PalettePreview
          colors={colors}
          isFullHeight
          isFree
        />
      ) : undefined
    }
    actions={actionsSlot}
    richText={
      <div className="palettes-mosaic__text">
        <span
          className={doClassnames([
            texts.type,
            texts['type--large'],
            texts['type--bold'],
          ])}
        >
          {name}
        </span>
        {description !== undefined && (
          <span
            className={doClassnames([texts.type, texts['type--secondary']])}
          >
            {description}
          </span>
        )}
        {subdescription !== undefined && (
          <span className={doClassnames([texts.type, texts['type--tertiary']])}>
            {subdescription}
          </span>
        )}
      </div>
    }
    shouldFill
    action={action}
  />
)

export default PaletteCard
