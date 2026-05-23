/* =========================================================
   Image Palette Extractor — app.js
   ========================================================= */
'use strict';

// ---------- i18n ----------
const translations = {
  vi: {
    appTitle: 'Palette Extractor',
    uploadTitle: 'Tải ảnh lên',
    uploadSubtitle: 'Kéo thả hoặc nhấp để chọn ảnh',
    uploadHint: 'Hỗ trợ JPG, PNG, WEBP, GIF, BMP',
    selectFile: 'Chọn tệp',
    changeImage: 'Đổi ảnh',
    orUseUrl: 'hoặc dùng URL',
    imageUrl: 'URL hình ảnh',
    load: 'Tải',
    colorCount: 'Số màu',
    algorithm: 'Thuật toán',
    kMeans: 'K-Means',
    medianCut: 'Median Cut',
    sortBy: 'Sắp xếp',
    sortLuminance: 'Độ sáng',
    sortFrequency: 'Tần suất',
    sortHue: 'Màu sắc',
    extract: 'Trích xuất',
    colorPalette: 'Bảng màu',
    imageAnalysis: 'Phân tích ảnh',
    dominantColors: 'Màu chủ đạo',
    dimensions: 'Kích thước',
    avgBrightness: 'Độ sáng TB',
    avgSaturation: 'Độ bão hòa TB',
    processing: 'Đang xử lý...',
    colorDetails: 'Chi tiết màu',
    close: 'Đóng',
    copied: 'Đã sao chép!',
    copiedAll: 'Đã sao chép tất cả màu!',
    exported: 'Đã xuất bảng màu!',
    errorLoad: 'Không thể tải ảnh từ URL này.',
    errorFile: 'Không thể đọc tệp này.',
    errorNoImage: 'Vui lòng tải ảnh trước.',
    extractDone: 'Trích xuất thành công!',
  },
  en: {
    appTitle: 'Palette Extractor',
    uploadTitle: 'Upload an image',
    uploadSubtitle: 'Drag & drop or click to select',
    uploadHint: 'Supports JPG, PNG, WEBP, GIF, BMP',
    selectFile: 'Select file',
    changeImage: 'Change image',
    orUseUrl: 'or use a URL',
    imageUrl: 'Image URL',
    load: 'Load',
    colorCount: 'Colors',
    algorithm: 'Algorithm',
    kMeans: 'K-Means',
    medianCut: 'Median Cut',
    sortBy: 'Sort by',
    sortLuminance: 'Brightness',
    sortFrequency: 'Frequency',
    sortHue: 'Hue',
    extract: 'Extract',
    colorPalette: 'Color Palette',
    imageAnalysis: 'Image Analysis',
    dominantColors: 'Dominant colors',
    dimensions: 'Dimensions',
    avgBrightness: 'Avg. Brightness',
    avgSaturation: 'Avg. Saturation',
    processing: 'Processing...',
    colorDetails: 'Color Details',
    close: 'Close',
    copied: 'Copied!',
    copiedAll: 'All colors copied!',
    exported: 'Palette exported!',
    errorLoad: 'Could not load image from this URL.',
    errorFile: 'Could not read this file.',
    errorNoImage: 'Please upload an image first.',
    extractDone: 'Extraction successful!',
  }
};

// ---------- State ----------
const state = {
  lang: 'vi',
  theme: 'system',
  colorCount: 8,
  algorithm: 'kmeans',
  sortBy: 'luminance',
  imageData: null,
  palette: [],
  imageEl: null,
};

// ---------- Preferences (localStorage) ----------
function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem('palette-prefs') || '{}');
    if (saved.lang) state.lang = saved.lang;
    if (saved.theme) state.theme = saved.theme;
    if (saved.colorCount) state.colorCount = saved.colorCount;
    if (saved.algorithm) state.algorithm = saved.algorithm;
    if (saved.sortBy) state.sortBy = saved.sortBy;
  } catch (e) {}
}

function savePrefs() {
  try {
    localStorage.setItem('palette-prefs', JSON.stringify({
      lang: state.lang,
      theme: state.theme,
      colorCount: state.colorCount,
      algorithm: state.algorithm,
      sortBy: state.sortBy,
    }));
  } catch (e) {}
}

