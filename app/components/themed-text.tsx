import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

function getDefaultFont(): string {
  const fonts = Fonts;
  if (!fonts) return 'normal';
  if (typeof fonts === 'string') return fonts;
  if ('default' in fonts) {
    const defaultFont = fonts.default;
    return typeof defaultFont === 'string' ? defaultFont : 'normal';
  }
  return 'normal';
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const color = darkColor || lightColor || Colors[colorScheme].text;
  const defaultFont = getDefaultFont();

  return (
    <Text
      style={[
        { color },
        type === 'default' ? { ...styles.default, fontFamily: defaultFont } : undefined,
        type === 'defaultSemiBold' ? { ...styles.defaultSemiBold, fontFamily: defaultFont } : undefined,
        type === 'title' ? { ...styles.title, fontFamily: defaultFont } : undefined,
        type === 'subtitle' ? { ...styles.subtitle, fontFamily: defaultFont } : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
