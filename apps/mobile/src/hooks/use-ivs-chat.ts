import type {
  ChatRoom as IvsChatRoom,
  ChatMessage as IvsChatMessage,
  ChatToken,
  DisconnectReason,
} from 'amazon-ivs-chat-messaging';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '@/components/chat-message-row';

const tokenApiUrl = process.env.EXPO_PUBLIC_CHAT_TOKEN_API_URL?.trim() ?? '';
const websocketUrl = process.env.EXPO_PUBLIC_CHAT_WEBSOCKET_URL?.trim() ?? '';
const maxMessages = 100;
const reconnectDelayMs = 3000;
const loadChatSdk = () => import('amazon-ivs-chat-messaging');

export type ChatConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error'
  | 'unconfigured';

type TokenResponse = {
  token?: string;
  sessionExpirationTime?: string;
  tokenExpirationTime?: string;
  message?: string;
};

async function requestChatToken(nickname: string): Promise<ChatToken> {
  const response = await fetch(tokenApiUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nickname, mode: 'participant' }),
  });

  let body: TokenResponse = {};
  try {
    body = (await response.json()) as TokenResponse;
  } catch {
    // The status code below still provides a useful error when the body is not JSON.
  }

  if (!response.ok || !body.token) {
    throw new Error(body.message || `Chat token request failed (${response.status}).`);
  }

  return {
    token: body.token,
    sessionExpirationTime: body.sessionExpirationTime,
    tokenExpirationTime: body.tokenExpirationTime,
  };
}

function toChatMessage(message: IvsChatMessage): ChatMessage {
  return {
    id: message.id,
    nickname: message.sender.attributes?.nickname || '익명',
    text: message.content,
    sentAt: message.sendTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function connectionErrorMessage(reason: DisconnectReason) {
  if (reason === 'fetchTokenError') return '채팅 인증에 실패했습니다. 잠시 후 다시 연결합니다.';
  if (reason === 'serverDisconnect') return '채팅 연결이 서버에서 종료되었습니다.';
  return '채팅 연결이 끊겼습니다. 잠시 후 다시 연결합니다.';
}

function sendErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'errorCode' in error) {
    const code = Number(error.errorCode);
    if (code === 403) return '메시지 전송 권한이 없습니다.';
    if (code === 406) return '보낼 수 없는 메시지입니다.';
    if (code === 413) return '메시지가 너무 깁니다.';
    if (code === 429) return '메시지를 너무 빠르게 보내고 있습니다.';
  }
  return '메시지를 보내지 못했습니다. 다시 시도해 주세요.';
}

export function useIvsChat() {
  const configured = Boolean(tokenApiUrl && websocketUrl);
  const roomRef = useRef<IvsChatRoom | null>(null);
  const [activeNickname, setActiveNickname] = useState<string | null>(null);
  const [roomVersion, setRoomVersion] = useState(0);
  const [status, setStatus] = useState<ChatConnectionStatus>(configured ? 'idle' : 'unconfigured');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(
    configured ? null : '채팅 서버 설정을 확인해 주세요.',
  );
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!configured) {
      return;
    }
    if (!activeNickname) {
      roomRef.current = null;
      return;
    }

    let disposed = false;
    let hasConnected = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let room: IvsChatRoom | null = null;
    const unsubscribe: (() => void)[] = [];

    const setupRoom = async () => {
      try {
        const { ChatRoom } = await loadChatSdk();
        if (disposed) return;

        const nextRoom = new ChatRoom({
          regionOrUrl: websocketUrl,
          tokenProvider: () => requestChatToken(activeNickname),
          maxReconnectAttempts: 5,
        });
        nextRoom.logLevel = 'error';
        room = nextRoom;
        roomRef.current = nextRoom;

        unsubscribe.push(
          nextRoom.addListener('connecting', () => {
            if (!disposed) setStatus(hasConnected ? 'reconnecting' : 'connecting');
          }),
          nextRoom.addListener('connect', () => {
            if (disposed) return;
            hasConnected = true;
            setStatus('connected');
            setError(null);
          }),
          nextRoom.addListener('disconnect', (reason) => {
            if (disposed || reason === 'clientDisconnect') return;

            setError(connectionErrorMessage(reason));
            if (reason === 'serverDisconnect') {
              setStatus('error');
              return;
            }

            setStatus('disconnected');
            reconnectTimer = setTimeout(() => {
              if (disposed || nextRoom.state !== 'disconnected') return;
              setStatus('reconnecting');
              nextRoom.connect();
            }, reconnectDelayMs);
          }),
          nextRoom.addListener('message', (message) => {
            if (disposed) return;
            setMessages((current) => [...current, toChatMessage(message)].slice(-maxMessages));
          }),
          nextRoom.addListener('messageDelete', ({ messageId }) => {
            if (!disposed) {
              setMessages((current) => current.filter((message) => message.id !== messageId));
            }
          }),
        );

        nextRoom.connect();
      } catch {
        if (disposed) return;
        setStatus('error');
        setError('채팅 기능을 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    };

    void setupRoom();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      unsubscribe.forEach((removeListener) => removeListener());
      if (roomRef.current === room) roomRef.current = null;
      if (room && room.state !== 'disconnected') room.disconnect();
    };
  }, [activeNickname, configured, roomVersion]);

  const connect = useCallback(
    (nickname: string) => {
      const cleanNickname = nickname.trim();
      if (!configured) {
        setError('채팅 서버 설정을 확인해 주세요.');
        setStatus('unconfigured');
        return;
      }
      if (activeNickname !== cleanNickname) setMessages([]);
      setStatus('connecting');
      setError(null);
      setActiveNickname(cleanNickname);
      setRoomVersion((current) => current + 1);
    },
    [activeNickname, configured],
  );

  const disconnect = useCallback(() => {
    setStatus('idle');
    setActiveNickname(null);
    setError(null);
    setIsSending(false);
  }, []);

  const retry = useCallback(() => {
    if (!activeNickname) return;
    setError(null);
    setStatus('reconnecting');
    setRoomVersion((current) => current + 1);
  }, [activeNickname]);

  const sendMessage = useCallback(async (content: string) => {
    const room = roomRef.current;
    if (!room || room.state !== 'connected') {
      const message = '채팅에 연결된 후 메시지를 보낼 수 있습니다.';
      setError(message);
      throw new Error(message);
    }

    setIsSending(true);
    setError(null);
    try {
      const { SendMessageRequest } = await loadChatSdk();
      if (roomRef.current !== room || room.state !== 'connected') {
        throw new Error('Room is not connected');
      }
      await room.sendMessage(new SendMessageRequest(content));
    } catch (sendError) {
      const message = sendErrorMessage(sendError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    activeNickname,
    status,
    messages,
    error,
    isSending,
    connect,
    disconnect,
    retry,
    sendMessage,
    clearError: () => setError(null),
  };
}
