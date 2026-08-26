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
    
    const connStatus = document.getElementById('conn-status');
    const zoneList = document.getElementById('zone-list');
    const zonesColorList = document.getElementById('zones-color-list');
    
    // 後台 UI 元素
    const secretTrigger = document.getElementById('secret-trigger');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdminBtn = document.getElementById('close-admin');
    const radioModes = document.querySelectorAll('input[name="displayMode"]');
    
    // 視圖層
    const viewSecret = document.getElementById('secret-mode-view');
    const viewImageSync = document.getElementById('image-sync-view');
    const viewColorSync = document.getElementById('color-sync-view');

    // 畫布同步元素
    const syncTitle = document.getElementById('sync-title');
    const syncCanvas = document.getElementById('sync-canvas');
    const syncCtx = syncCanvas.getContext('2d', { willReadFrequently: true });

    // 狀態
    let currentMode = "secret"; // 預設模式
    
    // --- 後台面板控制 ---
    secretTrigger.addEventListener('click', () => {
        adminPanel.classList.add('active');
    });
    
    closeAdminBtn.addEventListener('click', () => {
        adminPanel.classList.remove('active');
    });

    radioModes.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentMode = e.target.value;
            updateViewLayer();
        });
    });

    function updateViewLayer() {
        viewSecret.classList.remove('active');
        viewImageSync.classList.remove('active');
        viewColorSync.classList.remove('active');

        if (currentMode === "secret") viewSecret.classList.add('active');
        if (currentMode === "image_sync") viewImageSync.classList.add('active');
        if (currentMode === "color_sync") viewColorSync.classList.add('active');
    }

    // --- 繪圖相關狀態 ---
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
    const TOLERANCE = 80;
    let currentImageSrc = null;
    let originalImageData = null;
    let currentConfig = null;

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function loadImage(src, zonesState) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            let tempImgData;
            try {
                tempImgData = tempCtx.getImageData(0, 0, img.width, img.height);
            } catch (e) {
                // 降級方案
                syncCanvas.width = img.width;
                syncCanvas.height = img.height;
                syncCtx.clearRect(0, 0, syncCanvas.width, syncCanvas.height);
                syncCtx.drawImage(img, 0, 0);
                originalImageData = syncCtx.getImageData(0, 0, syncCanvas.width, syncCanvas.height);
                currentConfig = JSON.parse(JSON.stringify(IMAGE_CONFIGS[src]));
                applyZonesAndRender(zonesState);
                return;
            }
            
            const data = tempImgData.data;
            let minX = img.width, minY = img.height, maxX = 0, maxY = 0, found = false;
            for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                    const idx = (y * img.width + x) * 4;
                    const alpha = data[idx + 3];
                    if (alpha > 10) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        found = true;
                    }
                }
            }
            if (!found) { minX = 0; minY = 0; maxX = img.width; maxY = img.height; }
            
            const contentW = maxX - minX;
            const contentH = maxY - minY;
            const paddingW = contentW * 0.03;
            const paddingH = contentH * 0.03;
            const logicalW = contentW + paddingW * 2;
            const logicalH = contentH + paddingH * 2;
            const hiResScale = 1200 / Math.max(logicalW, logicalH);
            
            syncCanvas.width = logicalW * hiResScale;
            syncCanvas.height = logicalH * hiResScale;
            syncCtx.clearRect(0, 0, syncCanvas.width, syncCanvas.height);
            
            const drawW = contentW * hiResScale;
            const drawH = contentH * hiResScale;
            const dx = paddingW * hiResScale;
            const dy = paddingH * hiResScale;
            syncCtx.drawImage(img, minX, minY, contentW, contentH, dx, dy, drawW, drawH);
            
            originalImageData = syncCtx.getImageData(0, 0, syncCanvas.width, syncCanvas.height);
            currentConfig = JSON.parse(JSON.stringify(IMAGE_CONFIGS[src]));
            
            applyZonesAndRender(zonesState);
        };
        
        let resolvedSrc = src;
        if (src === "著色版_boy_0.png" && typeof BOY_IMAGE_BASE64 !== "undefined") {
            resolvedSrc = BOY_IMAGE_BASE64;
        } else if (src === "著色版_gril_0.png" && typeof GIRL_IMAGE_BASE64 !== "undefined") {
            resolvedSrc = GIRL_IMAGE_BASE64;
        }
        img.src = resolvedSrc;
    }

    function applyZonesAndRender(zonesState) {
        if (zonesState && currentConfig) {
            const zonesArray = Array.isArray(zonesState) ? zonesState : Object.values(zonesState);
            zonesArray.forEach(zs => {
                if (!zs) return;
                const zone = currentConfig.zones.find(z => z.id === zs.id);
                if (zone) {
                    zone.currentColor = hexToRgb(zs.currentColorHex);
                }
            });
        }
        render();
    }

    function render() {
        if (!originalImageData || !currentConfig) return;
        const width = syncCanvas.width;
        const height = syncCanvas.height;
        syncCtx.clearRect(0, 0, width, height);
        const outputImageData = syncCtx.getImageData(0, 0, width, height);
        
        const srcData = originalImageData.data;
        const dstData = outputImageData.data;
        const zones = currentConfig.zones;
        const len = srcData.length;
        
        for (let i = 0; i < len; i += 4) {
            const r_orig = srcData[i];
            const g_orig = srcData[i + 1];
            const b_orig = srcData[i + 2];
            const a_orig = srcData[i + 3];
            
            if (a_orig === 0) continue;
            
            dstData[i] = r_orig;
            dstData[i + 1] = g_orig;
            dstData[i + 2] = b_orig;
            dstData[i + 3] = a_orig;
            
            for (let j = 0; j < zones.length; j++) {
                const zone = zones[j];
                const orig = zone.originalColor;
                const diff = Math.abs(r_orig - orig.r) + Math.abs(g_orig - orig.g) + Math.abs(b_orig - orig.b);
                
                if (diff < TOLERANCE) {
                    const weight = 1.0 - (diff / TOLERANCE);
                    dstData[i] = Math.max(0, Math.min(255, Math.round(r_orig - weight * orig.r + weight * zone.currentColor.r)));
                    dstData[i + 1] = Math.max(0, Math.min(255, Math.round(g_orig - weight * orig.g + weight * zone.currentColor.g)));
                    dstData[i + 2] = Math.max(0, Math.min(255, Math.round(b_orig - weight * orig.b + weight * zone.currentColor.b)));
                    break;
                }
            }
        }
        syncCtx.putImageData(outputImageData, 0, 0);
    }

    // --- Firebase 連線與監聽 ---
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        connStatus.textContent = "🔴 錯誤：尚未設定 Firebase 金鑰！";
        connStatus.style.color = "#FF5E62";
        return;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();
    
    connStatus.textContent = "🟢 Firebase 連線成功，等待資料...";
    
    db.ref('magic_state').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // 1. 畫作與畫面同步
        let displayName = data.currentImage;
        if (data.currentImage === "著色版_boy_0.png") {
            displayName = "小男孩";
        } else if (data.currentImage === "著色版_gril_0.png") {
            displayName = "小女孩";
        }
        syncTitle.textContent = "目前畫作：" + displayName;

        if (data.currentImage !== currentImageSrc) {
            currentImageSrc = data.currentImage;
            loadImage(currentImageSrc, data.zones);
        } else {
            // 圖片沒變，直接更新顏色
            applyZonesAndRender(data.zones);
        }
        
        // 2. 隱密模式：單一顏色指示燈 (目前選取顏色)
        zoneList.innerHTML = '';
        const lightColor = data.selectedColorHex || "#000";
        const isOnClass = (lightColor === "#000") ? "" : "on";
        
        const li = document.createElement('li');
        li.className = 'zone-item';
        li.innerHTML = `
            <div class="color-preview ${isOnClass}" style="background-color: ${lightColor}; --light-color: ${lightColor};"></div>
        `;
        zoneList.appendChild(li);

        // 3. 著色同步模式：各區塊顏色狀態
        zonesColorList.innerHTML = '';
        if (data.zones) {
            const zonesArray = Array.isArray(data.zones) ? data.zones : Object.values(data.zones);
            if (zonesArray.length > 0) {
                zonesArray.forEach(zone => {
                    if (!zone) return;
                    const zLi = document.createElement('li');
                    zLi.className = 'zone-color-row';
                    zLi.innerHTML = `
                        <span>${zone.name}</span>
                        <div class="zone-color-box" style="background-color: ${zone.currentColorHex};"></div>
                    `;
                    zonesColorList.appendChild(zLi);
                });
            } else {
                zonesColorList.innerHTML = '<li class="zone-color-row">尚未取得各區塊資料</li>';
            }
        } else {
            zonesColorList.innerHTML = '<li class="zone-color-row">尚未取得各區塊資料</li>';
        }
    });

    // 儲存圖片按鈕事件
    const saveImageBtn = document.getElementById('save-image-btn');
    if (saveImageBtn) {
        saveImageBtn.addEventListener('click', () => {
            if (!syncCanvas || syncCanvas.width === 0) return;
            const link = document.createElement('a');
            link.download = 'magic_painting.png';
            link.href = syncCanvas.toDataURL('image/png');
            link.click();
        });
    }
});
