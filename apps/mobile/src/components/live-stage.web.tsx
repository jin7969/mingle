import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { LiveStageProps } from './live-stage.types';

export function LiveStage({ onStatusChange }: LiveStageProps) {
  const theme = useTheme();

  useEffect(() => {
    onStatusChange?.('error');
  }, [onStatusChange]);

  return (
    <View style={[styles.stage, { backgroundColor: theme.video, borderColor: theme.border }]}> 
      <SymbolView name={{ web: 'smartphone' }} size={28} tintColor="#FFFFFF" />
      <Text style={styles.title}>iOS 개발 앱에서 확인해 주세요</Text>
      <Text style={[styles.description, { color: theme.videoMuted }]}>IVS 플레이어는 웹에서 실행되지 않아요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
