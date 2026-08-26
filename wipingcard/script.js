window.onerror = function(msg, url, lineNo, columnNo, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 9999; background: red; color: white; padding: 10px; word-break: break-all;';
    errorDiv.textContent = 'Error: ' + msg + ' at ' + lineNo + ':' + columnNo;
    document.body.appendChild(errorDiv);
    return false;
};

    // State
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = {
        'spades': { symbol: '♠', colorClass: 'black' },
        'hearts': { symbol: '♥', colorClass: 'red' },
        'clubs': { symbol: '♣', colorClass: 'black' },
        'diamonds': { symbol: '♦', colorClass: 'red' }
    };
    
    let currentSuit = 'spades';
    let currentValueIndex = 0; // A
    let isLocked = false;
    let isFlipped = false;
    let isForceSelectMode = false;

    // DOM Elements
    const hintEl = document.getElementById('secret-hint');
    const appEl = document.getElementById('app');
    
    // Card Elements
    const cardEl = document.querySelector('.card');
    const cardValues = document.querySelectorAll('.card-value');
    const cardSuits = document.querySelectorAll('.card-suit');
    const cardCenter = document.querySelector('.card-center');
    
    // Canvas setup
    const canvas = document.getElementById('reveal-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Fill canvas with deep black
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    window.addEventListener('resize', () => {
        if (!isLocked) resizeCanvas(); // Only resize if not locked, to avoid resetting the scratch
    });
    resizeCanvas();

    function getCardImageUrl(suitSymbol, val) {
        const SUIT_MAP = { '♠': 'S', '♥': 'H', '♣': 'C', '♦': 'D' };
        const v = val === '10' ? '0' : val;
        return `https://deckofcardsapi.com/static/img/${v}${SUIT_MAP[suitSymbol]}.png`;
    }

    // Update UI based on state
    function updateState() {
        const val = values[currentValueIndex];
        const suitData = suits[currentSuit];
        
        // Update Hint (use \uFE0E to force text rendering so CSS color works)
        hintEl.textContent = `${suitData.symbol}\uFE0E ${val}`;
        hintEl.style.display = isForceSelectMode ? 'none' : 'block';
        
        // Update Card DOM (Image based)
        const frontEl = document.querySelector('.card-front');
        if (frontEl) {
            frontEl.style.backgroundImage = `url(${getCardImageUrl(suitData.symbol, val)})`;
            frontEl.style.backgroundSize = '100% 100%';
            frontEl.style.backgroundPosition = 'center';
            frontEl.style.backgroundRepeat = 'no-repeat';
            frontEl.innerHTML = ''; // 清空原本的純文字結構
        }
        
        cardEl.className = `card ${suitData.colorClass}`;
    }
    
    // Initial update
    updateState();

    // Secret Inputs - Suits
    document.querySelectorAll('.zone').forEach(zone => {
        if (zone.dataset.suit) {
            zone.addEventListener('touchstart', (e) => {
                if (isLocked || isForceSelectMode) return;
                e.preventDefault();
                currentSuit = zone.dataset.suit;
                updateState();
            });
            zone.addEventListener('mousedown', (e) => {
                if (isLocked || isForceSelectMode) return;
                currentSuit = zone.dataset.suit;
                updateState();
            });
            zone.addEventListener('click', (e) => {
                if (isLocked || isForceSelectMode) return;
                currentSuit = zone.dataset.suit;
                updateState();
            });
        }
    });

    // Secret Inputs - Values (Right edge swipe)
    const valueZone = document.getElementById('value-zone');
    let startY = 0;
    let startIndex = 0;
    
    function handleValueStart(y) {
        if (isLocked || isForceSelectMode) return;
        startY = y;
        startIndex = currentValueIndex;
    }
    
    function handleValueMove(y) {
        if (isLocked || isForceSelectMode) return;
        const diffY = startY - y;
        // Every 20px swipe up increases value, down decreases
        const steps = Math.floor(diffY / 20);
        let newIndex = startIndex + steps;
        
        // Clamp
        if (newIndex < 0) newIndex = 0;
        if (newIndex > 12) newIndex = 12;
        
        if (currentValueIndex !== newIndex) {
            currentValueIndex = newIndex;
            updateState();
            if (navigator.vibrate) navigator.vibrate(10); // Haptic feedback on change
        }
    }

    valueZone.addEventListener('touchstart', (e) => {
        handleValueStart(e.touches[0].clientY);
    });
    valueZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleValueMove(e.touches[0].clientY);
    });
    
    // Allow tapping to increment value
    valueZone.addEventListener('touchend', (e) => {
        if (isLocked || isForceSelectMode) return;
        if (startIndex === currentValueIndex && startY > 0) {
            // It was a tap (no value change during move)
            currentValueIndex = (currentValueIndex + 1) % 13;
            updateState();
            if (navigator.vibrate) navigator.vibrate(10);
        }
        startY = 0;
    });
    
    // Mouse fallback for testing
    let isDragging = false;
    valueZone.addEventListener('mousedown', (e) => {
        isDragging = true;
        handleValueStart(e.clientY);
    });
    window.addEventListener('mousemove', (e) => {
        if (isDragging) handleValueMove(e.clientY);
    });
    window.addEventListener('mouseup', (e) => { 
        isDragging = false; 
    });
    
    valueZone.addEventListener('click', (e) => {
        if (isLocked || isForceSelectMode) return;
        if (startIndex === currentValueIndex) {
            currentValueIndex = (currentValueIndex + 1) % 13;
            updateState();
        }
    });

    // Lock mechanism (Double tap)
    let lastTap = 0;
    appEl.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            lockApp();
        }
        lastTap = currentTime;
    });
    appEl.addEventListener('dblclick', lockApp);

    function lockApp() {
        if (isLocked) return;
        isLocked = true;
        appEl.classList.add('locked'); // Hides the UI overlay and hints
        if (navigator.vibrate) navigator.vibrate(50);
    }

    function resetApp() {
        isLocked = false;
        isFlipped = false;
        appEl.classList.remove('locked');
        const theCard = document.getElementById('the-card');
        if (theCard) {
            theCard.classList.remove('flipped');
        }
        resizeCanvas();
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    }

    // Backend Logic
    const backendModal = document.getElementById('backend-modal');
    const forceSelectToggle = document.getElementById('force-select-toggle');
    const forceSelectControls = document.getElementById('force-select-controls');
    const forceSuit = document.getElementById('force-suit');
    const forceValue = document.getElementById('force-value');
    const btnCloseBackend = document.getElementById('btn-close-backend');
    let longPressTimer;

    function handleBottomRightPress(x, y) {
        if (x > window.innerWidth - 100 && y > window.innerHeight - 100) {
            longPressTimer = setTimeout(() => {
                if (backendModal) backendModal.classList.add('show');
                if (navigator.vibrate) navigator.vibrate(50);
            }, 1000); // 1 second long press
        }
    }

    function cancelLongPress() {
        if (longPressTimer) clearTimeout(longPressTimer);
    }

    if (forceSelectToggle) {
        forceSelectToggle.addEventListener('change', (e) => {
            isForceSelectMode = e.target.checked;
            forceSelectControls.style.display = isForceSelectMode ? 'block' : 'none';
            if (isForceSelectMode) {
                currentSuit = forceSuit.value;
                currentValueIndex = parseInt(forceValue.value);
                updateState();
            }
        });

        forceSuit.addEventListener('change', (e) => {
            currentSuit = e.target.value;
            updateState();
        });

        forceValue.addEventListener('change', (e) => {
            currentValueIndex = parseInt(e.target.value);
            updateState();
        });

        btnCloseBackend.addEventListener('click', () => {
            backendModal.classList.remove('show');
            resetApp();
        });
    }

    // Scratch off logic
    let isDrawing = false;
    let startX = 0;
    let startY_scratch = 0;
    let hasMoved = false;
    let isZoneTap = false;
    
    function scratchStart(x, y) {
        if (isFlipped && x > window.innerWidth - 100 && y > window.innerHeight - 100) {
            resetApp();
            return;
        }
        
        handleBottomRightPress(x, y);
        
        isDrawing = true;
        hasMoved = false;
        startX = x;
        startY_scratch = y;
        scratch(x, y);
    }
    
    function scratchMove(x, y) {
        cancelLongPress();
        if (!isDrawing) return;
        if (Math.abs(x - startX) > 5 || Math.abs(y - startY_scratch) > 5) {
            hasMoved = true;
        }
        scratch(x, y);
    }
    
    function getScratchedPercentage() {
        const theCard = document.getElementById('the-card');
        if (!theCard) return 0;
        
        const rect = theCard.getBoundingClientRect();
        
        const x = Math.max(0, Math.floor(rect.left));
        const y = Math.max(0, Math.floor(rect.top));
        const w = Math.min(canvas.width - x, Math.ceil(rect.width));
        const h = Math.min(canvas.height - y, Math.ceil(rect.height));

        if (w <= 0 || h <= 0) return 0;

        const imageData = ctx.getImageData(x, y, w, h);
        const data = imageData.data;
        let transparentPixels = 0;
        const stride = 16; // Check every 4th pixel for performance
        const totalPixelsToCheck = Math.floor(data.length / stride); 
        for (let i = 3; i < data.length; i += stride) {
            if (data[i] < 128) {
                transparentPixels++;
            }
        }
        return (transparentPixels / totalPixelsToCheck) * 100;
    }

    function scratchEnd() {
        cancelLongPress();
        if (isDrawing && !hasMoved && !isZoneTap) {
            // It was a tap (not on a zone)
            if (isLocked && !isFlipped) {
                const scratched = getScratchedPercentage();
                if (scratched > 50) { // Require at least 50% scratched to flip
                    const theCard = document.getElementById('the-card');
                    if (theCard) {
                        theCard.classList.add('flipped');
                        isFlipped = true;
                        if (navigator.vibrate) navigator.vibrate(20);
                    }
                }
            }
        }
        isDrawing = false;
        setTimeout(() => isZoneTap = false, 50);
    }
    
    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2); // 35px radius brush
        ctx.fill();
    }
    
    appEl.addEventListener('touchstart', (e) => {
        // If it's a zone, mark it
        if (e.target.classList.contains('zone')) isZoneTap = true;
        const touch = e.touches[0];
        scratchStart(touch.clientX, touch.clientY);
    });
    appEl.addEventListener('touchmove', (e) => {
        if (e.target.classList.contains('zone')) e.preventDefault();
        const touch = e.touches[0];
        scratchMove(touch.clientX, touch.clientY);
    });
    appEl.addEventListener('touchend', scratchEnd);

    appEl.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('zone')) isZoneTap = true;
        scratchStart(e.clientX, e.clientY);
    });
    appEl.addEventListener('mousemove', (e) => scratchMove(e.clientX, e.clientY));
    appEl.addEventListener('mouseup', scratchEnd);
    appEl.addEventListener('mouseleave', scratchEnd);