// ---------- i18n Apply ----------
function applyI18n() {
  const t = translations[state.lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.documentElement.lang = state.lang;
}

function t(key) {
  return translations[state.lang][key] || key;
}

// ---------- Theme ----------
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const icon = document.getElementById('themeIcon');
  const icons = { light: 'light_mode', dark: 'dark_mode', system: 'brightness_auto' };
  if (icon) icon.textContent = icons[state.theme] || 'brightness_auto';

  // Update meta theme-color dynamically
  const isDark = state.theme === 'dark' ||
    (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')
    ? (document.querySelector('meta[name="theme-color"]').setAttribute('content', isDark ? '#0D47A1' : '#1565C0'))
    : null;
}

function cycleTheme() {
  const order = ['system', 'light', 'dark'];
  const idx = order.indexOf(state.theme);
  state.theme = order[(idx + 1) % order.length];
  applyTheme();
  savePrefs();
}

// ---------- Color Math ----------
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function getContrastColor(r, g, b) {
  return luminance(r, g, b) > 140 ? '#000000' : '#FFFFFF';
}

// ---------- Color Extraction ----------
function samplePixels(imageData, maxSamples = 10000) {
  const { data, width, height } = imageData;
  const total = width * height;
  const step = Math.max(1, Math.floor(total / maxSamples));
  const pixels = [];
  for (let i = 0; i < total; i += step) {
    const idx = i * 4;
    const a = data[idx + 3];
    if (a < 128) continue; // skip transparent
    pixels.push([data[idx], data[idx + 1], data[idx + 2]]);
  }
  return pixels;
}

function kMeans(pixels, k, iterations = 12) {
  if (pixels.length === 0) return [];
  // init: pick k random pixels as seeds
  let centroids = [];
  const used = new Set();
  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!used.has(idx)) { used.add(idx); centroids.push([...pixels[idx]]); }
  }

  let assignments = new Int32Array(pixels.length);
  for (let iter = 0; iter < iterations; iter++) {
    // assign
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      const [pr, pg, pb] = pixels[i];
      let best = 0, bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const [cr, cg, cb] = centroids[c];
        const d = (pr - cr) ** 2 + (pg - cg) ** 2 + (pb - cb) ** 2;
        if (d < bestDist) { bestDist = d; best = c; }
      }
      if (assignments[i] !== best) { assignments[i] = best; changed = true; }
    }
    if (!changed && iter > 0) break;
    // update centroids
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c][0] += pixels[i][0];
      sums[c][1] += pixels[i][1];
      sums[c][2] += pixels[i][2];
      sums[c][3]++;
    }
    centroids = sums.map(([r, g, b, n]) => n ? [r / n, g / n, b / n] : [0, 0, 0]);
  }
  // count frequencies
  const freq = new Int32Array(k);
  assignments.forEach(c => freq[c]++);
  return centroids.map(([r, g, b], i) => ({
    r: Math.round(r), g: Math.round(g), b: Math.round(b),
    count: freq[i],
    percent: Math.round(freq[i] / pixels.length * 100),
  }));
}

