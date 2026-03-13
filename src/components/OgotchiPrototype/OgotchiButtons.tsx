import React from 'react';
import './OgotchiPrototype.css';

export type OgotchiAction = 'button1' | 'button2' | 'button3';

interface OgotchiButtonsProps {
    onPlayAction: (action: OgotchiAction) => void;
}

export const OgotchiButtons: React.FC<OgotchiButtonsProps> = ({ onPlayAction }) => {
    return (
        <div className="ogotchi-prototype__buttons">
            <button onClick={() => onPlayAction('button1')}>
                <div className="button-outer">
                    <div className="button-inner">
                    </div>
                </div>
            </button>
            <button onClick={() => onPlayAction('button2')}>
                <div className="button-outer">
                    <div className="button-inner">
                    </div>
                </div>
            </button>
            <button onClick={() => onPlayAction('button3')}>
                <div className="button-outer">
                    <div className="button-inner">
                    </div>
                </div>
            </button>
        </div>
    );
};
