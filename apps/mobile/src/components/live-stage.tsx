import IVSPlayer, { PlayerState, type Quality } from 'amazon-ivs-react-native-player';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { LiveStageProps, LiveStreamStatus } from './live-stage.types';

const playbackUrl = process.env.EXPO_PUBLIC_PLAYBACK_URL?.trim() ?? '';

const statusCopy: Record<LiveStreamStatus, { label: string; title: string; description: string }> = {
  loading: {
    label: '연결 중',
    title: '방송 연결 중',
    description: '라이브 신호를 불러오고 있어요',
  },
  live: {
    label: 'LIVE',
    title: '',
    description: '',
  },
  ended: {
    label: '방송 종료',
    title: '방송이 종료되었어요',
    description: '다시 시작되면 재연결해 주세요',
  },
  error: {
    label: '재생 오류',
    title: '방송을 불러올 수 없어요',
    description: '방송 상태와 네트워크를 확인해 주세요',
  },
  unconfigured: {
    label: '설정 필요',
    title: '재생 주소가 필요해요',
    description: 'Playback URL 설정을 확인해 주세요',
  },
};

export function LiveStage({ onStatusChange }: LiveStageProps) {
  const theme = useTheme();
  const [status, setStatus] = useState<LiveStreamStatus>(playbackUrl ? 'loading' : 'unconfigured');
  const [quality, setQuality] = useState<Quality | null>(null);
  const [playerKey, setPlayerKey] = useState(0);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  const handlePlayerStateChange = (playerState: PlayerState) => {
    switch (playerState) {
      case PlayerState.Playing:
        setStatus('live');
        break;
      case PlayerState.Ended:
        setStatus('ended');
        break;
      case PlayerState.Ready:
      case PlayerState.Buffering:
        setStatus('loading');
        break;
      case PlayerState.Idle:
        setStatus((current) => (current === 'error' || current === 'ended' ? current : 'loading'));
        break;
    }
  };

  const handleRetry = () => {
    setQuality(null);
    setStatus('loading');
    setPlayerKey((current) => current + 1);
  };

  const copy = statusCopy[status];
  const statusColor = status === 'live' ? theme.live : status === 'loading' ? '#F2C14E' : theme.videoMuted;
  const qualityLabel = quality?.name || (quality?.height ? `${quality.height}p` : 'AUTO');
  const showRetry = status === 'error' || status === 'ended';

  return (
    <View style={[styles.stage, { backgroundColor: theme.video, borderColor: theme.border }]}>
      {playbackUrl ? (
        <IVSPlayer
          key={playerKey}
          streamUrl={playbackUrl}
          style={styles.player}
          autoplay
          liveLowLatency
          rebufferToLive
          networkRecoveryMode="resume"
          resizeMode="aspectFit"
          onLoadStart={() => setStatus('loading')}
          onPlayerStateChange={handlePlayerStateChange}
          onQualityChange={setQuality}
          onRebuffering={() => setStatus('loading')}
          onError={() => setStatus('error')}
        />
      ) : null}

      <View style={styles.topBar}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{copy.label}</Text>
        </View>
        <Text style={styles.qualityText}>{qualityLabel}</Text>
      </View>

      {status !== 'live' ? (
        <View style={styles.stateOverlay}>
          {status === 'loading' ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View style={styles.iconFrame}>
              <SymbolView
                name={{
                  ios: status === 'error' ? 'exclamationmark.triangle.fill' : 'video.slash.fill',
                  android: status === 'error' ? 'warning' : 'videocam_off',
                  web: status === 'error' ? 'warning' : 'videocam_off',
                }}
                size={27}
                tintColor="#FFFFFF"
              />
            </View>
          )}
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={[styles.description, { color: theme.videoMuted }]}>{copy.description}</Text>
          {showRetry ? (
            <Pressable
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="방송 다시 연결"
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
              <SymbolView
                name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                size={16}
                tintColor="#FFFFFF"
              />
              <Text style={styles.retryText}>다시 연결</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
  player: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  stateOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9, 11, 12, 0.84)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
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
    textAlign: 'center',
  },
  retryButton: {
    height: 36,
    marginTop: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
