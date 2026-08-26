// 資料定義
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = [
    { name: 'spades', symbol: '♠', colorClass: 'black-suit', display: '黑桃' },
    { name: 'hearts', symbol: '♥', colorClass: 'red-suit', display: '紅心' },
    { name: 'clubs', symbol: '♣', colorClass: 'black-suit', display: '梅花' },
    { name: 'diamonds', symbol: '♦', colorClass: 'red-suit', display: '方塊' }
];

const pokerDeck = [];
for (let suit of suits) {
    for (let val of values) {
        pokerDeck.push({ type: 'poker', value: val, suit: suit, display: `${suit.display}${val}` });
    }
}

const flagData = [
    { name: 'Taiwan', code: 'tw', url: 'https://flagcdn.com/w320/tw.png', display: '台灣' },
    { name: 'Japan', code: 'jp', url: 'https://flagcdn.com/w320/jp.png', display: '日本' },
    { name: 'USA', code: 'us', url: 'https://flagcdn.com/w320/us.png', display: '美國' },
    { name: 'UK', code: 'gb', url: 'https://flagcdn.com/w320/gb.png', display: '英國' },
    { name: 'South Korea', code: 'kr', url: 'https://flagcdn.com/w320/kr.png', display: '韓國' },
    { name: 'France', code: 'fr', url: 'https://flagcdn.com/w320/fr.png', display: '法國' },
    { name: 'Germany', code: 'de', url: 'https://flagcdn.com/w320/de.png', display: '德國' },
    { name: 'Italy', code: 'it', url: 'https://flagcdn.com/w320/it.png', display: '義大利' },
    { name: 'Canada', code: 'ca', url: 'https://flagcdn.com/w320/ca.png', display: '加拿大' },
    { name: 'Australia', code: 'au', url: 'https://flagcdn.com/w320/au.png', display: '澳洲' },
    { name: 'Brazil', code: 'br', url: 'https://flagcdn.com/w320/br.png', display: '巴西' },
    { name: 'Spain', code: 'es', url: 'https://flagcdn.com/w320/es.png', display: '西班牙' },
    { name: 'Switzerland', code: 'ch', url: 'https://flagcdn.com/w320/ch.png', display: '瑞士' },
    { name: 'Sweden', code: 'se', url: 'https://flagcdn.com/w320/se.png', display: '瑞典' },
    { name: 'New Zealand', code: 'nz', url: 'https://flagcdn.com/w320/nz.png', display: '紐西蘭' },
    { name: 'India', code: 'in', url: 'https://flagcdn.com/w320/in.png', display: '印度' },
    { name: 'Thailand', code: 'th', url: 'https://flagcdn.com/w320/th.png', display: '泰國' },
    { name: 'Singapore', code: 'sg', url: 'https://flagcdn.com/w320/sg.png', display: '新加坡' },
    { name: 'Malaysia', code: 'my', url: 'https://flagcdn.com/w320/my.png', display: '馬來西亞' },
    { name: 'Vietnam', code: 'vn', url: 'https://flagcdn.com/w320/vn.png', display: '越南' },
    { name: 'Argentina', code: 'ar', url: 'https://flagcdn.com/w320/ar.png', display: '阿根廷' },
    { name: 'Mexico', code: 'mx', url: 'https://flagcdn.com/w320/mx.png', display: '墨西哥' },
    { name: 'Netherlands', code: 'nl', url: 'https://flagcdn.com/w320/nl.png', display: '荷蘭' },
    { name: 'South Africa', code: 'za', url: 'https://flagcdn.com/w320/za.png', display: '南非' },
    { name: 'Egypt', code: 'eg', url: 'https://flagcdn.com/w320/eg.png', display: '埃及' }
];
const flagDeck = flagData.map(f => ({ type: 'flag', ...f }));

