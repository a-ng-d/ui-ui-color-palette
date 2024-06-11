export const tokens = {
  "theme": {
    "colors": {
      "primary": {
        "light": {
          "50": "#e9f4f6",
          "100": "#bedfe3",
          "200": "#93c9d0",
          "300": "#6ab2bc",
          "400": "#419ba7",
          "500": "#0e8390",
          "600": "#006c79",
          "700": "#005460",
          "800": "#003d47",
          "900": "#00272f",
          "source": "#88ebf9"
        },
        "dark": {
          "50": "#e9f4f6",
          "100": "#bedfe3",
          "200": "#93c9d0",
          "300": "#6ab2bc",
          "400": "#419ba7",
          "500": "#0e8390",
          "600": "#006c79",
          "700": "#005460",
          "800": "#003d47",
          "900": "#00272f",
          "source": "#88ebf9"
        }
      },
      "neutral": {
        "light": {
          "50": "#eef3f3",
          "100": "#cedadc",
          "200": "#afc2c4",
          "300": "#91aaad",
          "400": "#769296",
          "500": "#5d7b7f",
          "600": "#466468",
          "700": "#314d51",
          "800": "#20373b",
          "900": "#102325",
          "source": "#1d3a3e"
        },
        "dark": {
          "50": "#eef3f3",
          "100": "#cedadc",
          "200": "#afc2c4",
          "300": "#91aaad",
          "400": "#769296",
          "500": "#5d7b7f",
          "600": "#466468",
          "700": "#314d51",
          "800": "#20373b",
          "900": "#102325",
          "source": "#1d3a3e"
        }
      },
      "success": {
        "light": {
          "50": "#e7f6ef",
          "100": "#b7e3d0",
          "200": "#87d0b1",
          "300": "#56bb95",
          "400": "#0fa57a",
          "500": "#008d61",
          "600": "#00754a",
          "700": "#005d36",
          "800": "#004424",
          "900": "#002c14",
          "source": "#61efbc"
        },
        "dark": {
          "50": "#e7f6ef",
          "100": "#b7e3d0",
          "200": "#87d0b1",
          "300": "#56bb95",
          "400": "#0fa57a",
          "500": "#008d61",
          "600": "#00754a",
          "700": "#005d36",
          "800": "#004424",
          "900": "#002c14",
          "source": "#61efbc"
        }
      },
      "warning": {
        "light": {
          "50": "#f5f1ea",
          "100": "#e1d6c1",
          "200": "#cdbc9b",
          "300": "#b8a277",
          "400": "#a28856",
          "500": "#8b7039",
          "600": "#74591f",
          "700": "#5c4307",
          "800": "#442f00",
          "900": "#2c1c00",
          "source": "#f2d499"
        },
        "dark": {
          "50": "#f5f1ea",
          "100": "#e1d6c1",
          "200": "#cdbc9b",
          "300": "#b8a277",
          "400": "#a28856",
          "500": "#8b7039",
          "600": "#74591f",
          "700": "#5c4307",
          "800": "#442f00",
          "900": "#2c1c00",
          "source": "#f2d499"
        }
      },
      "caution": {
        "light": {
          "50": "#f7eff4",
          "100": "#e5d1de",
          "200": "#d3b3c7",
          "300": "#bf96b1",
          "400": "#aa7c9a",
          "500": "#936383",
          "600": "#7b4c6c",
          "700": "#623755",
          "800": "#48243e",
          "900": "#2f1427",
          "source": "#e6b0d4"
        },
        "dark": {
          "50": "#f7eff4",
          "100": "#e5d1de",
          "200": "#d3b3c7",
          "300": "#bf96b1",
          "400": "#aa7c9a",
          "500": "#936383",
          "600": "#7b4c6c",
          "700": "#623755",
          "800": "#48243e",
          "900": "#2f1427",
          "source": "#e6b0d4"
        }
      }
    }
  }
}

export const uicpTheme = {
  default: {
    colors: {
      brand: tokens.theme.colors.primary.light['900'],
      brandAccent: tokens.theme.colors.primary.light['800'],
      brandButtonText: tokens.theme.colors.primary.light['50'],
      defaultButtonBackground: tokens.theme.colors.primary.light['100'],
      defaultButtonBackgroundHover: tokens.theme.colors.primary.light['200'],
      defaultButtonBorder: tokens.theme.colors.primary.light['900'],
      defaultButtonText: tokens.theme.colors.primary.light['900'],
      dividerBackground: tokens.theme.colors.primary.light['900'],
      inputBackground: tokens.theme.colors.primary.light['50'],
      inputBorder: tokens.theme.colors.primary.light['900'],
      inputBorderHover: tokens.theme.colors.primary.light['200'],
      inputBorderFocus: tokens.theme.colors.warning.light['200'],
      inputText: tokens.theme.colors.primary.light['900'],
      inputLabelText: tokens.theme.colors.primary.light['900'],
      inputPlaceholder: tokens.theme.colors.primary.light['400'],
      messageText: tokens.theme.colors.success.light['700'],
      messageBackground: tokens.theme.colors.success.light['100'],
      messageBorder: tokens.theme.colors.success.light['200'],
      messageTextDanger: tokens.theme.colors.caution.light['700'],
      messageBackgroundDanger: tokens.theme.colors.caution.light['100'],
      messageBorderDanger: tokens.theme.colors.caution.light['200'],
      anchorTextColor: tokens.theme.colors.primary.light['900'],
      anchorTextHoverColor: tokens.theme.colors.primary.light['800'],
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
      bodyFontFamily: `"Lexend", sans-serif`,
      buttonFontFamily: `"Lexend", sans-serif`,
      inputFontFamily: `"Lexend", sans-serif`,
      labelFontFamily: `"Lexend", sans-serif`,
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
      brand: tokens.theme.colors.primary.dark['source'],
      brandAccent: tokens.theme.colors.primary.dark['400'],
      brandButtonText: tokens.theme.colors.primary.dark['900'],
      defaultButtonBackground: tokens.theme.colors.primary.dark['800'],
      defaultButtonBackgroundHover: tokens.theme.colors.primary.dark['700'],
      defaultButtonBorder: tokens.theme.colors.primary.dark['source'],
      defaultButtonText: tokens.theme.colors.primary.dark['source'],
      dividerBackground: tokens.theme.colors.primary.dark['source'],
      inputBackground: tokens.theme.colors.primary.dark['900'],
      inputBorder: tokens.theme.colors.primary.dark['source'],
      inputBorderHover: tokens.theme.colors.primary.dark['400'],
      inputBorderFocus: tokens.theme.colors.warning.dark['300'],
      inputText: tokens.theme.colors.primary.dark['source'],
      inputLabelText: tokens.theme.colors.primary.dark['source'],
      inputPlaceholder: tokens.theme.colors.primary.dark['400'],
      messageText: tokens.theme.colors.success.dark['100'],
      messageBackground: tokens.theme.colors.success.dark['800'],
      messageBorder: tokens.theme.colors.success.dark['700'],
      messageTextDanger: tokens.theme.colors.caution.dark['100'],
      messageBackgroundDanger: tokens.theme.colors.caution.dark['800'],
      messageBorderDanger: tokens.theme.colors.caution.dark['700'],
      anchorTextColor: tokens.theme.colors.primary.dark['source'],
      anchorTextHoverColor: tokens.theme.colors.primary.dark['400'],
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
      bodyFontFamily: `"Lexend", sans-serif`,
      buttonFontFamily: `"Lexend", sans-serif`,
      inputFontFamily: `"Lexend", sans-serif`,
      labelFontFamily: `"Lexend", sans-serif`,
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