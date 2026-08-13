import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { CyberpunkSportsSpeedometer } from './CyberpunkSportsSpeedometer';
import { CyberpunkFighterJetHud } from './CyberpunkFighterJetHud';

interface CyberpunkHudContainerProps {
  isBackgroundMode?: boolean;
}

export const CyberpunkHudContainer: React.FC<CyberpunkHudContainerProps> = ({ isBackgroundMode }) => {
  const cyberHudStyle = useDashboardStore((state) => state.settings.cyberHudStyle || 'car');

  if (cyberHudStyle === 'fighter_jet') {
    return <CyberpunkFighterJetHud isBackgroundMode={isBackgroundMode} />;
  }

  return <CyberpunkSportsSpeedometer isBackgroundMode={isBackgroundMode} />;
};
