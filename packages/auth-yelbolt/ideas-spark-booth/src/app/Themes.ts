import { Theme } from '@supabase/auth-ui-shared'

export const colors = {
  color: {
    Primary: {
      '1': {
        value: '#ffff8c',
        comment: 'Shade color with 100% of lightness',
      },
      '2': {
        value: '#f5f166',
        comment: 'Shade color with 93.5% of lightness',
      },
      '3': {
        value: '#d0c900',
        comment: 'Shade color with 81.6% of lightness',
      },
      '4': {
        value: '#a29800',
        comment: 'Shade color with 66.3% of lightness',
      },
      '5': {
        value: '#6f6200',
        comment: 'Shade color with 48.7% of lightness',
      },
      '6': {
        value: '#443600',
        comment: 'Shade color with 33.4% of lightness',
      },
      '7': {
        value: '#251800',
        comment: 'Shade color with 21.5% of lightness',
      },
      '8': {
        value: '#140900',
        comment: 'Shade color with 15% of lightness',
      },
      source: {
        value: '#fff700',
        comment: 'Source color',
      },
    },
    Neutral: {
      '1': {
        value: '#ffffe8',
        comment: 'Shade color with 100% of lightness',
      },
      '2': {
        value: '#ebecd1',
        comment: 'Shade color with 93.5% of lightness',
      },
      '3': {
        value: '#c5c5a7',
        comment: 'Shade color with 81.6% of lightness',
      },
      '4': {
        value: '#959676',
        comment: 'Shade color with 66.3% of lightness',
      },
      '5': {
        value: '#626244',
        comment: 'Shade color with 48.7% of lightness',
      },
      '6': {
        value: '#39381e',
        comment: 'Shade color with 33.4% of lightness',
      },
      '7': {
        value: '#1b1b06',
        comment: 'Shade color with 21.5% of lightness',
      },
      '8': {
        value: '#0d0c00',
        comment: 'Shade color with 15% of lightness',
      },
      source: {
        value: '#212003',
        comment: 'Source color',
      },
    },
    ISB: {
      '1': {
        value: '#fffec3',
        comment: 'Shade color with 100% of lightness',
      },
      '2': {
        value: '#fee8a8',
        comment: 'Shade color with 93.5% of lightness',
      },
      '3': {
        value: '#dac178',
        comment: 'Shade color with 81.6% of lightness',
      },
      '4': {
        value: '#ab913e',
        comment: 'Shade color with 66.3% of lightness',
      },
      '5': {
        value: '#765c00',
        comment: 'Shade color with 48.7% of lightness',
      },
      '6': {
        value: '#493200',
        comment: 'Shade color with 33.4% of lightness',
      },
      '7': {
        value: '#281500',
        comment: 'Shade color with 21.5% of lightness',
      },
      '8': {
        value: '#160700',
        comment: 'Shade color with 15% of lightness',
      },
      source: {
        value: '#f9dc86',
        comment: 'Source color',
      },
    },
    UICP: {
      '1': {
        value: '#caffff',
        comment: 'Shade color with 100% of lightness',
      },
      '2': {
        value: '#aff8ff',
        comment: 'Shade color with 93.5% of lightness',
      },
      '3': {
        value: '#7ed2de',
        comment: 'Shade color with 81.6% of lightness',
      },
      '4': {
        value: '#42a3b0',
        comment: 'Shade color with 66.3% of lightness',
      },
      '5': {
        value: '#006e7a',
        comment: 'Shade color with 48.7% of lightness',
      },
      '6': {
        value: '#00424d',
        comment: 'Shade color with 33.4% of lightness',
      },
      '7': {
        value: '#00212b',
        comment: 'Shade color with 21.5% of lightness',
      },
      '8': {
        value: '#001119',
        comment: 'Shade color with 15% of lightness',
      },
      source: {
        value: '#88ebf9',
        comment: 'Source color',
      },
    },
    UICS: {
      '1': {
        value: '#c8ffd1',
        comment: 'Shade color with 100% of lightness',
      },
      '2': {
        value: '#acffb7',
        comment: 'Shade color with 93.5% of lightness',
      },
      '3': {
        value: '#7bdd8b',
        comment: 'Shade color with 81.6% of lightness',
      },
      '4': {
        value: '#3cad55',
        comment: 'Shade color with 66.3% of lightness',
      },
      '5': {
        value: '#00761d',
        comment: 'Shade color with 48.7% of lightness',
      },
      '6': {
        value: '#004800',
        comment: 'Shade color with 33.4% of lightness',
      },
      '7': {
        value: '#002600',
        comment: 'Shade color with 21.5% of lightness',
      },
      '8': {
        value: '#001500',
        comment: 'Shade color with 15% of lightness',
      },
      source: {
        value: '#86f999',
        comment: 'Source color',
      },
    },
    TCN: {
      '1': {
        value: '#ffe3fa',
        comment: 'Shade color with 100% of lightness',
      },
      '2': {
        value: '#ffcae4',
        comment: 'Shade color with 93.5% of lightness',
      },
      '3': {
        value: '#ff9fbc',
        comment: 'Shade color with 81.6% of lightness',
      },
      '4': {
        value: '#d76b8c',
        comment: 'Shade color with 66.3% of lightness',
      },
      '5': {
        value: '#9c3459',
        comment: 'Shade color with 48.7% of lightness',
      },
      '6': {
        value: '#670331',
        comment: 'Shade color with 33.4% of lightness',
      },
      '7': {
        value: '#3d0015',
        comment: 'Shade color with 21.5% of lightness',
      },
      '8': {
        value: '#260008',
        comment: 'Shade color with 15% of lightness',
      },
      source: {
        value: '#f985a8',
        comment: 'Source color',
      },
    },
  },
}

