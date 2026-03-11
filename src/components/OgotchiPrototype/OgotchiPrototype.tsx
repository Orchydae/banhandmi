import { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { useHungerMeter } from '../../hooks/useHungerMeter';
import './OgotchiPrototype.css';

export interface OgotchiPrototypeRef {
    getBoundingClientRect: () => DOMRect;
    triggerFeed: () => void;
}

interface OgotchiPrototypeProps {
    isDragging: boolean;
}

const OgotchiPrototype = forwardRef<OgotchiPrototypeRef, OgotchiPrototypeProps>(({ isDragging }, ref) => {
    const { hunger, feed } = useHungerMeter();
    const [isPlaying, setIsPlaying] = useState(false);

    const avatarRingRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => {
            if (avatarRingRef.current) {
                return avatarRingRef.current.getBoundingClientRect();
            }
            return new DOMRect();
        },
        triggerFeed: () => {
            feed();
            setIsPlaying(true);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => { });
            }
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => { });
                }
            }, 1000);
        }
    }));

    const hungerColor = hunger > 50
        ? `hsl(${120 * (hunger - 50) / 50}, 85%, 45%)`
        : `hsl(${120 * hunger / 50}, 85%, 45%)`;

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className="ogotchi-prototype__eggshell">
            <div className="ogotchi-prototype__keychain-holder">
                <div className="keychain-holder-hollow">
                </div>
            </div>
            <div className="ogotchi-prototype__name">Bánh-ogotchi</div>
            <div className="ogotchi-prototype__crack">
                <div ref={avatarRingRef} className="ogotchi-prototype">
                    <div
                        className="hunger-meter"
                        aria-label="Hunger meter"
                        data-tooltip={`Hunger meter: ${hunger}/100`}
                        tabIndex={0}
                    >
                        <div
                            className="hunger-meter__fill"
                            style={{ width: `${hunger}%`, backgroundColor: hungerColor }}
                        />
                    </div>
                    <img
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--photo ${isPlaying ? 'ogotchi-prototype__avatar--hidden' : ''}`}
                        src={isDragging ? '/banhondrag.png' : '/webphoto.jpg'}
                        alt="Bánh the Shiba Inu"
                    />
                    <video
                        ref={videoRef}
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${isPlaying ? 'ogotchi-prototype__avatar--visible' : ''}`}
                        src="/banh-eating.mp4"
                        muted
                        playsInline
                        onEnded={handleVideoEnded}
                    />
                    <audio ref={audioRef} src="/minecraft-eating.mp3" preload="auto" />
                </div>
            </div>
            <div className="ogotchi-prototype__buttons">
                <button>
                    <div className="button-outer">
                        <div className="button-inner">

                        </div>
                    </div>
                </button>
                <button>
                    <div className="button-outer">
                        <div className="button-inner">

                        </div>
                    </div>
                </button>
                <button>
                    <div className="button-outer">
                        <div className="button-inner">

                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
});

OgotchiPrototype.displayName = 'OgotchiPrototype';

export default OgotchiPrototype;
