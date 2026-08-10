import { Bookmark, BookmarkFolder } from '../types';

export const INITIAL_FOLDERS: BookmarkFolder[] = [
  { id: 'f_dev', name: 'Developer', createdAt: Date.now() - 1000000 },
  { id: 'f_ai', name: 'AI & Tools', createdAt: Date.now() - 900000 },
  { id: 'f_prod', name: 'Productivity', createdAt: Date.now() - 800000 },
  { id: 'f_media', name: 'Media & Design', createdAt: Date.now() - 700000 }
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'b1',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    category: 'Developer',
    createdAt: Date.now() - 1000000
  },
  {
    id: 'b2',
    title: 'YouTube',
    url: 'https://youtube.com',
    icon: 'https://www.youtube.com/s/desktop/f5af03f8/img/favicon.ico',
    category: 'Media',
    createdAt: Date.now() - 900000
  },
  {
    id: 'b3',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    icon: 'https://chatgpt.com/favicon.ico',
    category: 'AI',
    createdAt: Date.now() - 800000
  },
  {
    id: 'b4',
    title: 'Notion',
    url: 'https://notion.so',
    icon: 'https://www.notion.so/images/favicon.ico',
    category: 'Productivity',
    createdAt: Date.now() - 700000
  },
  {
    id: 'b5',
    title: 'Figma',
    url: 'https://figma.com',
    icon: 'https://static.figma.com/app/icon/1/favicon.ico',
    category: 'Design',
    createdAt: Date.now() - 600000
  },
  {
    id: 'b6',
    title: 'Twitter / X',
    url: 'https://x.com',
    icon: 'https://abs.twimg.com/favicons/twitter.3.ico',
    category: 'Social',
    createdAt: Date.now() - 500000
  },
  {
    id: 'b7',
    title: 'Vercel',
    url: 'https://vercel.com',
    icon: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png',
    category: 'Developer',
    createdAt: Date.now() - 400000
  },
  {
    id: 'b8',
    title: 'Reddit',
    url: 'https://reddit.com',
    icon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png',
    category: 'Community',
    createdAt: Date.now() - 300000
  }
];
