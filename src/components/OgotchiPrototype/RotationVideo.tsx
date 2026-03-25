import { useRef, useEffect, useCallback } from 'react';

interface RotationVideoProps {
    visible: boolean;
}

export function RotationVideo({ visible }: RotationVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const rafRef = useRef<number | null>(null);

    const scrubToAngle = useCallback((clientX: number, clientY: number) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = video.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        // atan2 in screen coords: right=0, down=π/2, left=±π, up=-π/2
        // Shift so down (π/2) becomes 0, then normalize clockwise
        const angle = Math.atan2(dy, dx);
        const shifted = angle - Math.PI / 2;
        const normalized = ((shifted % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const progress = normalized / (2 * Math.PI);

        const duration = video.duration;
        if (!duration || isNaN(duration)) return;

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = Math.min(progress, 0.98) * duration;
            }
            rafRef.current = null;
        });
    }, []);

    useEffect(() => {
        if (!visible) return;

        const handlePointerMove = (e: PointerEvent) => {
            scrubToAngle(e.clientX, e.clientY);
        };

        document.addEventListener('pointermove', handlePointerMove);
        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [visible, scrubToAngle]);

    return (
        <video
            ref={videoRef}
            className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${visible ? 'ogotchi-prototype__avatar--visible' : ''}`}
            src="/rotation.mp4"
            muted
            playsInline
            preload="auto"
        />
    );
}
