import {
  Moon,
  Sun,
  Star,
  Eye,
  Heart,
  Sparkles,
  Shield,
  Brain,
  Leaf,
  Flame,
  HeartCrack,
  Bolt,
  CloudFog,
  Hand,
  RefreshCw,
  Compass,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Moon,
  Sun,
  Star,
  Eye,
  Heart,
  Sparkles,
  Shield,
  Brain,
  Leaf,
  Flame,
  HeartCrack,
  Bolt,
  CloudFog,
  Hand,
  RefreshCw,
  Compass,
  Magnet: Sparkles, // Using Sparkles as fallback for Magnet
};

export const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Star;
};
