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
  Stethoscope,
  Car,
  Dog,
  ShoppingBasket,
  Wine,
  Camera,
  Book,
  Monitor
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
  Stethoscope,
  Car,
  Dog,
  ShoppingBasket,
  Wine,
  Camera,
  Book,
  Monitor
};

export type IconName = keyof typeof AVAILABLE_ICONS;

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Spesa Alimentare', iconName: 'ShoppingBasket', color: '#2D6A4F' },
  { id: 'cat2', name: 'Svago & Ristoranti', iconName: 'Utensils', color: '#F59E0B' },
  { id: 'cat3', name: 'Trasporti', iconName: 'Car', color: '#EF4444' },
  { id: 'cat4', name: 'Bollette & Casa', iconName: 'Home', color: '#3B82F6' },
  { id: 'cat5', name: 'Salute & Fitness', iconName: 'Dumbbell', color: '#EC4899' },
  { id: 'cat6', name: 'Shopping', iconName: 'ShoppingBag', color: '#8B5CF6' },
  { id: 'cat7', name: 'Viaggi', iconName: 'Plane', color: '#06B6D4' },
  { id: 'cat8', name: 'Altro', iconName: 'Layers', color: '#6B7280' },
];