const landmarkData = [
    { name: 'Taipei 101', url: '圖片/台北101.webp', display: '台北 101' },
    { name: 'Eiffel Tower', url: '圖片/巴黎鐵塔.jpg', display: '巴黎鐵塔' },
    { name: 'Statue of Liberty', url: '圖片/自由女神.webp', display: '自由女神像' },
    { name: 'Mount Fuji', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/500px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg', display: '富士山' },
    { name: 'Great Wall of China', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/500px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg', display: '萬里長城' },
    { name: 'Leaning Tower of Pisa', url: '圖片/比薩斜塔.jpg', display: '比薩斜塔' },
    { name: 'Colosseum', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/500px-Colosseo_2020.jpg', display: '羅馬競技場' },
    { name: 'Taj Mahal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/500px-Taj_Mahal_%28Edited%29.jpeg', display: '泰姬陵' },
    { name: 'Sydney Opera House', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/500px-Sydney_Australia._%2821339175489%29.jpg', display: '雪梨歌劇院' },
    { name: 'Pyramids of Giza', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/500px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg', display: '金字塔' },
    { name: 'Big Ben', url: '圖片/大笨鐘.jpg', display: '大笨鐘' },
    { name: 'Christ the Redeemer', url: '圖片/救世基督像.jpg', display: '救世基督像' },
    { name: 'Iceland Aurora', url: '圖片/冰島極光.jpg', display: '冰島極光' },
    { name: 'Stonehenge', url: '圖片/巨石陣.jpg', display: '巨石陣' },
    { name: 'Moai', url: '圖片/復活節島石像.jpg', display: '復活節島石像' },
    { name: 'Burj Al Arab', url: '圖片/杜拜帆船飯店.jpg', display: '杜拜帆船飯店' },
    { name: 'Uluru', url: '圖片/烏魯魯艾爾斯岩.jpg', display: '烏魯魯艾爾斯岩' },
    { name: 'Victoria Falls', url: '圖片/维多利亞瀑布.jpg', display: '維多利亞瀑布' },
    { name: 'Grand Canyon', url: '圖片/美國大峽谷.jpg', display: '美國大峽谷' },
    { name: 'Mount Everest', url: '圖片/聖母峰.jpg', display: '聖母峰' },
    { name: 'Hagia Sophia', url: '圖片/聖索菲亞大教堂.jpg', display: '聖索菲亞大教堂' },
    { name: 'Machu Picchu', url: '圖片/馬丘比丘.jpg', display: '馬丘比丘' },
    { name: 'Maldives', url: '圖片/馬爾地夫.jpg', display: '馬爾地夫' }
];
const landmarkDeck = landmarkData.map(l => ({ type: 'landmark', ...l }));

let deck = [];

// DOM 元素
const carousel = document.getElementById('carousel');

// 狀態
let secretChosenCard = null;
let viewTimer = null;
let currentlyVisibleCard = null;
let currentlyVisibleCardElement = null;
let isDraggingCarousel = false;
let hasDragged = false;
let isRecordingActive = false;
let hasRecorded = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            currentlyVisibleCardElement = entry.target;
            const index = parseInt(entry.target.dataset.index);
            currentlyVisibleCard = deck[index];
            
            clearTimeout(viewTimer);
            if (isRecordingActive && !hasRecorded) {
                viewTimer = setTimeout(() => {
                    secretChosenCard = currentlyVisibleCard;
                    hasRecorded = true;
                    isRecordingActive = false;
                    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
                    console.log("背景紀錄觀眾的牌:", secretChosenCard.display);
                }, 5000);
            }
        } else {
            if (entry.target === currentlyVisibleCardElement) {
                clearTimeout(viewTimer);
            }
        }
    });
}, { threshold: 0.6 });

// 綁定隱藏觸發區事件
const secretTrigger = document.getElementById('secret-trigger');
if (secretTrigger) {
    secretTrigger.addEventListener('click', (e) => {
        e.stopPropagation(); // 避免觸發到其他事件
        isRecordingActive = true;
        hasRecorded = false;
        secretChosenCard = null;
        if (navigator.vibrate) navigator.vibrate(20); // 短震動提示開啟紀錄
        console.log("已開啟背景紀錄模式");
        
        // 如果當下已經有牌在畫面上，重新啟動計時
        clearTimeout(viewTimer);
        if (currentlyVisibleCard) {
            viewTimer = setTimeout(() => {
                secretChosenCard = currentlyVisibleCard;
                hasRecorded = true;
                isRecordingActive = false;
                if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
                console.log("背景紀錄觀眾的牌:", secretChosenCard.display);
            }, 5000);
        }
    });
}

let chosenCard = null;
let wrongCard = null;
let longPressTimer = null;
let isModalOpen = false;
let isMouseDown = false; // 用於桌機滑鼠長按判定

// 1. 初始化 Carousel
function initCarousel() {
    deck.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.dataset.index = index;
        
        const cardEl = document.createElement('div');
        cardEl.className = 'card flipped';
        cardEl.style.transform = "rotateY(0deg)";
        
        const front = document.createElement('div');
        renderCardFront(front, card);
        
        cardEl.appendChild(front);
        item.appendChild(cardEl);
        
        item.addEventListener('click', (e) => {
            if (hasDragged) return;
            if (secretChosenCard && currentlyVisibleCard && currentlyVisibleCard !== secretChosenCard) {
                if (navigator.vibrate) navigator.vibrate([50]);
                cardEl.classList.add('magic-change');
                
                const targetSecretCard = secretChosenCard;
                const clickedCardIndex = parseInt(item.dataset.index);
                const originalCard = deck[clickedCardIndex];

                setTimeout(() => {
                    renderCardFront(front, targetSecretCard);
                    
                    // 找到原本觀眾那張牌的 DOM，把它變成這張點錯的牌，避免出現兩張一樣的牌
                    const secretIndex = deck.findIndex(c => c === targetSecretCard);
                    if (secretIndex !== -1) {
                        const originalSecretDom = carousel.children[secretIndex].querySelector('.card-front');
                        if (originalSecretDom) {
                            renderCardFront(originalSecretDom, originalCard);
                        }
                        // 更新陣列資料
                        deck[clickedCardIndex] = targetSecretCard;
                        deck[secretIndex] = originalCard;
                    }

                    // 變牌後清除紀錄，點其他牌就不會再變了
                    secretChosenCard = null;
                    currentlyVisibleCard = targetSecretCard;
                }, 300);
            }
        });

        observer.observe(item);
        carousel.appendChild(item);
    });
}

