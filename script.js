// ========================================
// Main Orchestration Script
// ========================================

let videoPlayed = false;
let giftBoxInstance = null;

// Haptic feedback helper
const haptic = {
    tap: () => navigator.vibrate && navigator.vibrate(15),
    success: () => navigator.vibrate && navigator.vibrate([10, 30, 10, 50]),
    burst: () => navigator.vibrate && navigator.vibrate([50, 20, 100, 20, 150])
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    initializeExperience();
});

function initializeExperience() {
    const video = document.getElementById('birthday-video');
    const videoSection = document.getElementById('video-section');
    const giftSection = document.getElementById('gift-section');

    // Start video after black screen animation (2.5s)
    setTimeout(() => {
        if (video) {
            const startAll = () => {
                video.play();
                const bgMusic = document.getElementById('bg-music');
                if (bgMusic) {
                    bgMusic.volume = 0.5;
                    bgMusic.play().catch(e => console.log('Music play failed', e));
                }
            };

            video.play().then(() => {
                // Autoplay success: start music too
                const bgMusic = document.getElementById('bg-music');
                if (bgMusic) {
                    bgMusic.volume = 0.5;
                    bgMusic.play().catch(e => console.log('Music play failed', e));
                }
            }).catch(err => {
                console.log('Autoplay prevented, waiting for user interaction');
                // Add visual indicator and click handler to start video if autoplay fails
                const playPrompt = document.createElement('div');
                playPrompt.id = 'play-prompt';
                playPrompt.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px 40px;
                    border-radius: 12px;
                    font-size: 1.2rem;
                    z-index: 9999;
                    cursor: pointer;
                    animation: pulse 1.5s ease-in-out infinite;
                `;
                playPrompt.textContent = '▶️ Tap to Play';
                document.body.appendChild(playPrompt);

                const startVideo = () => {
                    startAll();
                    playPrompt.remove();
                };

                playPrompt.addEventListener('click', startVideo);
                document.addEventListener('click', startVideo, { once: true });
            });
        }
    }, 2500);

    // Monitor video progress and trigger transition at 16 seconds
    if (video) {
        video.addEventListener('timeupdate', () => {
            if (!videoPlayed && video.currentTime >= 16) {
                videoPlayed = true;
                transitionToGiftBox();
            }
        });

        // Fallback: also trigger on video end (in case video is shorter than 16s)
        video.addEventListener('ended', () => {
            if (!videoPlayed) {
                videoPlayed = true;
                transitionToGiftBox();
            }
        });
    }
}

function transitionToGiftBox() {
    if (window.isTransitioning) return;
    window.isTransitioning = true;

    const videoSection = document.getElementById('video-section');
    const giftSection = document.getElementById('gift-section');
    const overlay = document.getElementById('transition-overlay');
    const video = document.getElementById('birthday-video');
    const bgMusic = document.getElementById('bg-music');

    // Trigger swipe animation
    if (overlay) overlay.classList.add('swiping');

    // Stop video and music immediately
    if (video) {
        video.pause();
    }

    if (bgMusic) {
        // Quick fade out
        let fadeVolume = bgMusic.volume;
        const fadeOut = setInterval(() => {
            if (fadeVolume > 0.05) {
                fadeVolume -= 0.05;
                bgMusic.volume = fadeVolume;
            } else {
                clearInterval(fadeOut);
                bgMusic.pause();
                bgMusic.volume = 0;
                bgMusic.currentTime = 0;
            }
        }, 30);
    }

    setTimeout(() => {
        videoSection.classList.remove('active');
        giftSection.classList.add('active');
        window.scrollTo(0, giftSection.offsetTop);
        if (window.haptic) window.haptic.tap();
    }, 750); // Mid-point of swipe
}

function smoothScrollTo(element, duration) {
    const targetPosition = element.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
}

// Function to be called from gift-box.js when gift is opened
function onGiftBoxOpened() {
    setTimeout(() => {
        revealLoveLetter();
    }, 1000);
}

function revealLoveLetter() {
    const loveLetter = document.getElementById('love-letter');

    if (loveLetter) {
        // Remove hidden class and add visible class
        loveLetter.classList.remove('hidden');

        // Trigger animation
        setTimeout(() => {
            loveLetter.classList.add('visible');
        }, 50);

        // Add close button handler
        const closeButton = document.getElementById('letter-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeLoveLetter);
        }
    }
}

function closeLoveLetter() {
    const loveLetter = document.getElementById('love-letter');

    if (loveLetter) {
        // Remove visible class to trigger reverse animation
        loveLetter.classList.remove('visible');

        // Add hidden class after animation completes
        setTimeout(() => {
            loveLetter.classList.add('hidden');
        }, 1200); // Match the transition duration
    }
}

// Export for use in gift-box.js
window.onGiftBoxOpened = onGiftBoxOpened;
