import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessageRow, type ChatMessage } from '@/components/chat-message-row';
import { LiveStage } from '@/components/live-stage';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const nicknamePattern = /^[\p{L}\p{N}_-]{2,20}$/u;

export default function BroadcastScreen() {
  const theme = useTheme();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const messageInputRef = useRef<TextInput>(null);
  const [nickname, setNickname] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = () => {
    const cleanNickname = nickname.trim();
    const cleanMessage = draft.trim();

    if (!nicknamePattern.test(cleanNickname)) {
      setError('닉네임은 2~20자의 한글, 영문, 숫자로 입력해 주세요.');
      return;
    }
    if (!cleanMessage) {
      setError('메시지를 입력해 주세요.');
      return;
    }

    const now = new Date();
    setMessages((current) => [
      ...current,
      {
        id: `${now.getTime()}-${current.length}`,
        nickname: cleanNickname,
        text: cleanMessage,
        sentAt: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setDraft('');
    setError(null);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.brand, { color: theme.accent }]}>MINGLE</Text>
              <Text style={[styles.screenTitle, { color: theme.text }]}>라이브 방송</Text>
            </View>
            <View style={[styles.connectionBadge, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.connectionDot, { backgroundColor: theme.textSecondary }]} />
              <Text style={[styles.connectionText, { color: theme.textSecondary }]}>연결 전</Text>
            </View>
          </View>

          <View style={styles.stageInset}>
            <LiveStage />
          </View>

          <View style={[styles.broadcastInfo, { borderBottomColor: theme.border }]}>
            <View style={styles.broadcastCopy}>
              <Text style={[styles.broadcastTitle, { color: theme.text }]}>Mingle 라이브</Text>
              <Text style={[styles.broadcastDescription, { color: theme.textSecondary }]}>현재 방송을 준비하고 있습니다</Text>
            </View>
            <View style={[styles.offlineTag, { borderColor: theme.border }]}>
              <Text style={[styles.offlineTagText, { color: theme.textSecondary }]}>OFFLINE</Text>
            </View>
          </View>

          <View style={styles.chatHeader}>
            <View style={styles.chatTitleRow}>
              <SymbolView
                name={{ ios: 'bubble.left.fill', android: 'chat_bubble', web: 'chat_bubble' }}
                size={17}
                tintColor={theme.text}
              />
              <Text style={[styles.chatTitle, { color: theme.text }]}>실시간 채팅</Text>
            </View>
            <Text style={[styles.messageCount, { color: theme.textSecondary }]}>{messages.length}</Text>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatMessageRow message={item} />}
            style={styles.messageList}
            contentContainerStyle={messages.length === 0 ? styles.emptyListContent : styles.listContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => messages.length > 0 && listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={[styles.emptyChatTitle, { color: theme.text }]}>아직 메시지가 없어요</Text>
                <Text style={[styles.emptyChatDescription, { color: theme.textSecondary }]}>라이브가 시작되면 대화를 나눌 수 있어요</Text>
              </View>
            }
          />

          <View style={[styles.composer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
            {error && <Text style={[styles.errorText, { color: theme.live }]}>{error}</Text>}
            <View style={styles.nicknameRow}>
              <SymbolView
                name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                size={17}
                tintColor={theme.textSecondary}
              />
              <TextInput
                value={nickname}
                onChangeText={(value) => {
                  setNickname(value);
                  if (error) setError(null);
                }}
                onSubmitEditing={() => messageInputRef.current?.focus()}
                placeholder="닉네임"
                placeholderTextColor={theme.textSecondary}
                maxLength={20}
                autoCapitalize="none"
                returnKeyType="next"
                style={[styles.nicknameInput, { color: theme.text }]}
                accessibilityLabel="채팅 닉네임"
              />
            </View>
            <View style={styles.messageRow}>
              <TextInput
                ref={messageInputRef}
                value={draft}
                onChangeText={(value) => {
                  setDraft(value);
                  if (error) setError(null);
                }}
                onSubmitEditing={handleSend}
                placeholder="메시지를 입력하세요"
                placeholderTextColor={theme.textSecondary}
                maxLength={500}
                returnKeyType="send"
                style={[
                  styles.messageInput,
                  { color: theme.text, backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                ]}
                accessibilityLabel="채팅 메시지"
              />
              <Pressable
                onPress={handleSend}
                disabled={!draft.trim()}
                accessibilityRole="button"
                accessibilityLabel="메시지 보내기"
                style={({ pressed }) => [
                  styles.sendButton,
                  { backgroundColor: theme.accent },
                  !draft.trim() && styles.sendButtonDisabled,
                  pressed && styles.sendButtonPressed,
                ]}>
                <SymbolView
                  name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
                  size={21}
                  tintColor={theme.accentContrast}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flex: 1,
    alignSelf: 'center',
  },
  header: {
    minHeight: 70,
    boxSizing: 'border-box',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageInset: {
    boxSizing: 'border-box',
    paddingHorizontal: 16,
  },
  brand: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  connectionBadge: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  broadcastInfo: {
    minHeight: 70,
    boxSizing: 'border-box',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  broadcastCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  broadcastTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  broadcastDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  offlineTag: {
    height: 24,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineTagText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },
  chatHeader: {
    minHeight: 48,
    boxSizing: 'border-box',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  messageCount: {
    minWidth: 24,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  messageList: {
    flex: 1,
    minHeight: 96,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  emptyChat: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 16,
  },
  emptyChatTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  emptyChatDescription: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  composer: {
    boxSizing: 'border-box',
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: Platform.select({ ios: 6, default: 12 }),
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  nicknameRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  nicknameInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    width: 0,
    minWidth: 0,
    height: 44,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.38,
  },
  sendButtonPressed: {
    opacity: 0.72,
  },
});
