import { forwardRef, useRef, useImperativeHandle, useState, useEffect, useCallback } from 'react';
import { useHungerMeter } from '../../hooks/useHungerMeter';
import { useMoodMeter } from '../../hooks/useMoodMeter';
import { useHasPooped } from '../../hooks/useHasPooped';
import { useDogProfile } from '../../hooks/useDogProfile';
import { WeightGraph } from './WeightGraph';
import { OgotchiButtons, OgotchiAction } from './OgotchiButtons';
import { HealthMeters } from './HealthMeters';
import { RotationVideo } from './RotationVideo';
import './OgotchiPrototype.css';

export interface OgotchiPrototypeRef {
    getBoundingClientRect: () => DOMRect;
    triggerFeed: (x?: number, y?: number) => void;
}

interface FloatingFeedback {
    id: number;
    x: number;
    y: number;
    type: 'mood' | 'hunger';
}

interface OgotchiPrototypeProps {
    isDragging: boolean;
}

const OgotchiPrototype = forwardRef<OgotchiPrototypeRef, OgotchiPrototypeProps>(({ isDragging }, ref) => {
    const { hunger, loading: hungerLoading, feed } = useHungerMeter();
    const { mood, pet } = useMoodMeter();
    const { hasPooped, cleanPoop } = useHasPooped();
    const { ageString, weight, weightHistory, loading: profileLoading, addWeight } = useDogProfile();
    const [playingState, setPlayingState] = useState<'idle' | 'eating' | 'petting' | 'pooping' | 'menu' | OgotchiAction>('idle');
    // True until hunger data is fetched from the server — prevents dead.png flash on load
    const isLoading = hungerLoading;
    const [showGraph, setShowGraph] = useState(false);
    const [isInputtingWeight, setIsInputtingWeight] = useState(false);
    const [newWeightValue, setNewWeightValue] = useState('');
    const [isSavingWeight, setIsSavingWeight] = useState(false);
    const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
    const [mouseOnPage, setMouseOnPage] = useState(false);

    useEffect(() => {
        // Only track mouse presence on devices that have a fine pointer
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const handleEnter = () => setMouseOnPage(true);
        const handleLeave = () => setMouseOnPage(false);

        document.documentElement.addEventListener('mouseenter', handleEnter);
        document.documentElement.addEventListener('mouseleave', handleLeave);
        return () => {
            document.documentElement.removeEventListener('mouseenter', handleEnter);
            document.documentElement.removeEventListener('mouseleave', handleLeave);
        };
    }, []);

    const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const avatarRingRef = useRef<HTMLDivElement>(null);
    const eatingVideoRef = useRef<HTMLVideoElement>(null);
    const pettingVideoRef = useRef<HTMLVideoElement>(null);
    const poopingVideoRef = useRef<HTMLVideoElement>(null);
    const button1VideoRef = useRef<HTMLVideoElement>(null);
    const button2VideoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const coinAudioRef = useRef<HTMLAudioElement>(null);
    const rafRef = useRef<number | null>(null);

    const showRotation = isDragging || mouseOnPage;

    const stopAllVideos = () => {
        [eatingVideoRef, pettingVideoRef, poopingVideoRef, button1VideoRef, button2VideoRef].forEach(r => {
            if (r.current) { r.current.pause(); r.current.currentTime = 0; }
        });
    };

    useEffect(() => {
        if (hasPooped > 0 && playingState === 'idle') {
            setPlayingState('pooping');
            if (poopingVideoRef.current) {
                poopingVideoRef.current.currentTime = 0;
                poopingVideoRef.current.play().catch(() => { });
            }
        }
    }, [hasPooped, playingState]);

    const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const spawnFeedback = useCallback((x: number, y: number, type: 'mood' | 'hunger') => {
        const id = Date.now() + Math.random();
        // Offset slightly to the top-right of the click/touch point
        setFeedbacks(prev => [...prev, { id, x: x + 10, y: y - 10, type }]);

        // Play coin sound
        if (coinAudioRef.current) {
            coinAudioRef.current.currentTime = 0;
            coinAudioRef.current.play().catch(() => { });
        }

        // Remove after animation finishes (approx 1s)
        setTimeout(() => {
            setFeedbacks(prev => prev.filter(f => f.id !== id));
        }, 1000);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (playingState === 'petting') {
            interval = setInterval(() => {
                pet();
                if (lastPointerPosRef.current.x !== 0) {
                    spawnFeedback(lastPointerPosRef.current.x, lastPointerPosRef.current.y, 'mood');
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [playingState, pet, spawnFeedback]);

    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => {
            if (avatarRingRef.current) {
                return avatarRingRef.current.getBoundingClientRect();
            }
            return new DOMRect();
        },
        triggerFeed: (x, y) => {
            feed();

            // Spawn feedback if coordinates provided
            if (x !== undefined && y !== undefined) {
                spawnFeedback(x, y, 'hunger');
            } else if (avatarRingRef.current) {
                // Fallback to center if no coords
                const rect = avatarRingRef.current.getBoundingClientRect();
                spawnFeedback(rect.left + rect.width / 2, rect.top + rect.height / 2, 'hunger');
            }

            if (playingState === 'pooping') return;
            stopAllVideos();
            setPlayingState('eating');
            if (eatingVideoRef.current) {
                eatingVideoRef.current.currentTime = 0;
                eatingVideoRef.current.play().catch(() => { });
            }
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => { });
                }
            }, 1000);
        }
    }));

    const handleVideoEnded = () => {
        setPlayingState('idle');
    };

    const handlePlayAction = (action: OgotchiAction) => {
        if (playingState === 'pooping') return; // Cannot override pooping state

        stopAllVideos();

        if (action === 'button3') {
            setPlayingState('menu');
            setShowGraph(false);
            setIsInputtingWeight(false);
            return;
        }

        setPlayingState(action);

        const videoRef = action === 'button1' ? button1VideoRef : button2VideoRef;

        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    };

    const handleCleanPoop = (e: React.MouseEvent) => {
        e.stopPropagation();
        cleanPoop();
        if (playingState === 'pooping') {
            setPlayingState('idle');
        }
    };

    const updateVideoTime = (clientX: number) => {
        if (!avatarRingRef.current || !pettingVideoRef.current) return;
        const rect = avatarRingRef.current.getBoundingClientRect();
        let progress = (clientX - rect.left) / rect.width;
        // Clamp to 0.999 to prevent hitting the exact end of the video,
        // which would trigger the onEnded event and stop the scrubbing.
        progress = Math.max(0, Math.min(0.98, progress));

        const duration = pettingVideoRef.current.duration;
        if (duration && !isNaN(duration)) {
            // Cancel any pending frame request
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }

            // Schedule the time update on the next animation frame
            rafRef.current = requestAnimationFrame(() => {
                if (pettingVideoRef.current) {
                    pettingVideoRef.current.currentTime = progress * duration;
                }
                rafRef.current = null;
            });
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging || playingState === 'eating' || playingState === 'pooping') return;

        stopAllVideos();
        setPlayingState('petting');

        if (pettingVideoRef.current) {
            pettingVideoRef.current.pause();
            updateVideoTime(e.clientX);
        }

        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (playingState !== 'petting') return;
        updateVideoTime(e.clientX);
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (playingState === 'petting') {
            setPlayingState('idle');
            e.currentTarget.releasePointerCapture(e.pointerId);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
    };

    const handleWeightPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (isInputtingWeight) return;

        holdTimeoutRef.current = setTimeout(() => {
            setIsInputtingWeight(true);
            setNewWeightValue(weight ? weight.toString() : '');
        }, 3000); // 3000ms hold to edit
    };

    const handleWeightPointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
    };

    const handleWeightClick = () => {
        if (!isInputtingWeight && weightHistory.length > 0) {
            setShowGraph(true);
        }
    };

    const saveNewWeight = async () => {
        if (!newWeightValue || isNaN(Number(newWeightValue))) return;
        setIsSavingWeight(true);
        const success = await addWeight(Number(newWeightValue));
        setIsSavingWeight(false);
        if (success) {
            setIsInputtingWeight(false);
        }
    };

    return (
        <div className="ogotchi-prototype__eggshell">
            <div className="ogotchi-prototype__keychain-holder">
                <div className="keychain-holder-hollow">
                </div>
            </div>
            <div className="ogotchi-prototype__name">Bánh-ogotchi</div>
            <div className="ogotchi-prototype__crack">
                <div
                    ref={avatarRingRef}
                    className="ogotchi-prototype"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{ touchAction: 'none' }}
                >
                    <HealthMeters hunger={hunger} mood={mood} />

                    {/* Loading splash — shown until hunger data arrives from the server */}
                    {isLoading && (
                        <video
                            className="ogotchi-prototype__avatar ogotchi-prototype__avatar--loading"
                            src="/shibawalk.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    )}

                    {/* Static photo — hidden while loading, while any video is active, or during 3-D rotation */}
                    {!isLoading && (
                        <img
                            className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--photo${
                                playingState !== 'idle' || showRotation ? ' ogotchi-prototype__avatar--hidden' : ''
                            }`}
                            src={hunger < 25 ? '/dead.png' : '/webphoto.jpg'}
                            alt="Bánh the Shiba Inu"
                        />
                    )}

                    <RotationVideo visible={!isLoading && showRotation && playingState === 'idle'} />

                    <video
                        ref={eatingVideoRef}
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${playingState === 'eating' ? 'ogotchi-prototype__avatar--visible' : ''}`}
                        src="/banh-eating.mp4"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnded}
                    />
                    <video
                        ref={pettingVideoRef}
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${playingState === 'petting' ? 'ogotchi-prototype__avatar--visible' : ''}`}
                        src="/petting.mp4"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnded}
                    />
                    <video
                        ref={poopingVideoRef}
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${playingState === 'pooping' ? 'ogotchi-prototype__avatar--visible' : ''}`}
                        src="/pooping.mp4"
                        muted
                        playsInline
                        preload="auto"
                        loop
                    />
                    <video
                        ref={button1VideoRef}
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${playingState === 'button1' ? 'ogotchi-prototype__avatar--visible' : ''}`}
                        src="/bark1.mp4"
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnded}
                    />
                    <video
                        ref={button2VideoRef}
                        className={`ogotchi-prototype__avatar ogotchi-prototype__avatar--video ${playingState === 'button2' ? 'ogotchi-prototype__avatar--visible' : ''}`}
                        src="/bark2.mp4"
                        playsInline
                        preload="auto"
                        onEnded={handleVideoEnded}
                    />
                    <audio ref={audioRef} src="/minecraft-eating.mp3" preload="auto" />
                    <audio ref={coinAudioRef} src="/coin.mp3" preload="auto" />
                    {hasPooped > 0 && (
                        <img
                            src="/poop.png"
                            className="ogotchi-prototype__poop-icon"
                            alt="Poop"
                            onClick={handleCleanPoop}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    )}
                    {playingState === 'menu' && (
                        <div className="ogotchi-prototype__menu" onPointerDown={(e) => e.stopPropagation()}>
                            {showGraph ? (
                                <WeightGraph
                                    data={weightHistory}
                                    onBack={() => setShowGraph(false)}
                                    onClose={() => setPlayingState('idle')}
                                />
                            ) : (
                                <>
                                    <button className="ogotchi-menu__close" onClick={() => setPlayingState('idle')}>×</button>
                                    <div className="ogotchi-menu__content">
                                        {profileLoading ? (
                                            <div className="ogotchi-menu__loading">Loading...</div>
                                        ) : (
                                            <>
                                                <div className="ogotchi-menu__item">
                                                    <span className="ogotchi-menu__label">Age</span>
                                                    <span className="ogotchi-menu__value">{ageString || 'Unknown'}</span>
                                                </div>
                                                <div
                                                    className={`ogotchi-menu__item ${weightHistory.length > 0 && !isInputtingWeight ? 'ogotchi-menu__item--clickable' : ''}`}
                                                    onPointerDown={handleWeightPointerDown}
                                                    onPointerUp={handleWeightPointerUpOrLeave}
                                                    onPointerLeave={handleWeightPointerUpOrLeave}
                                                    onClick={handleWeightClick}
                                                >
                                                    {isInputtingWeight ? (
                                                        <div className="ogotchi-menu__weight-edit" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="number"
                                                                className="ogotchi-menu__weight-input"
                                                                value={newWeightValue}
                                                                onChange={(e) => setNewWeightValue(e.target.value)}
                                                                step="0.1"
                                                                autoFocus
                                                                disabled={isSavingWeight}
                                                            />
                                                            <div className="ogotchi-menu__weight-actions">
                                                                <button
                                                                    className="ogotchi-menu__weight-btn cancel"
                                                                    onClick={() => setIsInputtingWeight(false)}
                                                                    disabled={isSavingWeight}
                                                                >✕</button>
                                                                <button
                                                                    className="ogotchi-menu__weight-btn save"
                                                                    onClick={saveNewWeight}
                                                                    disabled={isSavingWeight}
                                                                >✓</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="ogotchi-menu__label">Weight</span>
                                                            <span className="ogotchi-menu__value">{weight ? `${weight} kg` : 'Unknown'}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <OgotchiButtons onPlayAction={handlePlayAction} />

            {feedbacks.map(f => (
                <div
                    key={f.id}
                    className={`ogotchi-feedback ogotchi-feedback--${f.type}`}
                    style={{ left: f.x, top: f.y }}
                >
                    +1
                </div>
            ))}
        </div>
    );
});

OgotchiPrototype.displayName = 'OgotchiPrototype';

export default OgotchiPrototype;
