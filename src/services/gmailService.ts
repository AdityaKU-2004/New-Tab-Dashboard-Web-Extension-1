export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  internalDate: string;
  unread: boolean;
}

export async function fetchUnreadGmailMessages(
  accessToken: string,
  maxResults = 10
): Promise<{ messages: GmailMessage[]; totalUnreadCount: number }> {
  // 1. Fetch unread list
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=${maxResults}`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(`Failed to fetch Gmail messages (${listRes.status})`);
  }

  const listData = await listRes.json();
  const rawMessages: Array<{ id: string; threadId: string }> = listData.messages || [];
  const totalUnreadCount = listData.resultSizeEstimate ?? rawMessages.length;

  if (rawMessages.length === 0) {
    return { messages: [], totalUnreadCount: 0 };
  }

  // 2. Fetch details for each message
  const detailsPromises = rawMessages.slice(0, maxResults).map(async (msg) => {
    try {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();
      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: detail.id,
        threadId: detail.threadId,
        snippet: detail.snippet || '',
        from: getHeader('From'),
        subject: getHeader('Subject') || '(No Subject)',
        date: getHeader('Date'),
        internalDate: detail.internalDate || '',
        unread: true,
      } as GmailMessage;
    } catch {
      return null;
    }
  });

  const fetchedDetails = await Promise.all(detailsPromises);
  const validMessages = fetchedDetails.filter((m): m is GmailMessage => m !== null);

  return {
    messages: validMessages,
    totalUnreadCount,
  };
}
