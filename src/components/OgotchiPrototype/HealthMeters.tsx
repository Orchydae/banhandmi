import React from 'react';
import { Beef, Smile } from 'lucide-react';
import './HealthMeters.css';

interface HealthMetersProps {
    hunger: number;
    mood: number;
}

export const HealthMeters: React.FC<HealthMetersProps> = ({ hunger, mood }) => {
    // Each icon represents 20 points
    const maxIcons = 5;

    const renderIcons = (currentValue: number, IconComponent: React.ElementType, type: 'hunger' | 'mood') => {
        const icons = [];
        for (let i = 1; i <= maxIcons; i++) {
            // An icon is "active" if the current value covers its segment
            // e.g., for i=1 (0-20), we need value > 0
            // for i=2 (20-40), we need value > 20
            const segmentStart = (i - 1) * 20;

            // Calculate how "full" this specific icon should be (for future partial fills if desired)
            // For now, simple boolean: is the value >= this icon's threshold?
            const isActive = currentValue > segmentStart;
            
            // For partial fill calculation (optional future enhancement):
            // const fillPercentage = Math.max(0, Math.min(100, ((currentValue - segmentStart) / 20) * 100));

            icons.push(
                <IconComponent
                    key={i}
                    size={16}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`meter-icon ${isActive ? 'active' : 'inactive'} ${type}`}
                />
            );
        }
        return icons;
    };

    return (
        <div className="health-meters">
            <div
                className="meter-icon-container meter-icon-container--hunger"
                aria-label="Hunger meter"
                data-tooltip={`Hunger meter: ${hunger}/100`}
                tabIndex={0}
            >
                {renderIcons(hunger, Beef, 'hunger')}
            </div>
            
            <div className="meter-divider" />

            <div
                className="meter-icon-container meter-icon-container--mood"
                aria-label="Mood meter"
                data-tooltip={`Mood meter: ${mood}/100`}
                tabIndex={0}
            >
                {renderIcons(mood, Smile, 'mood')}
            </div>
        </div>
    );
};