function medianCut(pixels, depth) {
  if (depth === 0 || pixels.length === 0) {
    const r = Math.round(pixels.reduce((a, p) => a + p[0], 0) / pixels.length);
    const g = Math.round(pixels.reduce((a, p) => a + p[1], 0) / pixels.length);
    const b = Math.round(pixels.reduce((a, p) => a + p[2], 0) / pixels.length);
    return [{ r, g, b, count: pixels.length, percent: 0 }];
  }
  const ranges = [0, 1, 2].map(ch => ({
    ch,
    range: Math.max(...pixels.map(p => p[ch])) - Math.min(...pixels.map(p => p[ch]))
  }));
  const { ch } = ranges.sort((a, b) => b.range - a.range)[0];
  pixels.sort((a, b) => a[ch] - b[ch]);
  const mid = Math.floor(pixels.length / 2);
  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

function extractPalette(imageData, count, algo) {
  const pixels = samplePixels(imageData);
  let colors;
  if (algo === 'kmeans') {
    colors = kMeans(pixels, count);
  } else {
    const depth = Math.ceil(Math.log2(count));
    colors = medianCut(pixels, depth).slice(0, count);
    const total = pixels.length;
    colors.forEach(c => { c.percent = Math.round(c.count / total * 100); });
  }
  return colors.filter(c => c.count > 0);
}

function sortColors(colors, by) {
  const sorted = [...colors];
  if (by === 'luminance') {
    sorted.sort((a, b) => luminance(b.r, b.g, b.b) - luminance(a.r, a.g, a.b));
  } else if (by === 'frequency') {
    sorted.sort((a, b) => b.count - a.count);
  } else if (by === 'hue') {
    sorted.sort((a, b) => {
      const ha = rgbToHsl(a.r, a.g, a.b).h;
      const hb = rgbToHsl(b.r, b.g, b.b).h;
      return ha - hb;
    });
  }
  return sorted;
}

// ---------- Image Statistics ----------
function analyzeImage(imageData) {
  const { data, width, height } = imageData;
  let totalL = 0, totalS = 0, count = 0;
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const hsl = rgbToHsl(r, g, b);
    totalL += hsl.l;
    totalS += hsl.s;
    count++;
  }
  return {
    width, height,
    avgBrightness: count ? Math.round(totalL / count) : 0,
    avgSaturation: count ? Math.round(totalS / count) : 0,
  };
}

// ---------- Render ----------
function renderPalette(colors) {
  const grid = document.getElementById('colorGrid');
  const bar = document.getElementById('gradientBar');
  grid.innerHTML = '';

  // Gradient bar
  const stops = colors.map((c, i) => {
    const pos = Math.round((i / (colors.length - 1)) * 100);
    return `${rgbToHex(c.r, c.g, c.b)} ${pos}%`;
  });
  bar.style.background = `linear-gradient(to right, ${stops.join(', ')})`;

  // Color chips
  colors.forEach((color, idx) => {
    const hex = rgbToHex(color.r, color.g, color.b);
    const rgb = `${color.r}, ${color.g}, ${color.b}`;
    const contrastColor = getContrastColor(color.r, color.g, color.b);

    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.style.animationDelay = `${idx * 0.04}s`;
    chip.innerHTML = `
      <div class="chip-swatch" style="background:${hex}">
        <button class="chip-copy-btn" data-hex="${hex}" title="Copy HEX" aria-label="Copy ${hex}" style="color:${contrastColor}">
          <span class="material-symbols-rounded">content_copy</span>
        </button>
      </div>
      <div class="chip-info">
        <div class="chip-hex">${hex}</div>
        <div class="chip-rgb">rgb(${rgb})</div>
        <div class="chip-percent">${color.percent || 0}%</div>
      </div>
    `;

    chip.addEventListener('click', (e) => {
      if (e.target.closest('.chip-copy-btn')) {
        copyToClipboard(hex);
        showSnackbar(t('copied'), 'check_circle');
        return;
      }
      openColorDialog(color, hex);
    });

    grid.appendChild(chip);
  });
}

