/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#6B9080';
const tintColorDark = '#A7C4B5';

export const Colors = {
  light: {
    text: '#2D2A26',
    background: '#FDFBF7',
    tint: tintColorLight,
    icon: '#8B8178',
    tabIconDefault: '#8B8178',
    tabIconSelected: tintColorLight,
    surface: '#F7F5F0',
    successLight: '#E8F0EC',
  },
  dark: {
    text: '#F5F2ED',
    background: '#1C1917',
    tint: tintColorDark,
    icon: '#A89F94',
    tabIconDefault: '#A89F94',
    tabIconSelected: tintColorDark,
    surface: '#292524',
    successLight: '#2D3830',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
    /** Default font for the app */
    default: 'ui-rounded',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    default: 'normal',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    default: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
  },
});
