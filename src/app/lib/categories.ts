import { 
  ShoppingBag, 
  Utensils, 
  Bus, 
  Home, 
  GlassWater, 
  Dumbbell, 
  Tv, 
  Plane, 
  Layers,
  Coffee,
  Smartphone,
  Gift,
  Gamepad,
  Music,
  Pizza,
  Zap,
  Heart,
  Briefcase,
  Shield,
  Stethoscope
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export const AVAILABLE_ICONS = {
  ShoppingBag,
  Utensils,
  Bus,
  Home,
  GlassWater,
  Dumbbell,
  Tv,
  Plane,
  Layers,
  Coffee,
  Smartphone,
  Gift,
  Gamepad,
  Music,
  Pizza,
  Zap,
  Heart,
  Briefcase,
  Shield,
  Stethoscope
};

export type IconName = keyof typeof AVAILABLE_ICONS;

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Spesa Alimentare', iconName: 'ShoppingBag', color: '#3b82f6' },
  { id: 'cat2', name: 'Svago & Ristoranti', iconName: 'Utensils', color: '#10b981' },
  { id: 'cat3', name: 'Trasporti', iconName: 'Bus', color: '#f59e0b' },
  { id: 'cat4', name: 'Bollette & Casa', iconName: 'Home', color: '#ef4444' },
  { id: 'cat5', name: 'Salute & Fitness', iconName: 'Stethoscope', color: '#ec4899' },
  { id: 'cat6', name: 'Abbonamenti', iconName: 'Tv', color: '#8b5cf6' },
  { id: 'cat7', name: 'Viaggi', iconName: 'Plane', color: '#06b6d4' },
  { id: 'cat8', name: 'Altro', iconName: 'Layers', color: '#6b7280' },
];
