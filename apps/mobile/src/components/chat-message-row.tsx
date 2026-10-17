import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type ChatMessage = {
  id: string;
  nickname: string;
  text: string;
  sentAt: string;
};

type ChatMessageRowProps = {
  message: ChatMessage;
};

export function ChatMessageRow({ message }: ChatMessageRowProps) {
  const theme = useTheme();
  const initial = Array.from(message.nickname)[0]?.toUpperCase() ?? '?';

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
        <Text style={[styles.avatarText, { color: theme.accent }]}>{initial}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={[styles.nickname, { color: theme.text }]}>
            {message.nickname}
          </Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{message.sentAt}</Text>
        </View>
        <Text style={[styles.message, { color: theme.text }]}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 9,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metaRow: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nickname: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
});
