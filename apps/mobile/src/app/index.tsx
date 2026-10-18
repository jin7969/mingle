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
import type { LiveStreamStatus } from '@/components/live-stage.types';
import { MaxContentWidth } from '@/constants/theme';
import { useIvsChat, type ChatConnectionStatus } from '@/hooks/use-ivs-chat';
import { useTheme } from '@/hooks/use-theme';

const nicknamePattern = /^[\p{L}\p{N}_-]{2,20}$/u;

const streamStatusCopy: Record<
  LiveStreamStatus,
  { connection: string; description: string; tag: string }
> = {
  loading: { connection: '연결 중', description: '방송에 연결하고 있습니다', tag: 'CONNECTING' },
  live: { connection: '방송 중', description: '현재 라이브 방송 중입니다', tag: 'LIVE' },
  ended: { connection: '종료됨', description: '방송이 종료되었습니다', tag: 'OFFLINE' },
  error: { connection: '오류', description: '영상을 불러오지 못했습니다', tag: 'ERROR' },
  unconfigured: { connection: '설정 필요', description: '재생 주소 설정이 필요합니다', tag: 'SETUP' },
};

const chatStatusCopy: Record<ChatConnectionStatus, string> = {
  idle: '입장 전',
  connecting: '연결 중',
  connected: '연결됨',
  reconnecting: '재연결 중',
  disconnected: '연결 끊김',
  error: '연결 오류',
  unconfigured: '설정 필요',
};

