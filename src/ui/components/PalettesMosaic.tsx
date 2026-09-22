import { ComponentChildren } from 'preact'

interface PalettesMosaicProps {
  children: ComponentChildren
}

const PalettesMosaic = ({ children }: PalettesMosaicProps) => (
  <li className="palettes-mosaic">
    <div className="palettes-mosaic__grid">{children}</div>
  </li>
)

export default PalettesMosaic