// 實作桌機拖曳滾動 (Drag to scroll)
let startScrollX;
let scrollLeft;

carousel.addEventListener('mousedown', (e) => {
    isDraggingCarousel = true;
    hasDragged = false;
    startScrollX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});
carousel.addEventListener('mouseleave', () => {
    isDraggingCarousel = false;
});
carousel.addEventListener('mouseup', () => {
    isDraggingCarousel = false;
});
carousel.addEventListener('mousemove', (e) => {
    if (!isDraggingCarousel) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    if (Math.abs(x - startScrollX) > 5) hasDragged = true;
    const walk = (x - startScrollX) * 2; // 滾動速度
    carousel.scrollLeft = scrollLeft - walk;
});



function getCardImageUrl(suitSymbol, val) {
    const SUIT_MAP = { '♠': 'S', '♥': 'H', '♣': 'C', '♦': 'D' };
    const v = val === '10' ? '0' : val;
    return `https://deckofcardsapi.com/static/img/${v}${SUIT_MAP[suitSymbol]}.png`;
}

function renderCardFront(element, card) {
    element.className = 'card-front';
    element.innerHTML = '';
    element.style.backgroundColor = 'white';
    
    if (card.type === 'poker') {
        element.style.backgroundImage = `url(${getCardImageUrl(card.suit.symbol, card.value)})`;
        element.style.backgroundSize = '100% 100%';
        element.style.flexDirection = 'row';
    } else if (card.type === 'flag' || card.type === 'landmark') {
        element.style.backgroundImage = 'none';
        element.style.flexDirection = 'column';
        
        const img = document.createElement('img');
        img.src = card.url;
        img.style.width = '85%';
        img.style.aspectRatio = card.type === 'flag' ? '3 / 2' : '4 / 3'; // landmarks use 4:3
        img.style.objectFit = 'cover';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '6px';
        img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        img.style.marginBottom = '24px';
        
        const label = document.createElement('div');
        label.textContent = card.display;
        label.style.fontSize = '32px';
        label.style.fontWeight = '600';
        label.style.color = '#333';
        label.style.letterSpacing = '4px';
        
        element.appendChild(img);
        element.appendChild(label);
    }
}


function loadDeckTheme(theme) {
    let baseDeck;
    if (theme === 'theme-flags') {
        baseDeck = [...flagDeck];
    } else if (theme === 'theme-landmarks') {
        baseDeck = [...landmarkDeck];
    } else {
        baseDeck = [...pokerDeck];
    }
    baseDeck.sort(() => Math.random() - 0.5);
    
    // 建立大量重複的牌組以產生「無限循環」的效果
    deck = [];
    const repeatCount = (theme === 'theme-flags' || theme === 'theme-landmarks') ? 50 : 15;
    for (let i = 0; i < repeatCount; i++) {
        deck.push(...baseDeck.map(c => ({...c})));
    }
    
    carousel.innerHTML = '';
    if (typeof observer !== 'undefined') {
        observer.disconnect();
    }
    
    initCarousel();
    
    secretChosenCard = null;
    currentlyVisibleCard = null;
    isRecordingActive = false;
    hasRecorded = false;
    
    setTimeout(() => {
        const middleIndex = Math.floor(deck.length / 2);
        if (carousel.children[middleIndex]) {
            carousel.children[middleIndex].scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
        }
    }, 0);
}

// 後台設定邏輯
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('btn-close-settings');
const themeSelect = document.getElementById('theme-select');

if (settingsBtn) {
    let lastTap = 0;
    // 支援手機與電腦的雙擊判斷
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            settingsModal.classList.add('show');
            lastTap = 0; // 重置
        } else {
            lastTap = currentTime;
        }
    });

    // 保留原本的 dblclick 備用
    settingsBtn.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        settingsModal.classList.add('show');
    });
}

if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsModal.classList.remove('show');
    });
}

if (themeSelect) {
    // 讀取儲存的主題
    const savedTheme = localStorage.getItem('magic-theme') || 'theme-poker';
    document.body.className = savedTheme;
    themeSelect.value = savedTheme;
    
    // 初次載入
    loadDeckTheme(savedTheme);

    themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        document.body.className = newTheme;
        localStorage.setItem('magic-theme', newTheme);
        loadDeckTheme(newTheme);
    });
} else {
    loadDeckTheme('theme-poker');
}