export const IsbTheme: Theme = {
  default: {
    colors: {
      brand: colors.color.ISB['source'].value,
      brandAccent: colors.color.ISB['3'].value,
      brandButtonText: colors.color.ISB['6'].value,
      defaultButtonBackground: colors.color.ISB['1'].value,
      defaultButtonBackgroundHover: colors.color.ISB['3'].value,
      defaultButtonBorder: colors.color.ISB['3'].value,
      defaultButtonText: colors.color.ISB['6'].value,
      dividerBackground: colors.color.ISB['3'].value,
      inputBackground: colors.color.ISB['1'].value,
      inputBorder: colors.color.ISB['3'].value,
      inputBorderHover: colors.color.ISB['4'].value,
      inputBorderFocus: colors.color.ISB['5'].value,
      inputText: colors.color.ISB['6'].value,
      inputLabelText: colors.color.ISB['6'].value,
      inputPlaceholder: colors.color.ISB['4'].value,
      messageText: colors.color.ISB['6'].value,
      messageBackground: colors.color.ISB['1'].value,
      messageBorder: colors.color.ISB['1'].value,
      messageTextDanger: colors.color.ISB['1'].value,
      messageBackgroundDanger: colors.color.ISB['1'].value,
      messageBorderDanger: colors.color.ISB['1'].value,
      anchorTextColor: colors.color.ISB['6'].value,
      anchorTextHoverColor: colors.color.ISB['5'].value,
    },
    space: {
      buttonPadding: '16px 16px',
      inputPadding: '16px 16px',
    },
    fontSizes: {
      baseBodySize: '14px',
      baseInputSize: '16px',
      baseLabelSize: '16px',
      baseButtonSize: '16px',
    },
    fonts: {
      bodyFontFamily: "'Lexend', sans-serif",
      buttonFontFamily: "'Lexend', sans-serif",
      inputFontFamily: "'Lexend', sans-serif",
      labelFontFamily: "'Lexend', sans-serif",
    },
    borderWidths: {
      buttonBorderWidth: '2px',
      inputBorderWidth: '2px',
    },
    radii: {
      borderRadiusButton: '8px',
      buttonBorderRadius: '8px',
      inputBorderRadius: '8px',
    },
  },
  dark: {
    colors: {
      brand: colors.color.ISB['source'].value,
      brandAccent: colors.color.ISB['2'].value,
      brandButtonText: colors.color.ISB['6'].value,
      defaultButtonBackground: colors.color.ISB['1'].value,
      defaultButtonBackgroundHover: colors.color.ISB['2'].value,
      defaultButtonBorder: colors.color.ISB['2'].value,
      defaultButtonText: colors.color.ISB['6'].value,
      dividerBackground: colors.color.ISB['4'].value,
      inputBackground: colors.color.ISB['6'].value,
      inputBorder: colors.color.ISB['4'].value,
      inputBorderHover: colors.color.ISB['3'].value,
      inputBorderFocus: colors.color.ISB['2'].value,
      inputText: colors.color.ISB['1'].value,
      inputLabelText: colors.color.ISB['1'].value,
      inputPlaceholder: colors.color.ISB['3'].value,
      messageText: colors.color.ISB['1'].value,
      messageBackground: colors.color.ISB['3'].value,
      messageBorder: colors.color.ISB['2'].value,
      messageTextDanger: colors.color.ISB['6'].value,
      messageBackgroundDanger: colors.color.ISB['1'].value,
      messageBorderDanger: colors.color.ISB['2'].value,
      anchorTextColor: colors.color.ISB['1'].value,
      anchorTextHoverColor: colors.color.ISB['2'].value,
    },
    space: {
      buttonPadding: '16px 16px',
      inputPadding: '16px 16px',
    },
    fontSizes: {
      baseBodySize: '14px',
      baseInputSize: '16px',
      baseLabelSize: '16px',
      baseButtonSize: '16px',
    },
    fonts: {
      bodyFontFamily: 'var(--font-lexend)',
      buttonFontFamily: 'var(--font-lexend)',
      inputFontFamily: 'var(--font-lexend)',
      labelFontFamily: 'var(--font-lexend)',
    },
    borderWidths: {
      buttonBorderWidth: '2px',
      inputBorderWidth: '2px',
    },
    radii: {
      borderRadiusButton: '8px',
      buttonBorderRadius: '8px',
      inputBorderRadius: '8px',
    },
  },
}
