import { Wallpaper } from '../types';
import cyberpunkSamuraiImg from '../assets/images/cyberpunk_samurai_1786112527505.jpg';

export const CYBERPUNK_WALLPAPER: Wallpaper = {
  id: 'cyberpunk-samurai-1',
  name: 'Cyberpunk Samurai HUD',
  category: 'abstract',
  url: cyberpunkSamuraiImg,
  thumbnail: cyberpunkSamuraiImg,
  author: 'Cyberpunk HUD'
};

export const LIVE_WALLPAPERS: Wallpaper[] = [
  {
    id: 'live-matrix-1',
    name: 'Cyber Matrix Code Rain',
    category: 'live',
    url: 'live:canvas-matrix',
    thumbnail: 'gradient:linear-gradient(135deg, #050a14 0%, #00f3ff 100%)',
    author: 'Live Matrix Engine',
    isLive: true,
    liveType: 'canvas-matrix'
  },
  {
    id: 'live-cybergrid-1',
    name: 'Neon Horizon Synth Grid',
    category: 'live',
    url: 'live:canvas-cybergrid',
    thumbnail: 'gradient:linear-gradient(135deg, #0a0a16 0%, #ff007f 100%)',
    author: 'Live Synthwave Engine',
    isLive: true,
    liveType: 'canvas-cybergrid'
  },
  {
    id: 'live-tokyo-video',
    name: 'Cyberpunk Tokyo Night',
    category: 'live',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-tokyo-street-at-night-42296-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=60',
    author: 'Mixkit Video Loop',
    isLive: true,
    liveType: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-tokyo-street-at-night-42296-large.mp4'
  },
  {
    id: 'live-particles-1',
    name: 'Quantum Particle Flow',
    category: 'live',
    url: 'live:canvas-particles',
    thumbnail: 'gradient:linear-gradient(135deg, #080d1a 0%, #6366f1 100%)',
    author: 'Live Particle Canvas',
    isLive: true,
    liveType: 'canvas-particles'
  },
  {
    id: 'live-starfield-1',
    name: '3D Warp Velocity Starfield',
    category: 'live',
    url: 'live:canvas-starfield',
    thumbnail: 'gradient:linear-gradient(135deg, #030712 0%, #38bdf8 100%)',
    author: 'Live Starfield Engine',
    isLive: true,
    liveType: 'canvas-starfield'
  },
  {
    id: 'live-rain-1',
    name: 'Atmospheric Neon Rain',
    category: 'live',
    url: 'live:canvas-rain',
    thumbnail: 'gradient:linear-gradient(135deg, #0a0f1e 0%, #00f3ff 100%)',
    author: 'Live Rain Engine',
    isLive: true,
    liveType: 'canvas-rain'
  },
  {
    id: 'live-tunnel-video',
    name: 'Futuristic Light Tunnel',
    category: 'live',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-lights-22238-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=60',
    author: 'Mixkit Video Loop',
    isLive: true,
    liveType: 'video',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-lights-22238-large.mp4'
  }
];

export const INITIAL_WALLPAPERS: Wallpaper[] = [
  ...LIVE_WALLPAPERS,
  CYBERPUNK_WALLPAPER,
  {
    id: 'frosted-glass-1',
    name: 'Frosted Twilight Mesh',
    category: 'gradient',
    url: 'gradient:linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%)',
    thumbnail: 'gradient:linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%)',
    author: 'Frosted Glass Theme'
  },
  {
    id: 'nature-1',
    name: 'Misty Alpine Forest',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=60',
    author: 'Kalen Emsley'
  },
  {
    id: 'nature-2',
    name: 'Emerald Valley Sunset',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=60',
    author: 'Bailey Zindel'
  },
  {
    id: 'mountains-1',
    name: 'Snowy Peak Ridge',
    category: 'mountains',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=60',
    author: 'Kal Vis'
  },
  {
    id: 'mountains-2',
    name: 'Dolomites Sunrise',
    category: 'mountains',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=60',
    author: 'Benjamin Voros'
  },
  {
    id: 'space-1',
    name: 'Cosmic Nebula',
    category: 'space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=60',
    author: 'NASA Unsplash'
  },
  {
    id: 'space-2',
    name: 'Starlit Milky Way',
    category: 'space',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=60',
    author: 'Greg Rakozy'
  },
  {
    id: 'abstract-1',
    name: 'Fluid Obsidian Flow',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=60',
    author: 'Milad Fakurian'
  },
  {
    id: 'abstract-2',
    name: 'Prismatic Neon Geometry',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=60',
    author: 'Shubham Dhage'
  },
  {
    id: 'minimal-1',
    name: 'Soft Architectural Shadows',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=400&q=60',
    author: 'Mitchell Luo'
  },
  {
    id: 'minimal-2',
    name: 'Serene Sand Dunes',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=60',
    author: 'Jeremy Bishop'
  },
  {
    id: 'gradient-1',
    name: 'Aurora Glow Gradient',
    category: 'gradient',
    url: 'gradient:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    thumbnail: 'gradient:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    author: 'Built-in Gradient'
  },
  {
    id: 'gradient-2',
    name: 'Sunset Twilight Gradient',
    category: 'gradient',
    url: 'gradient:linear-gradient(135deg, #18181b 0%, #4c1d95 50%, #be185d 100%)',
    thumbnail: 'gradient:linear-gradient(135deg, #18181b 0%, #4c1d95 50%, #be185d 100%)',
    author: 'Built-in Gradient'
  }
];
