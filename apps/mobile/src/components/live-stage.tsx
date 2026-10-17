import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LiveStage() {
  const theme = useTheme();

  return (
    <View style={[styles.stage, { backgroundColor: theme.video, borderColor: theme.border }]}>
      <View style={styles.topBar}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: theme.videoMuted }]} />
          <Text style={styles.statusText}>연결 전</Text>
        </View>
        <Text style={styles.qualityText}>HD</Text>
      </View>

      <View style={styles.emptyState}>
        <View style={styles.iconFrame}>
          <SymbolView
            name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
            size={28}
            tintColor="#FFFFFF"
          />
        </View>
        <Text style={styles.title}>방송 준비 중</Text>
        <Text style={[styles.description, { color: theme.videoMuted }]}>라이브 신호를 기다리고 있어요</Text>
      </View>
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
  },
  topBar: {
    position: 'absolute',
    zIndex: 1,
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  qualityText: {
    color: '#FFFFFF',
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconFrame: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