function openColorDialog(color, hex) {
  const { r, g, b } = color;
  const hsl = rgbToHsl(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`;
  const cmykStr = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

  document.getElementById('dialogSwatch').style.background = hex;
  document.getElementById('dialogHex').textContent = hex;
  document.getElementById('dialogRgb').textContent = rgb;
  document.getElementById('dialogHsl').textContent = hslStr;
  document.getElementById('dialogCmyk').textContent = cmykStr;

  const dialog = document.getElementById('colorDialog');
  dialog.classList.remove('hidden');

  // copy buttons inside dialog
  dialog.querySelectorAll('[data-copy]').forEach(btn => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-copy');
      const vals = { hex, rgb, hsl: hslStr, cmyk: cmykStr };
      copyToClipboard(vals[type]);
      showSnackbar(t('copied'), 'check_circle');
    };
  });
}

// ---------- Export ----------
function exportPalette(format) {
  const colors = state.palette;
  if (!colors.length) return;
  let content = '', filename = '', mime = 'text/plain';

  if (format === 'css') {
    content = ':root {\n' + colors.map((c, i) => `  --color-${i + 1}: ${rgbToHex(c.r, c.g, c.b)};`).join('\n') + '\n}';
    filename = 'palette.css'; mime = 'text/css';
  } else if (format === 'scss') {
    content = colors.map((c, i) => `$color-${i + 1}: ${rgbToHex(c.r, c.g, c.b)};`).join('\n');
    filename = 'palette.scss'; mime = 'text/x-scss';
  } else if (format === 'json') {
    const data = colors.map(c => {
      const hex = rgbToHex(c.r, c.g, c.b);
      const hsl = rgbToHsl(c.r, c.g, c.b);
      return { hex, rgb: { r: c.r, g: c.g, b: c.b }, hsl, percent: c.percent };
    });
    content = JSON.stringify(data, null, 2);
    filename = 'palette.json'; mime = 'application/json';
  } else if (format === 'txt') {
    content = colors.map(c => rgbToHex(c.r, c.g, c.b)).join('\n');
    filename = 'palette.txt';
  } else if (format === 'png') {
    exportPng(colors);
    return;
  }

  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  showSnackbar(t('exported'), 'download');
}

function exportPng(colors) {
  const swatchW = 160, swatchH = 80, padding = 16;
  const cols = Math.min(colors.length, 4);
  const rows = Math.ceil(colors.length / cols);
  const w = cols * swatchW + (cols + 1) * padding;
  const h = rows * (swatchH + 32) + (rows + 1) * padding + 32;

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Color Palette', padding, padding + 20);

  colors.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (swatchW + padding);
    const y = 32 + padding + row * (swatchH + 32 + padding);
    const hex = rgbToHex(c.r, c.g, c.b);

    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.roundRect(x, y, swatchW, swatchH, 12);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(hex, x + 8, y + swatchH + 18);

    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.fillText(`rgb(${c.r}, ${c.g}, ${c.b})`, x + 8, y + swatchH + 30);
  });

  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'palette.png';
    a.click();
    showSnackbar(t('exported'), 'download');
  });
}

// ---------- Clipboard ----------
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

// ---------- Snackbar ----------
let snackTimer;
function showSnackbar(msg, icon = 'info') {
  const bar = document.getElementById('snackbar');
  const msgEl = document.getElementById('snackbarMessage');
  const iconEl = document.getElementById('snackbarIcon');
  msgEl.textContent = msg;
  iconEl.textContent = icon;
  bar.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => bar.classList.remove('show'), 2800);
}

// ---------- Image Loading ----------
function loadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => loadImageSrc(e.target.result);
  reader.onerror = () => showSnackbar(t('errorFile'), 'error');
  reader.readAsDataURL(file);
}

function loadImageSrc(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    state.imageEl = img;
    document.getElementById('previewImg').src = src;
    document.getElementById('analysisImg').src = src;
    document.getElementById('uploadPrompt').classList.add('hidden');
    document.getElementById('imagePreviewWrap').classList.remove('hidden');
    document.getElementById('extractBtn').disabled = false;
    // Auto-extract
    runExtraction(img);
  };
  img.onerror = () => showSnackbar(t('errorLoad'), 'error');
  img.src = src;
}

function getImageData(img) {
  const canvas = document.getElementById('hiddenCanvas');
  const maxSize = 400;
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { imageData: ctx.getImageData(0, 0, canvas.width, canvas.height), width: img.naturalWidth, height: img.naturalHeight };
}

function runExtraction(img) {
  document.getElementById('processingOverlay').classList.remove('hidden');

  setTimeout(() => {
    try {
      const { imageData, width, height } = getImageData(img);
      const raw = extractPalette(imageData, state.colorCount, state.algorithm);
      const sorted = sortColors(raw, state.sortBy);
      state.palette = sorted;
      state.imageData = imageData;

      renderPalette(sorted);

      // stats
      const stats = analyzeImage(imageData);
      document.getElementById('statColors').textContent = sorted.length;
      document.getElementById('statDimensions').textContent = `${width} × ${height}`;
      document.getElementById('statBrightness').textContent = `${stats.avgBrightness}%`;
      document.getElementById('statSaturation').textContent = `${stats.avgSaturation}%`;

      document.getElementById('resultsSection').classList.remove('hidden');
      showSnackbar(t('extractDone'), 'check_circle');
    } catch (e) {
      showSnackbar(t('errorLoad'), 'error');
    } finally {
      document.getElementById('processingOverlay').classList.add('hidden');
    }
  }, 60);
}

// ---------- DOM Init ----------
document.addEventListener('DOMContentLoaded', () => {
  loadPrefs();
  applyTheme();
  applyI18n();
  syncSettingsUI();

  // Scroll elevation
  const appBar = document.getElementById('topAppBar');
  window.addEventListener('scroll', () => {
    appBar.classList.toggle('elevated', window.scrollY > 4);
  }, { passive: true });

  // Theme button
  document.getElementById('themeBtn').addEventListener('click', cycleTheme);

  // Language toggle
  document.getElementById('langBtn').addEventListener('click', () => {
    state.lang = state.lang === 'vi' ? 'en' : 'vi';
    savePrefs();
    applyI18n();
  });

  // File input
  const fileInput = document.getElementById('fileInput');
  document.getElementById('selectFileBtn').addEventListener('click', e => {
    e.stopPropagation();
    fileInput.click();
  });
  document.getElementById('changeImageBtn').addEventListener('click', e => {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) loadImageFile(e.target.files[0]);
    e.target.value = '';
  });

  // Drop zone
  const dropZone = document.getElementById('dropZone');
  dropZone.addEventListener('click', e => {
    if (!e.target.closest('button')) fileInput.click();
  });
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', e => { if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('dragover'); });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) loadImageFile(file);
  });

  // URL load
  document.getElementById('loadUrlBtn').addEventListener('click', () => {
    const url = document.getElementById('urlInput').value.trim();
    if (url) loadImageSrc(url);
  });
  document.getElementById('urlInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('loadUrlBtn').click();
  });

  // Color count stepper
  document.getElementById('decreaseColors').addEventListener('click', () => {
    if (state.colorCount > 2) { state.colorCount--; updateColorCount(); }
  });
  document.getElementById('increaseColors').addEventListener('click', () => {
    if (state.colorCount < 20) { state.colorCount++; updateColorCount(); }
  });

  // Algorithm segmented buttons
  document.querySelectorAll('[data-algo]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-algo]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.algorithm = btn.getAttribute('data-algo');
      savePrefs();
    });
  });

  // Sort segmented buttons
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.sortBy = btn.getAttribute('data-sort');
      savePrefs();
      if (state.palette.length) {
        state.palette = sortColors(state.palette, state.sortBy);
        renderPalette(state.palette);
      }
    });
  });

  // Extract button
  document.getElementById('extractBtn').addEventListener('click', () => {
    if (!state.imageEl) { showSnackbar(t('errorNoImage'), 'error'); return; }
    runExtraction(state.imageEl);
  });

  // Copy all
  document.getElementById('copyAllBtn').addEventListener('click', () => {
    if (!state.palette.length) return;
    const text = state.palette.map(c => rgbToHex(c.r, c.g, c.b)).join('\n');
    copyToClipboard(text);
    showSnackbar(t('copiedAll'), 'check_circle');
  });

  // Export menu
  const exportBtn = document.getElementById('exportBtn');
  const exportMenu = document.getElementById('exportMenu');
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('hidden');
  });
  exportMenu.querySelectorAll('[data-export]').forEach(item => {
    item.addEventListener('click', () => {
      const fmt = item.getAttribute('data-export');
      exportPalette(fmt);
      exportMenu.classList.add('hidden');
    });
  });
  document.addEventListener('click', () => exportMenu.classList.add('hidden'));

  // Color dialog close
  document.getElementById('dialogClose').addEventListener('click', () => {
    document.getElementById('colorDialog').classList.add('hidden');
  });
  document.getElementById('colorDialog').addEventListener('click', e => {
    if (e.target === document.getElementById('colorDialog')) {
      document.getElementById('colorDialog').classList.add('hidden');
    }
  });

  // Paste image from clipboard
  document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) { loadImageFile(file); break; }
      }
    }
  });

  // System theme change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'system') applyTheme();
  });
});

function updateColorCount() {
  document.getElementById('colorCountDisplay').textContent = state.colorCount;
  savePrefs();
}

function syncSettingsUI() {
  document.getElementById('colorCountDisplay').textContent = state.colorCount;

  document.querySelectorAll('[data-algo]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-algo') === state.algorithm);
  });

  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sort') === state.sortBy);
  });
}

// ---------- Service Worker Registration ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
