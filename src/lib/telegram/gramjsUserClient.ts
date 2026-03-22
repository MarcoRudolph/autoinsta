import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/StringSession.js';
import { Api } from 'telegram/tl/index.js';

import { getTelegramApiCredentials } from './gramjsConfig';

function newUnauthenticatedClient(): TelegramClient {
  const { apiId, apiHash } = getTelegramApiCredentials();
  return new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 3 });
}

export async function gramjsSendLoginCode(phoneNumber: string): Promise<{
  phoneCodeHash: string;
  isCodeViaApp: boolean;
}> {
  const client = newUnauthenticatedClient();
  await client.connect();
  try {
    const { apiId, apiHash } = getTelegramApiCredentials();
    const res = await client.sendCode({ apiId, apiHash }, phoneNumber, false);
    if (typeof res.phoneCodeHash !== 'string') {
      throw new Error('Telegram did not return phoneCodeHash');
    }
    return { phoneCodeHash: res.phoneCodeHash, isCodeViaApp: Boolean(res.isCodeViaApp) };
  } finally {
    await client.disconnect();
  }
}

export async function gramjsCompleteLogin(params: {
  phoneNumber: string;
  phoneCodeHash: string;
  phoneCode: string;
}): Promise<{
  sessionString: string;
  telegramUserId: string;
  telegramUsername: string | null;
}> {
  const client = newUnauthenticatedClient();
  await client.connect();
  try {
    const auth = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: params.phoneNumber,
        phoneCodeHash: params.phoneCodeHash,
        phoneCode: params.phoneCode.trim(),
      })
    );
    if (auth instanceof Api.auth.AuthorizationSignUpRequired) {
      throw new Error('New Telegram sign-up is not supported; use an existing account');
    }
    const user = auth.user;
    if (!(user instanceof Api.User)) {
      throw new Error('Unexpected Telegram authorization result');
    }
    const sessionString = String(client.session.save());
    const telegramUserId = String(user.id);
    const telegramUsername =
      user.username && typeof user.username === 'string' ? user.username.toLowerCase() : null;
    return { sessionString, telegramUserId, telegramUsername };
  } finally {
    await client.disconnect();
  }
}

export async function gramjsSendMessageAsUser(params: {
  sessionString: string;
  peerId: string | number;
  text: string;
  replyToMsgId?: number;
}): Promise<{ messageId: number }> {
  const { apiId, apiHash } = getTelegramApiCredentials();
  const client = new TelegramClient(new StringSession(params.sessionString), apiId, apiHash, {
    connectionRetries: 3,
  });
  await client.connect();
  try {
    const msg = await client.sendMessage(params.peerId, {
      message: params.text,
      replyTo: params.replyToMsgId,
    });
    const id = typeof msg.id === 'number' ? msg.id : Number(msg.id);
    return { messageId: id };
  } finally {
    await client.disconnect();
  }
}
