import { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { useHungerMeter } from '../../hooks/useHungerMeter';
import './OgochiPrototype.css';

export interface OgochiPrototypeRef {
    getBoundingClientRect: () => DOMRect;
    triggerFeed: () => void;
}

interface OgochiPrototypeProps {
    isDragging: boolean;
}

const OgochiPrototype = forwardRef<OgochiPrototypeRef, OgochiPrototypeProps>(({ isDragging }, ref) => {
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
        <div ref={avatarRingRef} className="ogochi-prototype">
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
                className={`ogochi-prototype__avatar ogochi-prototype__avatar--photo ${isPlaying ? 'ogochi-prototype__avatar--hidden' : ''}`}
                src={isDragging ? '/banhondrag.png' : '/webphoto.jpg'}
                alt="Bánh the Shiba Inu"
            />
            <video
                ref={videoRef}
                className={`ogochi-prototype__avatar ogochi-prototype__avatar--video ${isPlaying ? 'ogochi-prototype__avatar--visible' : ''}`}
                src="/banh-eating.mp4"
                muted
                playsInline
                onEnded={handleVideoEnded}
            />
            <audio ref={audioRef} src="/minecraft-eating.mp3" preload="auto" />
        </div>
    );
});

OgochiPrototype.displayName = 'OgochiPrototype';

export default OgochiPrototype;