export default function BroadcastScreen() {
  const theme = useTheme();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const messageInputRef = useRef<TextInput>(null);
  const [nickname, setNickname] = useState('');
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<LiveStreamStatus>('loading');
  const {
    activeNickname,
    status: chatStatus,
    messages,
    error: chatError,
    isSending,
    connect: connectChat,
    disconnect: disconnectChat,
    retry: retryChat,
    sendMessage,
    clearError: clearChatError,
  } = useIvsChat();
  const streamCopy = streamStatusCopy[streamStatus];
  const streamColor =
    streamStatus === 'live'
      ? theme.live
      : streamStatus === 'loading'
        ? theme.accent
        : theme.textSecondary;
  const isChatConnected = chatStatus === 'connected';
  const isChatBusy = chatStatus === 'connecting' || chatStatus === 'reconnecting';
  const chatStatusColor =
    isChatConnected
      ? theme.accent
      : chatStatus === 'error' || chatStatus === 'disconnected'
        ? theme.live
        : theme.textSecondary;
  const displayError = formError ?? chatError;

  const clearErrors = () => {
    setFormError(null);
    clearChatError();
  };

  const handleJoinChat = () => {
    const cleanNickname = nickname.trim();
    if (!nicknamePattern.test(cleanNickname)) {
      setFormError('닉네임은 2~20자의 한글, 영문, 숫자로 입력해 주세요.');
      return;
    }

    clearErrors();
    connectChat(cleanNickname);
  };

  const handleNicknameAction = () => {
    if (isChatConnected) {
      disconnectChat();
      setNickname('');
      setDraft('');
      return;
    }
    if (activeNickname && activeNickname === nickname.trim()) {
      retryChat();
      return;
    }
    handleJoinChat();
  };

  const handleSend = async () => {
    const cleanMessage = draft.trim();

    if (!isChatConnected) {
      setFormError('닉네임을 입력하고 채팅에 먼저 입장해 주세요.');
      return;
    }
    if (!cleanMessage) {
      setFormError('메시지를 입력해 주세요.');
      return;
    }

    clearErrors();
    try {
      await sendMessage(cleanMessage);
      setDraft('');
      Keyboard.dismiss();
    } catch {
      // The chat hook exposes a user-facing send error and keeps the draft intact.
    }
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
              <View style={[styles.connectionDot, { backgroundColor: streamColor }]} />
              <Text style={[styles.connectionText, { color: streamColor }]}>{streamCopy.connection}</Text>
            </View>
          </View>

          <View style={styles.stageInset}>
            <LiveStage onStatusChange={setStreamStatus} />
          </View>

          <View style={[styles.broadcastInfo, { borderBottomColor: theme.border }]}>
            <View style={styles.broadcastCopy}>
              <Text style={[styles.broadcastTitle, { color: theme.text }]}>Mingle 라이브</Text>
              <Text style={[styles.broadcastDescription, { color: theme.textSecondary }]}>
                {streamCopy.description}
              </Text>
            </View>
            <View style={[styles.offlineTag, { borderColor: streamColor }]}>
              <Text style={[styles.offlineTagText, { color: streamColor }]}>{streamCopy.tag}</Text>
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
            <View style={styles.chatMeta}>
              <View style={styles.chatConnection}>
                <View style={[styles.chatConnectionDot, { backgroundColor: chatStatusColor }]} />
                <Text style={[styles.chatConnectionText, { color: chatStatusColor }]}>
                  {chatStatusCopy[chatStatus]}
                </Text>
              </View>
              <Text style={[styles.messageCount, { color: theme.textSecondary }]}>{messages.length}</Text>
            </View>
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
                <Text style={[styles.emptyChatDescription, { color: theme.textSecondary }]}>
                  {isChatConnected ? '첫 메시지를 보내 대화를 시작해 보세요' : '닉네임을 입력하고 채팅에 입장해 주세요'}
                </Text>
              </View>
            }
          />

          <View style={[styles.composer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
            {displayError && <Text style={[styles.errorText, { color: theme.live }]}>{displayError}</Text>}
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
                  if (displayError) clearErrors();
                }}
                onSubmitEditing={isChatConnected ? () => messageInputRef.current?.focus() : handleJoinChat}
                placeholder="닉네임"
                placeholderTextColor={theme.textSecondary}
                maxLength={20}
                autoCapitalize="none"
                editable={!isChatBusy && !isChatConnected}
                returnKeyType={isChatConnected ? 'next' : 'done'}
                style={[styles.nicknameInput, { color: theme.text }]}
                accessibilityLabel="채팅 닉네임"
              />
              <Pressable
                onPress={handleNicknameAction}
                disabled={isChatBusy || chatStatus === 'unconfigured'}
                accessibilityRole="button"
                accessibilityLabel={isChatConnected ? '닉네임 변경' : '채팅 입장 또는 재연결'}
                style={({ pressed }) => [
                  styles.joinButton,
                  { borderColor: theme.border },
                  (isChatBusy || chatStatus === 'unconfigured') && styles.joinButtonDisabled,
                  pressed && styles.joinButtonPressed,
                ]}>
                <SymbolView
                  name={{
                    ios: isChatConnected
                      ? 'pencil'
                      : activeNickname === nickname.trim()
                        ? 'arrow.clockwise'
                        : 'person.badge.plus',
                    android: isChatConnected
                      ? 'edit'
                      : activeNickname === nickname.trim()
                        ? 'refresh'
                        : 'person_add',
                    web: isChatConnected
                      ? 'edit'
                      : activeNickname === nickname.trim()
                        ? 'refresh'
                        : 'person_add',
                  }}
                  size={14}
                  tintColor={theme.textSecondary}
                />
                <Text style={[styles.joinButtonText, { color: theme.textSecondary }]}>
                  {isChatConnected ? '변경' : activeNickname === nickname.trim() ? '재연결' : '입장'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.messageRow}>
              <TextInput
                ref={messageInputRef}
                value={draft}
                onChangeText={(value) => {
                  setDraft(value);
                  if (displayError) clearErrors();
                }}
                onSubmitEditing={handleSend}
                placeholder={isChatConnected ? '메시지를 입력하세요' : '채팅에 입장하면 메시지를 보낼 수 있어요'}
                placeholderTextColor={theme.textSecondary}
                maxLength={500}
                returnKeyType="send"
                editable={isChatConnected && !isSending}
                style={[
                  styles.messageInput,
                  { color: theme.text, backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                ]}
                accessibilityLabel="채팅 메시지"
              />
              <Pressable
                onPress={handleSend}
                disabled={!isChatConnected || !draft.trim() || isSending}
                accessibilityRole="button"
                accessibilityLabel="메시지 보내기"
                style={({ pressed }) => [
                  styles.sendButton,
                  { backgroundColor: theme.accent },
                  (!isChatConnected || !draft.trim() || isSending) && styles.sendButtonDisabled,
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
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chatConnectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chatConnectionText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
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
  joinButton: {
    height: 28,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  joinButtonDisabled: {
    opacity: 0.45,
  },
  joinButtonPressed: {
    opacity: 0.7,
  },
  joinButtonText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
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
