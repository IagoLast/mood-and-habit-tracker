import { View, ViewProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...rest }: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = darkColor || lightColor || Colors[colorScheme].background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
