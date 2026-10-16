import {
  ChatTokenCapability,
  CreateChatTokenCommand,
  IvschatClient,
} from '@aws-sdk/client-ivschat';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { randomUUID } from 'node:crypto';

const client = new IvschatClient({});
const nicknamePattern = /^[\p{L}\p{N}_-]{2,20}$/u;

type TokenRequest = {
  mode?: 'participant' | 'overlay';
  nickname?: string;
};

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const roomIdentifier = process.env.ROOM_ARN;

  if (!roomIdentifier) {
    return json(500, { message: 'ROOM_ARN is not configured.' });
  }

  let body: TokenRequest;
  try {
    body = JSON.parse(event.body ?? '{}') as TokenRequest;
  } catch {
    return json(400, { message: 'Request body must be valid JSON.' });
  }

  const nickname = body.nickname?.trim();
  if (!nickname || !nicknamePattern.test(nickname)) {
    return json(400, {
      message: 'Nickname must be 2-20 letters, numbers, underscores, or hyphens.',
    });
  }

  const capabilities =
    body.mode === 'overlay' ? [] : [ChatTokenCapability.SEND_MESSAGE];
  const result = await client.send(
    new CreateChatTokenCommand({
      roomIdentifier,
      userId: randomUUID(),
      capabilities,
      attributes: { nickname },
      sessionDurationInMinutes: 60,
    }),
  );

  return json(200, {
    token: result.token,
    sessionExpirationTime: result.sessionExpirationTime?.toISOString(),
    tokenExpirationTime: result.tokenExpirationTime?.toISOString(),
  });
}

function json(statusCode: number, body: object): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}
