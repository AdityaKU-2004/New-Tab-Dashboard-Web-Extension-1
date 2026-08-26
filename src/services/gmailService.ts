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

// Sample fallback unread emails for preview/demo mode
const SAMPLE_GMAIL_MESSAGES: GmailMessage[] = [
  {
    id: 'msg-001',
    threadId: 'th-001',
    from: 'GitHub <notifications@github.com>',
    subject: '[cyber-dashboard] Pull Request #42 merged: Chrome Extension Identity Support',
    snippet: 'Hey Operator, your pull request #42 has been approved by the core tactical team and merged into main.',
    date: new Date(Date.now() - 1000 * 60 * 18).toUTCString(),
    internalDate: String(Date.now() - 1000 * 60 * 18),
    unread: true,
  },
  {
    id: 'msg-002',
    threadId: 'th-002',
    from: 'Google Cloud Platform <alerts@google.com>',
    subject: 'Security Alert: New Chrome Extension Authorized via OAuth 2.0',
    snippet: 'Your Google Account granted access to Cyberpunk Pro New Tab Dashboard for reading inbox headers.',
    date: new Date(Date.now() - 1000 * 60 * 45).toUTCString(),
    internalDate: String(Date.now() - 1000 * 60 * 45),
    unread: true,
  },
  {
    id: 'msg-003',
    threadId: 'th-003',
    from: 'Vercel Deployments <notifications@vercel.com>',
    subject: 'Deployment Successful: production build ready for deployment preview',
    snippet: 'Your project cyberpunk-dashboard has been successfully compiled and distributed to 18 global edge locations.',
    date: new Date(Date.now() - 1000 * 60 * 120).toUTCString(),
    internalDate: String(Date.now() - 1000 * 60 * 120),
    unread: true,
  },
  {
    id: 'msg-004',
    threadId: 'th-004',
    from: 'Tactical Flight Control <command@skyhud.aero>',
    subject: 'Telemetry Synchronization Notice: Jet HUD V4 Firmware Online',
    snippet: 'New flight vectors and Doppler threat calculation metrics updated for all connected pilots.',
    date: new Date(Date.now() - 1000 * 60 * 360).toUTCString(),
    internalDate: String(Date.now() - 1000 * 60 * 360),
    unread: true,
  },
];

export async function fetchUnreadGmailMessages(
  accessToken: string,
  maxResults = 10
): Promise<{ messages: GmailMessage[]; totalUnreadCount: number }> {
  // If demo token, return sample messages
  if (accessToken === 'demo_token' || accessToken.startsWith('demo_')) {
    return {
      messages: SAMPLE_GMAIL_MESSAGES.slice(0, maxResults),
      totalUnreadCount: SAMPLE_GMAIL_MESSAGES.length,
    };
  }

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
