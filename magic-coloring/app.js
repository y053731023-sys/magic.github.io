document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase 雲端即時同步設定 ---
    const firebaseConfig = {
        apiKey: "AIzaSyAnSci3QtfRwtjWDPYp4NcG3k2vmQzOmBE",
        authDomain: "magic-coloring-a8c59.firebaseapp.com",
        databaseURL: "https://magic-coloring-a8c59-default-rtdb.firebaseio.com",
        projectId: "magic-coloring-a8c59",
        storageBucket: "magic-coloring-a8c59.firebasestorage.app",
        messagingSenderId: "66585416550",
        appId: "1:66585416550:web:3af46ad2e7ee62de4d2ea7",
        measurementId: "G-MBCL3XTWBT"
    };
    
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    function syncStateToFirebase() {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") return; // 尚未設定金鑰則略過
        
        const payload = {
            currentImage: currentImageSrc,
            timestamp: Date.now(),
            selectedColorHex: "#" + (1 << 24 | selectedColor.r << 16 | selectedColor.g << 8 | selectedColor.b).toString(16).slice(1).toUpperCase()
        };

        if (currentConfig && currentConfig.zones) {
            payload.zones = {};
            currentConfig.zones.forEach((z) => {
                payload.zones[z.id] = {
                    id: z.id,
                    name: z.name,
                    currentColorHex: "#" + (1 << 24 | z.currentColor.r << 16 | z.currentColor.g << 8 | z.currentColor.b).toString(16).slice(1).toUpperCase()
                };
            });
            db.ref('magic_state').set(payload).catch(err => console.error("Firebase error:", err));
        } else {
            db.ref('magic_state').update(payload).catch(err => console.error("Firebase error:", err));
        }
    }

    // --- 畫作區塊與顏色配置 ---
    const IMAGE_CONFIGS = {
        "著色版_boy_0.png": {
            name: "小男孩",
            zones: [
                { id: "hair", name: "頭髮", originalColor: { r: 196, g: 31, b: 31 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "balloon", name: "氣球", originalColor: { r: 255, g: 240, b: 0 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "clothes", name: "衣服", originalColor: { r: 213, g: 0, b: 232 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "pants", name: "褲子", originalColor: { r: 16, g: 0, b: 230 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "shoes", name: "鞋子", originalColor: { r: 0, g: 234, b: 255 }, currentColor: { r: 255, g: 255, b: 255 } }
            ]
        },
        "著色版_gril_0.png": {
            name: "小女孩",
            zones: [
                { id: "hair", name: "頭髮", originalColor: { r: 0, g: 192, b: 255 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "balloon", name: "氣球", originalColor: { r: 255, g: 240, b: 0 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "ribbon_clothes", name: "蝴蝶結與上衣", originalColor: { r: 255, g: 0, b: 0 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "skirt_eyes", name: "裙子與眼睛", originalColor: { r: 0, g: 12, b: 255 }, currentColor: { r: 255, g: 255, b: 255 } },
                { id: "shoes", name: "鞋子", originalColor: { r: 83, g: 253, b: 0 }, currentColor: { r: 255, g: 255, b: 255 } }
            ]
        }
    };

    // 演算法判定容差 (色彩距離)
    const TOLERANCE = 80;

    // 建立並預載公園背景圖片
    const parkImage = new Image();
    if (typeof PARK_IMAGE_BASE64 !== "undefined") {
        parkImage.src = PARK_IMAGE_BASE64;
    }

    // --- 狀態變數 ---
    let currentImageSrc = "著色版_boy_0.png";
    let selectedColor = { r: 255, g: 89, b: 94 }; // 目前選取的著色色值
    let originalImageData = null; // 唯讀的原始像素資料
    let currentConfig = null; // 當前畫作的區域配置
    let history = []; // 儲存色彩狀態的歷史堆疊 (Undo)
    const maxHistory = 30;

    // --- DOM 元素 ---
    const canvas = document.getElementById('coloring-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const canvasContainer = canvas.parentElement;
    const loadingOverlay = document.getElementById('loading');
    const paletteContainer = document.getElementById('palette');
    
    // 按鈕
    const btnUndo = document.getElementById('btn-undo');
    const btnReset = document.getElementById('btn-reset');
    const btnFinish = document.getElementById('btn-finish');
    const imgBtns = document.querySelectorAll('.img-btn');

    // 預設色彩 (紅、橙、黃、綠、藍、靛、紫)
    const defaultColors = [
        '#FF5E62', // 紅
        '#FF9F43', // 橙
        '#FECB3E', // 黃
        '#10AC84', // 綠
        '#2E86DE', // 藍
        '#3F51B5', // 靛
        '#8338EC'  // 紫
    ];

    // --- 初始化 ---
    function init() {
        generatePalette();
        bindEvents();
        loadImage(currentImageSrc);
        updateColorDisplay('#FF5E62');
    }

    // --- 生成調色盤 ---
    function generatePalette() {
        paletteContainer.innerHTML = '';
        defaultColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            
            swatch.addEventListener('click', () => {
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                updateColorDisplay(color);
            });
            paletteContainer.appendChild(swatch);
        });
        paletteContainer.firstChild.classList.add('active');
    }

    // 更新顯示當前色彩
    function updateColorDisplay(hex) {
        selectedColor = hexToRgb(hex);
        syncStateToFirebase(); // 選取顏色當下立即同步到 Firebase
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    // --- 載入畫作 ---
    function loadImage(src) {
        loadingOverlay.classList.add('active');
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            // 建立暫時 Canvas 來計算人物主體的 Bounding Box
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            let tempImgData;
            try {
                tempImgData = tempCtx.getImageData(0, 0, img.width, img.height);
            } catch (e) {
                console.error("Temp canvas CORS error, falling back to direct draw:", e);
                // 降級方案：直接繪製
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                currentConfig = JSON.parse(JSON.stringify(IMAGE_CONFIGS[src]));
                history = [];
                saveState();
                render();
                loadingOverlay.classList.remove('active');
                return;
            }
            
            const data = tempImgData.data;
            
            // 尋找非透明像素邊界 (Bounding Box)
            let minX = img.width;
            let minY = img.height;
            let maxX = 0;
            let maxY = 0;
            let found = false;
            
            for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                    const idx = (y * img.width + x) * 4;
                    const alpha = data[idx + 3];
                    if (alpha > 10) { // 忽略極透明像素
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        found = true;
                    }
                }
            }
            
            // 若沒找到，使用預設值
            if (!found) {
                minX = 0;
                minY = 0;
                maxX = img.width;
                maxY = img.height;
            }
            
            const contentW = maxX - minX;
            const contentH = maxY - minY;
            
            // 動態設定畫布比例，使其緊貼人物，這樣在手機直向時就能往下延伸放大！
            // 預留約 3% 的微小邊距即可
            const paddingW = contentW * 0.03;
            const paddingH = contentH * 0.03;
            
            const logicalW = contentW + paddingW * 2;
            const logicalH = contentH + paddingH * 2;
            
            // 為了保持著色時的高品質解析度，將最大邊放大至 1200
            const hiResScale = 1200 / Math.max(logicalW, logicalH);
            
            canvas.width = logicalW * hiResScale;
            canvas.height = logicalH * hiResScale;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const drawW = contentW * hiResScale;
            const drawH = contentH * hiResScale;
            const dx = paddingW * hiResScale;
            const dy = paddingH * hiResScale;
            
            ctx.drawImage(img, minX, minY, contentW, contentH, dx, dy, drawW, drawH);
            
            // 讀取已經放大且置中後的人物像素作為我們的遮罩資料
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 初始化這張圖的著色狀態 (深拷貝)
            currentConfig = JSON.parse(JSON.stringify(IMAGE_CONFIGS[src]));
            
            // 清空並初始化歷史堆疊
            history = [];
            saveState();
            
            // 渲染畫面
            render();
            syncStateToFirebase();
            loadingOverlay.classList.remove('active');
        };
        
        img.onerror = () => {
            loadingOverlay.classList.remove('active');
            alert("載入圖片失敗: " + src);
        };
        
        // 優先使用 Base64 載入，避開本地 file:// 協議的 CORS 限制
        let resolvedSrc = src;
        if (src === "著色版_boy_0.png" && typeof BOY_IMAGE_BASE64 !== "undefined") {
            resolvedSrc = BOY_IMAGE_BASE64;
        } else if (src === "著色版_gril_0.png" && typeof GIRL_IMAGE_BASE64 !== "undefined") {
            resolvedSrc = GIRL_IMAGE_BASE64;
        }
        
        img.src = resolvedSrc;
    }

    // --- 儲存狀態至歷史紀錄 (Undo) ---
    function saveState() {
        if (history.length >= maxHistory) {
            history.shift(); 
        }
        // 我們只需要儲存當前各個區塊的顏色設定，比儲存整張 ImageData 快且輕巧！
        const state = currentConfig.zones.map(z => ({ id: z.id, color: { ...z.currentColor } }));
        history.push(state);
    }

    // --- 復原 (Undo) ---
    function undo() {
        if (history.length > 1) {
            history.pop(); // 移除當前狀態
            const previousState = history[history.length - 1];
            
            // 將上一狀態的顏色套用回 currentConfig
            previousState.forEach(savedZone => {
                const zone = currentConfig.zones.find(z => z.id === savedZone.id);
                if (zone) {
                    zone.currentColor = { ...savedZone.color };
                }
            });
            
            render();
            syncStateToFirebase();
        }
    }

    // --- 重新渲染畫布 ---
    // 利用非破壞性色彩替換演算法，並合成背景圖
    function render() {
        if (!originalImageData || !currentConfig) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        // 1. 清空畫布，不繪製背景圖案
        ctx.clearRect(0, 0, width, height);
        
        // 2. 取得此時包含背景的像素資料作為畫布基礎
        const outputImageData = ctx.getImageData(0, 0, width, height);
        
        const srcData = originalImageData.data;
        const dstData = outputImageData.data;
        const zones = currentConfig.zones;
        const len = srcData.length;
        
        for (let i = 0; i < len; i += 4) {
            const r_orig = srcData[i];
            const g_orig = srcData[i + 1];
            const b_orig = srcData[i + 2];
            const a_orig = srcData[i + 3];
            
            // 如果人物像素是完全透明的，保持背景像素，直接略過
            if (a_orig === 0) continue;
            
            // 預設將此點覆蓋為人物的原始像素
            dstData[i] = r_orig;
            dstData[i + 1] = g_orig;
            dstData[i + 2] = b_orig;
            dstData[i + 3] = a_orig;
            
            // 尋找這個像素是否屬於任何可著色區塊
            for (let j = 0; j < zones.length; j++) {
                const zone = zones[j];
                const orig = zone.originalColor;
                
                // 使用曼哈頓距離比對顏色
                const diff = Math.abs(r_orig - orig.r) + Math.abs(g_orig - orig.g) + Math.abs(b_orig - orig.b);
                
                if (diff < TOLERANCE) {
                    // 計算相似度權重，用於反鋸齒混合
                    const weight = 1.0 - (diff / TOLERANCE);
                    
                    // 色彩插值轉換：保留邊緣的反鋸齒混合細節，扣除原色，加入新色
                    dstData[i] = Math.max(0, Math.min(255, Math.round(r_orig - weight * orig.r + weight * zone.currentColor.r)));
                    dstData[i + 1] = Math.max(0, Math.min(255, Math.round(g_orig - weight * orig.g + weight * zone.currentColor.g)));
                    dstData[i + 2] = Math.max(0, Math.min(255, Math.round(b_orig - weight * orig.b + weight * zone.currentColor.b)));
                    
                    break; // 匹配成功，跳出 zone 迴圈
                }
            }
        }
        
        ctx.putImageData(outputImageData, 0, 0);
    }

    // --- 事件綁定 ---
    function bindEvents() {
        // 切換畫作
        imgBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                imgBtns.forEach(b => b.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                currentImageSrc = target.dataset.img;
                loadImage(currentImageSrc);
            });
        });

        // 功能動作
        btnUndo.addEventListener('click', undo);
        btnReset.addEventListener('click', () => {
            if (confirm('確定要清除目前的著色成品，恢復原圖嗎？')) {
                // 將 currentConfig 重設為初始值
                currentConfig = JSON.parse(JSON.stringify(IMAGE_CONFIGS[currentImageSrc]));
                saveState();
                render();
                syncStateToFirebase();
            }
        });

        if (btnFinish) {
            btnFinish.addEventListener('click', () => {
                if (!currentConfig || !currentConfig.zones) return;
                
                // 檢查是否所有區塊都已經上色 (非白色)
                const uncoloredZones = currentConfig.zones.filter(z => z.currentColor.r === 255 && z.currentColor.g === 255 && z.currentColor.b === 255);
                
                if (uncoloredZones.length > 0) {
                    alert(`還有 ${uncoloredZones.length} 個區塊尚未上色喔！繼續加油！`);
                } else {
                    alert('🎉 恭喜你！已經完成整幅畫作的上色了！非常漂亮！');
                }
            });
        }

        // 浮動按鈕與抽屜選單事件 (手機版)
        const btnTogglePalette = document.getElementById('btn-toggle-palette');
        const btnCloseSidebar = document.getElementById('btn-close-sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const sidebar = document.getElementById('sidebar');

        if (btnTogglePalette && btnCloseSidebar && sidebarOverlay && sidebar) {
            btnTogglePalette.addEventListener('click', () => {
                sidebar.classList.add('active');
                sidebarOverlay.classList.add('active');
            });

            const closeDrawer = () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            };

            btnCloseSidebar.addEventListener('click', closeDrawer);
            sidebarOverlay.addEventListener('click', closeDrawer);

            // 當使用者點選調色盤的顏色時，自動收合抽屜選單
            paletteContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('color-swatch')) {
                    setTimeout(closeDrawer, 180); // 延遲一下讓使用者有視覺點擊反饋
                }
            });
        }

        // 滑鼠與觸控事件
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('mouseleave', () => {
            canvasContainer.classList.remove('hover-paintable', 'hover-forbidden');
        });

        // 觸控支援
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCanvasClick(e.touches[0]);
        }, { passive: false });
    }

    // --- 取得點擊處對應在 Canvas 的座標 ---
    function getCanvasCoords(e) {
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = e.clientX || e.pageX;
        const clientY = e.clientY || e.pageY;
        
        const x = Math.floor((clientX - rect.left) * scaleX);
        const y = Math.floor((clientY - rect.top) * scaleY);
        
        return (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) ? { x, y } : null;
    }

    // --- 偵測游標下是否是可著色區域並更換滑鼠指針 ---
    function handleCanvasMouseMove(e) {
        const coords = getCanvasCoords(e);
        if (!coords || !originalImageData || !currentConfig) {
            canvasContainer.classList.remove('hover-paintable', 'hover-forbidden');
            return;
        }

        const { x, y } = coords;
        const idx = (y * canvas.width + x) * 4;
        const r = originalImageData.data[idx];
        const g = originalImageData.data[idx + 1];
        const b = originalImageData.data[idx + 2];
        const a = originalImageData.data[idx + 3];

        if (a === 0) {
            canvasContainer.classList.remove('hover-paintable');
            canvasContainer.classList.add('hover-forbidden');
            return;
        }

        // 檢查是否接近任何可著色區域的原始顏色
        let isPaintable = false;
        const zones = currentConfig.zones;
        for (let i = 0; i < zones.length; i++) {
            const orig = zones[i].originalColor;
            const diff = Math.abs(r - orig.r) + Math.abs(g - orig.g) + Math.abs(b - orig.b);
            if (diff < TOLERANCE) {
                isPaintable = true;
                break;
            }
        }

        if (isPaintable) {
            canvasContainer.classList.remove('hover-forbidden');
            canvasContainer.classList.add('hover-paintable');
        } else {
            canvasContainer.classList.remove('hover-paintable');
            canvasContainer.classList.add('hover-forbidden');
        }
    }

    // --- 處理著色點擊 ---
    function handleCanvasClick(e) {
        const coords = getCanvasCoords(e);
        if (!coords || !originalImageData || !currentConfig) return;

        const { x, y } = coords;
        const idx = (y * canvas.width + x) * 4;
        const r = originalImageData.data[idx];
        const g = originalImageData.data[idx + 1];
        const b = originalImageData.data[idx + 2];
        const a = originalImageData.data[idx + 3];

        if (a === 0) return; // 透明點

        // 尋找點擊處對應的可著色區塊
        const zones = currentConfig.zones;
        let matchedZone = null;
        let minDiff = Infinity;

        for (let i = 0; i < zones.length; i++) {
            const orig = zones[i].originalColor;
            const diff = Math.abs(r - orig.r) + Math.abs(g - orig.g) + Math.abs(b - orig.b);
            
            if (diff < TOLERANCE && diff < minDiff) {
                minDiff = diff;
                matchedZone = zones[i];
            }
        }

        // 如果點擊在可著色區塊上
        if (matchedZone) {
            const cur = matchedZone.currentColor;
            
            // 判斷該區塊是否已經上色（非預設白色即代表已上色）
            const isColored = cur.r !== 255 || cur.g !== 255 || cur.b !== 255;
            
            // 如果還沒上色，才允許上色
            if (!isColored) {
                // 實作獨佔顏色限制：若其他區塊目前使用了這個新選顏色，則讓它恢復為初始純白色！
                const zones = currentConfig.zones;
                zones.forEach(zone => {
                    if (zone.id !== matchedZone.id) {
                        if (zone.currentColor.r === selectedColor.r && 
                            zone.currentColor.g === selectedColor.g && 
                            zone.currentColor.b === selectedColor.b) {
                            
                            // 恢復為初始的純白色
                            zone.currentColor = { r: 255, g: 255, b: 255 };
                        }
                    }
                });
                
                matchedZone.currentColor = { ...selectedColor };
                saveState();
                render();
                syncStateToFirebase();
            }
        }
    }

    // 啟動
    init();
});
