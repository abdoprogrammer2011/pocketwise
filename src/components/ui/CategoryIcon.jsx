/**
 * CategoryIcon
 * Maps expense category icon keys to Lucide React icons.
 */

import {
  Bus,
  Coins,
  Compass,
  Flame,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  PiggyBank,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Utensils,
} from 'lucide-react';

const ICONS = {
  bus: Bus,
  coins: Coins,
  compass: Compass,
  controller: Gamepad2,
  flame: Flame,
  'gamepad-2': Gamepad2,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  'more-horizontal': MoreHorizontal,
  'piggy-bank': PiggyBank,
  'shield-check': ShieldCheck,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  target: Target,
  trophy: Trophy,
  utensils: Utensils,
};

export default function CategoryIcon({ name, className = 'w-5 h-5', ...props }) {
  const Icon = ICONS[name] || MoreHorizontal;
  return <Icon className={className} aria-hidden="true" {...props} />;
}