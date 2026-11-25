import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * =========================================================================
 *  Blender 外部 .glb 模型預留替換設定表（Model Config & GLTF Slot Registry）
 * =========================================================================
 *  目前所有模型皆以 Three.js 基礎幾何體 + MeshToonMaterial 賽璐璐描邊手工組裝。
 *  日後若您從 Blender 匯出 .glb 模型，只需將檔案放入 assets/models/，
 *  並將下方對應鍵值從 null 改為檔案路徑（例如 'assets/models/tea-bush.glb'），
 *  本模組會透過 GLTFLoader 自動載入，並套用相同的繪本賽璐璐色階與描邊輪廓。
 */
const GLB_MODEL_PATHS = {
  teaBush: null,
  teaBud: null,
  canopyRack: null,
  rotaryDrum: null,
  rollingMachine: null,
  roastingBasket: null,
  teaTray: null
};

/**
 * =========================================================================
 *  外部實錄製茶音效替換設定表（Audio Clip Slot Registry）
 * =========================================================================
 *  目前所有音效皆透過 Web Audio API 即時合成，隨手勢速度與溫度即時變化。
 *  日後若您有茶園／茶廠實地錄音檔（.mp3 / .wav），只需放入 assets/audio/
 *  並將下方對應鍵值從 null 改為路徑（例如 'assets/audio/drum-tumble.mp3'），
 *  引擎即會自動載入替換預設擬音。
 */
const AUDIO_CLIP_PATHS = {
  pluckSnap: null,     // e.g. 'assets/audio/pluck-snap.mp3'
  basketRustle: null,  // e.g. 'assets/audio/basket-rustle.mp3'
  tarpRustle: null,    // e.g. 'assets/audio/tarp-rustle.mp3'
  drumTumble: null,    // e.g. 'assets/audio/drum-tumble.mp3'
  clothKnead: null,    // e.g. 'assets/audio/cloth-knead.mp3'
  charcoalRoast: null, // e.g. 'assets/audio/charcoal-roast.mp3'
  teaPour: null        // e.g. 'assets/audio/tea-pour.mp3'
};

/**
 * 貼近台灣杉林溪 / 鹿谷茶廠真實製程的 5 道製茶工序 + 品茗結局
 */
const STEPS = [
  {
    id: 'pluck',
    shortTitle: '採菁',
    badge: '工序 壹 · 茶園手工採菁',
    prompt: '點擊茶樹壟頂端鮮綠亮眼的「一心二葉」嫩芽（共 5 株）採進竹簍，老葉留在枝頭繼續養護喔！',
    assistLabel: '輔助採摘一株',
    meterLabel: '採菁進度',
    knowledgeTitle: '01 · 採菁 — 離枝留嫩，只取一心二葉',
    knowledgeBody: '海拔 1,600 公尺杉林溪茶區清晨露水退去後，沿著修剪整齊的弧形茶樹壟頂冠採下頂端「一心二葉」鮮嫩茶梢，保留完整葉脈與果膠質。',
    knowledgeEffect: '只取鮮嫩芽葉不混老梗老葉，茶湯才能維持清澈透亮、喝起來甘醇不苦澀。'
  },
  {
    id: 'wither',
    shortTitle: '遮雨棚萎凋',
    badge: '工序 貳 · 遮雨棚拉網萎凋',
    prompt: '左右來回拖曳畫面，拉動遮雨黑網下的「萎凋棚布」左右擺盪翻動茶菁，讓水分均勻走水並喚醒蘭花香！',
    assistLabel: '輔助拉棚擺盪一次',
    meterLabel: '遮雨棚走水進度',
    knowledgeTitle: '02 · 遮雨棚萎凋 — 拉動棚布擺盪，讓茶菁均勻走水',
    knowledgeBody: '台灣山區氣候多變，室外萎凋場上方架設防雨浪板與黑色遮陽網避免烈日曬傷或午後驟雨；師傅們兩人對拉萎凋棚布左右擺盪翻茶，讓葉緣輕微摩擦走水並啟動輕發酵。',
    knowledgeEffect: '水分由葉梗均勻散失，沖泡後香氣高揚清雅，不會悶臭或帶生青水味。'
  },
  {
    id: 'panfire',
    shortTitle: '滾筒炒菁',
    badge: '工序 參 · 滾筒高溫炒菁',
    prompt: '左右滑動或點擊滾筒，加速不鏽鋼滾筒旋轉並讓茶菁在內壁導葉間翻轉滾落，將火力保持在綠色黃金殺菁區！',
    assistLabel: '輔助旋轉滾筒一次',
    meterLabel: '滾筒殺菁進度',
    knowledgeTitle: '03 · 滾筒炒菁 — 旋轉翻落止酵，高溫鎖住鮮甜果膠',
    knowledgeBody: '茶菁進入 260°C～300°C 的橫置不鏽鋼滾筒式炒菁機，順著旋轉筒壁與內壁導葉被帶上高處再瀑布般翻落，瞬間破壞氧化酶停止發酵、散出草菁味。',
    knowledgeEffect: '決定高山烏龍「青不青、甜不甜」的關鍵分水嶺，鎖住天然清花香。'
  },
  {
    id: 'roll',
    shortTitle: '布球團揉',
    badge: '工序 肆 · 平揉機布球團揉',
    prompt: '在畫布上「畫圈轉動」帶動平揉機曲柄壓揉白色棉布茶球！觀察右側竹箕裡的茶條如何一步步縮成飽滿半球形顆粒。',
    assistLabel: '輔助平揉一圈',
    meterLabel: '團揉緊結度',
    knowledgeTitle: '04 · 布球團揉 — 反覆包布壓揉與解塊，塑出半球形顆粒',
    knowledgeBody: '將初乾後的茶葉緊緊包入棉布束成布球，放上有放射狀稜條的平揉機盤面旋轉壓揉，並反覆「解塊散熱 → 復炒 → 再包布揉捻」，將鬆散條索塑形為緊結半球形茶粒。',
    knowledgeEffect: '顆粒愈飽滿緊實，熱水沖下才會逐泡慢慢舒展，連泡六至八泡依然厚實有喉韻。'
  },
  {
    id: 'roast',
    shortTitle: '焙籠乾燥',
    badge: '工序 伍 · 竹篾焙籠乾燥焙火',
    prompt: '長按「長按文火焙茶」按鈕（或長按畫布）控火乾燥！停在 60%~78% 可取輕焙清香，烘至 79%~92% 則得熟香熟果韻（過頭會微焦喔）。',
    assistLabel: '一鍵穩火烘乾',
    meterLabel: '焙火與乾燥度',
    knowledgeTitle: '05 · 焙籠乾燥 — 竹籠文火慢烘，決定春冬清香或熟香韻',
    knowledgeBody: '覆於傳統細編竹篾焙籠上以文火慢烘降低含水量至 4% 以下；輕焙守住杉林溪的清雅蘭花香，中度慢焙則醇化為不傷胃、帶有熟果蜜香的熟香烏龍。',
    knowledgeEffect: '出焙火候直接決定茶湯色澤是由蜜綠金黃轉為琥珀橙金，以及整體甘潤度。'
  },
  {
    id: 'finale',
    shortTitle: '品茗完成',
    badge: '完成品茗 · 工夫茶席上桌',
    prompt: '左右拖曳茶席可細看茶湯色澤、茶乾與紫砂壺；亦可隨時點選上方任一工序重玩或切換看兩種焙度湯色！',
    assistLabel: '切換看另一種湯色',
    meterLabel: '製茶工藝展示',
    knowledgeTitle: '品茗時刻 — 喝之前，您已走完每一道茶廠真實工序',
    knowledgeBody: '從杉林溪茶樹壟上的一心二葉、遮雨黑網棚布走水、滾筒高溫殺菁、平揉機包布團揉到焙籠收乾，每一泡好茶都是師傅經驗與時間的累積。',
    knowledgeEffect: '歡迎預約來德億茶莊鹿谷門市坐下喝杯熱茶，或直接點右側連結帶入詢價表單。'
  }
];

/**
 * 雙結局資料設定（嚴格對齊 PRODUCT.md，絕不捏造價格或認證）
 */
const FINALE_OUTCOMES = {
  light: {
    title: '杉林溪清香高山烏龍 · 輕焙完成',
    pillText: '湯色：蜜綠金黃',
    dotClass: 'is-light',
    liquorHex: 0xd8c958,
    desc: '您選擇在輕焙清香區出焙，茶葉完整保留天然高山蘭花香與果膠鮮甜，茶湯蜜綠金黃透亮、入口清雅回甘。',
    recommendTitle: '杉林溪高山烏龍 · 當季春茶／嚴選冬茶',
    recommendTail: '（四兩 150g 真空裝）',
    ctaText: '預約試茶／詢價清香春茶 ↗',
    ctaHref: 'index.html?tea=spring#contact'
  },
  roasted: {
    title: '杉林溪熟香熟火烏龍 · 慢焙完成',
    pillText: '湯色：琥珀橙金',
    dotClass: 'is-roasted',
    liquorHex: 0xc4762a,
    desc: '您以耐心慢火焙至中度熟香區，轉化出溫潤堅果蜜香與熟果甘甜喉韻，茶湯琥珀橙金、醇厚順口不苦澀。',
    recommendTitle: '杉林溪 · 熟香熟火烏龍',
    recommendTail: '（四兩 150g 真空裝）',
    ctaText: '預約試茶／詢價熟香烏龍 ↗',
    ctaHref: 'index.html?tea=roasted#contact'
  }
};

function createToonGradientMap() {
  const levels = new Uint8Array([92, 152, 212, 255]);
  const tex = new THREE.DataTexture(levels, levels.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 細編台灣傳統竹篾紋理（取代大格棋盤感，用於竹簍、解塊竹箕、焙籠）
 */
function createFineBambooStripTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c89b63';
  ctx.fillRect(0, 0, 256, 256);

  const rowH = 8;
  const colW = 24;
  for (let y = 0; y < 256; y += rowH) {
    const rowIdx = Math.floor(y / rowH);
    const tone = rowIdx % 3 === 0 ? '#dfb984' : rowIdx % 2 === 0 ? '#cda067' : '#bf8d52';
    ctx.fillStyle = tone;
    ctx.fillRect(0, y, 256, rowH - 1);

    // Horizontal bamboo seam
    ctx.fillStyle = '#7e5328';
    ctx.fillRect(0, y + rowH - 1, 256, 1);

    // Over-under woven cross strips
    for (let x = (rowIdx % 2) * 12; x < 256; x += colW) {
      ctx.fillStyle = 'rgba(246, 224, 185, 0.25)';
      ctx.fillRect(x, y + 1, 10, rowH - 2);
      ctx.fillStyle = 'rgba(110, 68, 28, 0.35)';
      ctx.fillRect(x + 11, y, 2, rowH);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 程式繪製台灣高山茶葉脈紋理（主葉脈 + 羽狀側脈 + 鋸齒葉緣感）
 */
function createTeaLeafVeinTexture(baseColor = '#ffffff', midribColor = '#eef7dc', veinColor = 'rgba(235, 246, 210, 0.42)') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 256);

  // Left half slightly darker than right half for crisp midrib fold contrast
  ctx.fillStyle = 'rgba(12, 34, 20, 0.08)';
  ctx.fillRect(0, 0, 64, 256);

  // Lateral pinnate veins curving toward leaf tip
  ctx.strokeStyle = veinColor;
  ctx.lineCap = 'round';
  for (let i = 1; i <= 7; i++) {
    const startY = 232 - i * 28;
    const tipY = Math.max(18, startY - 34);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(64, startY);
    ctx.quadraticCurveTo(38, startY - 12, 14, tipY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(64, startY);
    ctx.quadraticCurveTo(90, startY - 12, 114, tipY);
    ctx.stroke();
  }

  // Tapered central midrib
  const grad = ctx.createLinearGradient(64, 256, 64, 6);
  grad.addColorStop(0, midribColor);
  grad.addColorStop(1, 'rgba(238, 247, 220, 0.35)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(64, 254);
  ctx.lineTo(64, 12);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * 台灣室外遮雨棚透氣萎凋網布紋理
 */
function createTarpWeaveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#334f44';
  ctx.fillRect(0, 0, 256, 256);

  // Breathable mesh grid
  for (let i = 0; i < 256; i += 8) {
    ctx.fillStyle = i % 16 === 0 ? 'rgba(216, 232, 220, 0.14)' : 'rgba(18, 30, 26, 0.25)';
    ctx.fillRect(i, 0, 2, 256);
    ctx.fillRect(0, i, 256, 2);
  }

  // Reinforcement canvas border bands along left & right pull edges
  ctx.fillStyle = '#d7cdb9';
  ctx.fillRect(0, 0, 18, 256);
  ctx.fillRect(238, 0, 18, 256);
  ctx.fillStyle = '#c8834b';
  ctx.fillRect(18, 0, 5, 256);
  ctx.fillRect(233, 0, 5, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 黑色遮陽網紋理（Step 2 遮雨棚下方遮陰網）
 */
function createShadeNetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = '#0e161a';
  for (let i = 0; i < 128; i += 10) {
    ctx.fillRect(i, 0, 5, 128);
    ctx.fillRect(0, i, 128, 3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(9, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 刷絲不鏽鋼金屬紋理（Step 3 滾筒炒菁機）
 */
function createSteelBrushedTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b4c0c5';
  ctx.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(40,56,64,0.12)';
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 建立具真實披針橢圓輪廓、V 型主脈折角、鋸齒葉緣與自然下彎弧度的茶樹葉幾何體
 * 葉柄位於 (0,0,0)，葉尖朝 +Z 延伸
 */
function createCurvedTeaLeafGeometry(length = 0.42, width = 0.19, fold = 0.036, arch = 0.085) {
  const segX = 8;
  const segZ = 12;
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iz = 0; iz <= segZ; iz++) {
    const v = iz / segZ; // 0 (base) -> 1 (tip)
    // Elliptic-lanceolate silhouette of Camellia sinensis
    const envelope = Math.pow(Math.sin(v * Math.PI), 0.76);
    const tipTaper = v > 0.78 ? 1 - Math.pow((v - 0.78) / 0.22, 1.4) * 0.25 : 1;
    // Fine serrated tea leaf teeth along outer margin
    const serr = 1 + 0.065 * Math.sin(v * Math.PI * 14);
    const halfW = (width * 0.5) * envelope * tipTaper * serr;

    for (let ix = 0; ix <= segX; ix++) {
      const u = ix / segX - 0.5; // -0.5 -> +0.5
      const x = u * 2 * halfW;
      const z = v * length;
      // V-shaped midrib crease + gentle transverse cup + natural downward droop along blade
      const y = Math.abs(u) * 2 * fold * envelope - arch * Math.pow(v, 1.75) + Math.sin(v * Math.PI) * 0.014;
      positions.push(x, y, z);
      uvs.push(ix / segX, 1 - v);
    }
  }

  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * (segX + 1) + ix;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 捲合嫩芽心（一心二葉頂端未展開的針狀芽苞）
 */
function createBudTipGeometry() {
  const geo = new THREE.ConeGeometry(0.036, 0.26, 7);
  geo.translate(0, 0.13, 0);
  geo.scale(0.85, 1, 1.15);
  return geo;
}

function addToonOutline(mesh, scale = 1.045, outlineColor = 0x162d38) {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: outlineColor,
    side: THREE.BackSide
  });
  const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
  outlineMesh.scale.setScalar(scale);
  outlineMesh.userData.isOutline = true;
  mesh.add(outlineMesh);
  return outlineMesh;
}

function applyToonStyleToGltf(root, gradientMap, outlineColor = 0x162d38) {
  root.traverse((child) => {
    if (!child.isMesh || child.userData.isOutline) return;
    const oldMat = child.material;
    const baseColor = (oldMat && oldMat.color) ? oldMat.color.clone() : new THREE.Color(0x6da65d);
    child.material = new THREE.MeshToonMaterial({
      color: baseColor,
      gradientMap
    });
    child.castShadow = true;
    child.receiveShadow = true;
    addToonOutline(child, 1.035, outlineColor);
  });
  return root;
}

/**
 * 原生 Web Audio API 即時製茶擬音引擎
 * - 零外部網路請求，嚴格遵守純靜態與無 unsafe-inline CSP
 * - 支援外部實錄音檔槽（AUDIO_CLIP_PATHS）與隨手勢速度調變之即時合成
 */
class TeaSoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.whiteNoiseBuffer = null;
    this.pinkNoiseBuffer = null;
    this.customBuffers = {};
    this.loops = null;
  }

  isReady() {
    return Boolean(this.ctx && this.ctx.state !== 'closed');
  }

  setEnabled(flag) {
    this.enabled = Boolean(flag);
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      if (!this.enabled) {
        this.muteAllContinuous();
      }
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.85 : 0, now, 0.03);
    } catch {
      // Safe fallback
    }
  }

  unlock() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.setupMasterAndLoops();
        this.preloadExternalClips();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      this.ctx = null;
    }
  }

  setupMasterAndLoops() {
    const ctx = this.ctx;
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    this.compressor.knee.setValueAtTime(14, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, ctx.currentTime);

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.enabled ? 0.85 : 0, ctx.currentTime);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // Pre-generate 2s loopable white & pink noise buffers
    const length = ctx.sampleRate * 2;
    this.whiteNoiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    this.pinkNoiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const whiteData = this.whiteNoiseBuffer.getChannelData(0);
    const pinkData = this.pinkNoiseBuffer.getChannelData(0);

    let b0 = 0; let b1 = 0; let b2 = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      whiteData[i] = w;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      pinkData[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + w * 0.1848) * 0.14));
    }

    // Helper to spin up persistent silent filtered noise loops
    const makeNoiseLoop = (buffer, filterType, freq, q = 1.0) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.Q.setValueAtTime(q, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);
      src.start();
      return { src, filter, gain };
    };

    this.loops = {
      tarpWind: makeNoiseLoop(this.pinkNoiseBuffer, 'lowpass', 260, 0.9),
      leafRustle: makeNoiseLoop(this.whiteNoiseBuffer, 'bandpass', 2250, 1.4),
      drumHearth: makeNoiseLoop(this.pinkNoiseBuffer, 'lowpass', 180, 1.1),
      sizzle: makeNoiseLoop(this.whiteNoiseBuffer, 'highpass', 4200, 0.8),
      clothKnead: makeNoiseLoop(this.pinkNoiseBuffer, 'bandpass', 520, 1.6)
    };
  }

  preloadExternalClips() {
    if (!this.ctx) return;
    Object.entries(AUDIO_CLIP_PATHS).forEach(([slot, path]) => {
      if (!path) return;
      fetch(path)
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .then((buf) => (buf ? this.ctx.decodeAudioData(buf) : null))
        .then((decoded) => {
          if (decoded) this.customBuffers[slot] = decoded;
        })
        .catch(() => {});
    });
  }

  playCustomSlot(slot, volume = 0.7) {
    if (!this.enabled || !this.ctx || !this.customBuffers[slot]) return false;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.customBuffers[slot];
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(volume, this.ctx.currentTime);
      src.connect(g);
      g.connect(this.compressor);
      src.start();
      return true;
    } catch {
      return false;
    }
  }

  playFilteredBurst(buffer, { filterType, freq, q = 1.2, duration = 0.14, gain = 0.3, attack = 0.006, delay = 0 }) {
    if (!this.enabled || !this.ctx || !buffer) return;
    try {
      const now = this.ctx.currentTime + delay;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(q, now);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(gain, now + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(g);
      g.connect(this.compressor);
      src.start(now, Math.random() * 0.9, duration + 0.03);
    } catch {
      // Safe fallback
    }
  }

  playTone({ type = 'sine', startFreq, endFreq, duration = 0.08, gain = 0.16, delay = 0 }) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, now);
      if (endFreq && endFreq !== startFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(g);
      g.connect(this.compressor);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Safe fallback
    }
  }

  // 01 採菁：清脆嫩莖折斷聲
  playPluckSnap() {
    if (this.playCustomSlot('pluckSnap', 0.7)) return;
    this.playFilteredBurst(this.whiteNoiseBuffer, {
      filterType: 'bandpass',
      freq: 2900,
      q: 2.2,
      duration: 0.055,
      gain: 0.28,
      attack: 0.003
    });
    this.playTone({ type: 'triangle', startFreq: 740, endFreq: 260, duration: 0.05, gain: 0.14 });
  }

  // 01 採菁：嫩芽落入竹簍竹編輕擦聲
  playBasketRustle() {
    if (this.playCustomSlot('basketRustle', 0.65)) return;
    this.playFilteredBurst(this.whiteNoiseBuffer, {
      filterType: 'bandpass',
      freq: 2150,
      q: 1.7,
      duration: 0.16,
      gain: 0.22
    });
    this.playTone({ type: 'sine', startFreq: 220, endFreq: 135, duration: 0.07, gain: 0.10 });
  }

  // 01 採菁：誤觸老葉低悶枝葉聲
  playOldLeafBrush() {
    this.playFilteredBurst(this.pinkNoiseBuffer, {
      filterType: 'bandpass',
      freq: 620,
      q: 1.2,
      duration: 0.14,
      gain: 0.26
    });
    this.playTone({ type: 'sine', startFreq: 165, endFreq: 105, duration: 0.11, gain: 0.12 });
  }

  // 05 焙籠：文火微炭火劈啪聲
  playEmberCrackle() {
    if (!this.enabled || !this.ctx || !this.whiteNoiseBuffer) return;
    this.playFilteredBurst(this.whiteNoiseBuffer, {
      filterType: 'bandpass',
      freq: 3600 + Math.random() * 1800,
      q: 3.4,
      duration: 0.026,
      gain: 0.07 + Math.random() * 0.06,
      attack: 0.002
    });
  }

  // 05 焙籠：進入輕焙／熟香甜區溫潤提示泛音
  playSweetspotChime(isDeep = false) {
    const f1 = isDeep ? 660 : 528;
    const f2 = isDeep ? 990 : 792;
    this.playTone({ type: 'sine', startFreq: f1, endFreq: f1, duration: 0.26, gain: 0.12 });
    this.playTone({ type: 'sine', startFreq: f2, endFreq: f2, duration: 0.30, gain: 0.08, delay: 0.06 });
  }

  // 05 焙籠：焙過頭微焦警示音
  playScorchWarn() {
    this.playTone({ type: 'triangle', startFreq: 340, endFreq: 190, duration: 0.19, gain: 0.16 });
  }

  // 06 品茗：熱茶注入白瓷品茗杯清泉水聲
  playTeaPour() {
    if (this.playCustomSlot('teaPour', 0.7)) return;
    if (!this.enabled || !this.ctx || !this.whiteNoiseBuffer) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 0.92;
      const src = this.ctx.createBufferSource();
      src.buffer = this.whiteNoiseBuffer;
      src.loop = true;

      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.setValueAtTime(3.2, now);
      bp.frequency.setValueAtTime(640, now);
      bp.frequency.exponentialRampToValueAtTime(1480, now + dur * 0.85);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.24, now + 0.08);
      g.gain.setValueAtTime(0.22, now + dur * 0.72);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      src.connect(bp);
      bp.connect(g);
      g.connect(this.compressor);
      src.start(now);
      src.stop(now + dur + 0.03);
    } catch {
      // Safe fallback
    }
  }

  muteAllContinuous() {
    if (!this.ctx || !this.loops) return;
    try {
      const now = this.ctx.currentTime;
      Object.values(this.loops).forEach((l) => {
        l.gain.gain.setTargetAtTime(0, now, 0.04);
      });
    } catch {
      // Safe fallback
    }
  }

  updateContinuous(stepId, params = {}) {
    if (!this.ctx || !this.loops) return;
    if (!this.enabled) {
      this.muteAllContinuous();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      let tarpWind = 0;
      let tarpWindFreq = 260;
      let leafRustle = 0;
      let leafFreq = 2250;
      let drumHearth = 0;
      let drumFreq = 180;
      let sizzle = 0;
      let clothKnead = 0;
      let clothFreq = 520;

      if (stepId === 'wither') {
        const energy = params.waveEnergy || 0;
        const beat = params.cascadeBeat || 0.5;
        tarpWind = energy * 0.28;
        tarpWindFreq = 210 + energy * 240;
        leafRustle = energy * (0.14 + 0.24 * beat);
        leafFreq = 1950 + energy * 1050;
      } else if (stepId === 'panfire') {
        const spinNorm = params.spinNorm || 0;
        const beat = params.cascadeBeat || 0.5;
        const tempNorm = params.tempNorm || 0;
        drumHearth = 0.08 + spinNorm * 0.16 + tempNorm * 0.08;
        drumFreq = 140 + spinNorm * 140;
        leafRustle = Math.min(0.32, (0.04 + spinNorm * 0.24) * (0.45 + 0.55 * beat));
        leafFreq = 1800 + spinNorm * 900;
        sizzle = params.sizzleLevel ? params.sizzleLevel * 0.11 : 0;
      } else if (stepId === 'roll') {
        const knead = params.kneadEnergy || 0;
        clothKnead = knead * 0.34;
        clothFreq = 420 + knead * 300;
        drumHearth = knead * 0.12;
      } else if (stepId === 'roast') {
        if (params.isHoldingHeat) {
          drumHearth = 0.11;
          drumFreq = 240;
        }
      }

      this.loops.tarpWind.gain.gain.setTargetAtTime(tarpWind, now, 0.045);
      this.loops.tarpWind.filter.frequency.setTargetAtTime(tarpWindFreq, now, 0.05);

      this.loops.leafRustle.gain.gain.setTargetAtTime(leafRustle, now, 0.04);
      this.loops.leafRustle.filter.frequency.setTargetAtTime(leafFreq, now, 0.05);

      this.loops.drumHearth.gain.gain.setTargetAtTime(drumHearth, now, 0.05);
      this.loops.drumHearth.filter.frequency.setTargetAtTime(drumFreq, now, 0.06);

      this.loops.sizzle.gain.gain.setTargetAtTime(sizzle, now, 0.05);

      this.loops.clothKnead.gain.gain.setTargetAtTime(clothKnead, now, 0.045);
      this.loops.clothKnead.filter.frequency.setTargetAtTime(clothFreq, now, 0.05);
    } catch {
      // Safe fallback
    }
  }
}

class TeaCraftExperience {
  constructor(sectionEl) {
    this.sectionEl = sectionEl;
    this.canvasShell = sectionEl.querySelector('.tea3d-canvas-shell');
    this.canvas = sectionEl.querySelector('#tea3d-canvas');
    this.fallbackEl = sectionEl.querySelector('#tea3d-fallback');

    // UI Elements
    this.stepBtns = Array.from(sectionEl.querySelectorAll('.tea3d-step-btn'));
    this.badgeEl = sectionEl.querySelector('#tea3d-prompt-badge');
    this.countEl = sectionEl.querySelector('#tea3d-prompt-count');
    this.promptTextEl = sectionEl.querySelector('#tea3d-prompt-text');
    this.soundBtn = sectionEl.querySelector('#tea3d-sound-btn');
    this.soundLabelEl = sectionEl.querySelector('#tea3d-sound-label');
    this.assistBtn = sectionEl.querySelector('#tea3d-assist-btn');
    this.resetStepBtn = sectionEl.querySelector('#tea3d-reset-step-btn');
    this.toastEl = sectionEl.querySelector('#tea3d-toast');
    this.circleGuideEl = sectionEl.querySelector('#tea3d-circle-guide');

    this.meterLabelEl = sectionEl.querySelector('#tea3d-meter-label');
    this.meterValueEl = sectionEl.querySelector('#tea3d-meter-value');
    this.progressFillEl = sectionEl.querySelector('#tea3d-progress-fill');
    this.bandLightEl = sectionEl.querySelector('#tea3d-band-primary');
    this.bandDeepEl = sectionEl.querySelector('#tea3d-band-secondary');

    this.witherWrapEl = sectionEl.querySelector('#tea3d-wither-wrap');
    this.witherStatusEl = sectionEl.querySelector('#tea3d-wither-status');

    this.panfireWrapEl = sectionEl.querySelector('#tea3d-panfire-wrap');
    this.panfireTempEl = sectionEl.querySelector('#tea3d-panfire-temp');

    this.holdWrapEl = sectionEl.querySelector('#tea3d-hold-wrap');
    this.holdBtnEl = sectionEl.querySelector('#tea3d-hold-btn');
    this.roastMoistureEl = sectionEl.querySelector('#tea3d-roast-moisture');

    this.roastChoiceEl = sectionEl.querySelector('#tea3d-roast-choice');
    this.roastChoiceHintEl = sectionEl.querySelector('#tea3d-roast-choice-hint');
    this.confirmRoastBtn = sectionEl.querySelector('#tea3d-confirm-roast-btn');
    this.continueRoastBtn = sectionEl.querySelector('#tea3d-continue-roast-btn');

    this.finalePanelEl = sectionEl.querySelector('#tea3d-finale-panel');
    this.finaleTitleEl = sectionEl.querySelector('#tea3d-finale-title');
    this.finaleDotEl = sectionEl.querySelector('#tea3d-finale-dot');
    this.finalePillEl = sectionEl.querySelector('#tea3d-finale-pill-text');
    this.finaleDescEl = sectionEl.querySelector('#tea3d-finale-desc');
    this.finaleRecommendEl = sectionEl.querySelector('#tea3d-finale-recommend');
    this.finaleCtaEl = sectionEl.querySelector('#tea3d-finale-cta');
    this.finaleReplayBtn = sectionEl.querySelector('#tea3d-finale-replay');

    this.knowledgeTitleEl = sectionEl.querySelector('#tea3d-k-title');
    this.knowledgeBodyEl = sectionEl.querySelector('#tea3d-k-body');
    this.knowledgeEffectEl = sectionEl.querySelector('#tea3d-k-effect');
    this.prevStepBtn = sectionEl.querySelector('#tea3d-prev-btn');
    this.nextStepBtn = sectionEl.querySelector('#tea3d-next-btn');

    // Sound Synthesizer Engine
    this.sound = new TeaSoundEngine();

    // Runtime & Lifecycle State
    this.initialized = false;
    this.isInView = false;
    this.rafId = null;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
    this.gltfLoader = new GLTFLoader();

    // Shared Free-Navigation Craft State (No forced unlock gate)
    this.currentStepIdx = 0;
    this.completedSteps = [false, false, false, false, false, false];
    this.roastOutcome = 'light'; // 'light' | 'roasted'

    // Per-Step Interactive State
    this.pluckPicked = 0;
    this.pluckTotal = 5;

    this.witherProgress = 0; // 0..100
    this.witherSwingTarget = 0;
    this.witherSwingCurrent = 0;
    this.witherWaveEnergy = 0;
    this.witherWavePhase = 0;

    this.panfireTemp = 32; // sweet spot 55..85
    this.panfireProgress = 0;
    this.drumSpinSpeed = 0.55; // rad/s baseline rotation

    this.rollProgress = 0; // 0..100
    this.rollCrankAngle = 0;
    this.rollSpinEnergy = 0;

    this.roastProgress = 0; // 0..100
    this.isHoldingHeat = false;
    this.overheatCooldown = 0;
    this.charcoalCrackleTimer = 0;

    // Pointer Gesture State
    this.activePointerId = null;
    this.isDragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.lastMoveDir = 0;
    this.lastRollAngle = 0;
    this.finaleOrbitYaw = 0.18;

    this.toastTimer = null;
    this.stepObjects = {};
    this.activeParticles = [];

    this.bindUIEvents();
    this.observeVisibility();
    this.updateSoundButtonUI();
    this.updateUI();
  }

  observeVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sound.muteAllContinuous();
      }
    });

    if (!('IntersectionObserver' in window)) {
      this.ensureInitialized();
      this.startLoop();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isInView = entry.isIntersecting;
        if (entry.isIntersecting) {
          this.ensureInitialized();
          this.startLoop();
        } else {
          this.sound.muteAllContinuous();
          this.stopLoop();
        }
      });
    }, { threshold: 0.06 });

    observer.observe(this.sectionEl);
  }

  ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.initThreeScene();
      this.bindCanvasPointerEvents();
      this.switchSceneGroup(this.currentStepIdx);
    } catch (err) {
      if (this.fallbackEl) {
        this.fallbackEl.classList.add('is-visible');
      }
      if (this.canvasShell) {
        this.canvasShell.hidden = true;
      }
    }
  }

  initThreeScene() {
    const width = this.canvasShell.clientWidth || 960;
    const height = this.canvasShell.clientHeight || 540;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe6efee);
    this.scene.fog = new THREE.FogExp2(0xe4eceb, 0.022);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 80);
    this.camera.position.set(0.1, 2.75, 5.85);
    this.camera.lookAt(0.05, 0.85, 0.15);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.gradientMap = createToonGradientMap();
    this.bambooTex = createFineBambooStripTexture();
    this.tarpTex = createTarpWeaveTexture();
    this.shadeNetTex = createShadeNetTexture();
    this.leafVeinTex = createTeaLeafVeinTexture();
    this.steelTex = createSteelBrushedTexture();
    this.teaLeafGeo = createCurvedTeaLeafGeometry(0.42, 0.19, 0.036, 0.085);
    this.smallTeaLeafGeo = createCurvedTeaLeafGeometry(0.28, 0.13, 0.024, 0.055);
    this.budTipGeo = createBudTipGeometry();

    this.setupLightingAndBackdrops();
    this.buildAllStepScenes();
    this.maybeLoadExternalGltfOverrides();

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.canvasShell);
    } else {
      window.addEventListener('resize', () => this.handleResize());
    }
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    const w = this.canvasShell.clientWidth;
    const h = this.canvasShell.clientHeight;
    if (w <= 0 || h <= 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
  }

  toonMat(color, extra = {}) {
    return new THREE.MeshToonMaterial({
      color,
      gradientMap: this.gradientMap,
      ...extra
    });
  }

  setupLightingAndBackdrops() {
    const hemi = new THREE.HemisphereLight(0xfbf6ed, 0x3b636b, 1.08);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff5e4, 1.48);
    sun.position.set(5, 9, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 25;
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    this.scene.add(sun);

    const rim = new THREE.DirectionalLight(0xd99559, 0.5);
    rim.position.set(-5, 4, -4);
    this.scene.add(rim);

    // Charcoal / gas burner warm glow (Step 3 drum firebox & Step 5 bamboo roaster)
    this.emberLight = new THREE.PointLight(0xff7d2b, 0, 10);
    this.emberLight.position.set(0, 0.65, 0.5);
    this.scene.add(this.emberLight);

    /* Outdoor Shanlinxi Environment Group (Steps 0, 1, 5) */
    this.outdoorEnvGroup = new THREE.Group();
    const outdoorGround = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11.5, 0.5, 48),
      this.toonMat(0x9cb38e)
    );
    outdoorGround.position.y = -0.25;
    outdoorGround.receiveShadow = true;
    this.outdoorEnvGroup.add(outdoorGround);

    const mountainColors = [0x9fb8bc, 0x7c9ca2, 0x5c7f89];
    const ridgeConfigs = [
      { x: -5.5, y: 1.0, z: -11, r: 4.6, h: 4.8, c: mountainColors[0] },
      { x: 0.4, y: 1.5, z: -13, r: 5.6, h: 6.0, c: mountainColors[1] },
      { x: 6.2, y: 0.9, z: -10.5, r: 4.3, h: 4.4, c: mountainColors[0] },
      { x: -2.2, y: 0.5, z: -8.6, r: 3.5, h: 3.3, c: mountainColors[2] },
      { x: 3.6, y: 0.5, z: -8.8, r: 3.7, h: 3.5, c: mountainColors[2] }
    ];
    ridgeConfigs.forEach((cfg) => {
      const peak = new THREE.Mesh(new THREE.ConeGeometry(cfg.r, cfg.h, 7), this.toonMat(cfg.c));
      peak.position.set(cfg.x, cfg.y, cfg.z);
      peak.rotation.y = cfg.x * 0.3;
      this.outdoorEnvGroup.add(peak);
    });

    this.cloudMeshes = [];
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfbf6ed, transparent: true, opacity: 0.66 });
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Group();
      for (let j = 0; j < 3; j++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.65 - j * 0.12, 12, 10), cloudMat);
        s.scale.set(1.6, 0.55, 0.8);
        s.position.set((j - 1) * 0.65, (j % 2) * 0.14, 0);
        puff.add(s);
      }
      puff.position.set(-6 + i * 2.5, 2.8 + (i % 2) * 0.7, -7.2 - (i % 3) * 1.4);
      puff.userData.baseX = puff.position.x;
      puff.userData.phase = i * 1.1;
      this.cloudMeshes.push(puff);
      this.outdoorEnvGroup.add(puff);
    }
    this.scene.add(this.outdoorEnvGroup);

    /* Indoor Taiwanese Tea Factory Workshop Group (Steps 2, 3, 4) */
    this.workshopEnvGroup = new THREE.Group();
    this.workshopEnvGroup.visible = false;

    const factoryFloor = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.4, 12),
      this.toonMat(0x889194)
    );
    factoryFloor.position.y = -0.2;
    factoryFloor.receiveShadow = true;
    this.workshopEnvGroup.add(factoryFloor);

    // Plaster back wall + warm cedar timber wainscot
    const plasterWall = new THREE.Mesh(
      new THREE.BoxGeometry(16, 6.2, 0.25),
      this.toonMat(0xeae4d7)
    );
    plasterWall.position.set(0, 3.0, -4.6);
    plasterWall.receiveShadow = true;
    this.workshopEnvGroup.add(plasterWall);

    const timberWainscot = new THREE.Mesh(
      new THREE.BoxGeometry(16, 1.35, 0.3),
      this.toonMat(0x705136)
    );
    timberWainscot.position.set(0, 0.65, -4.55);
    this.workshopEnvGroup.add(timberWainscot);

    // Timber ceiling beam hints
    [-3.2, 3.2].forEach((bx) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 6.2, 0.36),
        this.toonMat(0x5b3f28)
      );
      post.position.set(bx, 3.0, -4.42);
      this.workshopEnvGroup.add(post);
    });
    this.scene.add(this.workshopEnvGroup);
  }

  /**
   * 建立寫實「一心二葉」茶梢或「對口老葉」枝條（具真實茶葉片、葉脈紋與自然下彎）
   */
  buildRealisticTeaShoot(isBud = true) {
    const group = new THREE.Group();
    const stemMat = this.toonMat(isBud ? 0x7bc94f : 0x3b4d37);
    const tipMat = this.toonMat(isBud ? 0xc2f57c : 0x224a2d);
    const leafColorHex = isBud ? 0x9ae262 : 0x1e4a2b;
    const secondLeafHex = isBud ? 0x7fd04c : 0x1a4026;

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(isBud ? 0.02 : 0.028, isBud ? 0.03 : 0.038, isBud ? 0.28 : 0.22, 7),
      stemMat
    );
    stem.position.y = isBud ? 0.13 : 0.1;
    group.add(stem);

    if (isBud) {
      // Rolled upright apical bud (芽心)
      const bud = new THREE.Mesh(this.budTipGeo, tipMat);
      bud.position.y = 0.24;
      bud.rotation.set(0.14, 0, -0.1);
      addToonOutline(bud, 1.07);
      group.add(bud);

      // 1st tender leaf arching left-forward
      const leaf1Mat = this.toonMat(leafColorHex, { map: this.leafVeinTex, side: THREE.DoubleSide });
      const leaf1 = new THREE.Mesh(this.teaLeafGeo, leaf1Mat);
      leaf1.scale.set(0.82, 0.85, 0.82);
      leaf1.position.set(0, 0.21, 0);
      leaf1.rotation.set(0.32, -0.95, 0.16);
      leaf1.castShadow = true;
      addToonOutline(leaf1, 1.05);
      group.add(leaf1);

      // 2nd tender leaf arching right-back
      const leaf2Mat = this.toonMat(secondLeafHex, { map: this.leafVeinTex, side: THREE.DoubleSide });
      const leaf2 = new THREE.Mesh(this.teaLeafGeo, leaf2Mat);
      leaf2.scale.set(0.96, 0.96, 0.96);
      leaf2.position.set(0, 0.14, 0);
      leaf2.rotation.set(0.28, 1.35, -0.14);
      leaf2.castShadow = true;
      addToonOutline(leaf2, 1.05);
      group.add(leaf2);

      // Subtle warm highlight ring at stem node so interactive targets read clearly against dense leaves
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.11, 0.15, 20),
        new THREE.MeshBasicMaterial({ color: 0xfbf6ed, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.05;
      group.add(halo);
    } else {
      // Mature leathery double leaves (no tender upright bud)
      const oldMat = this.toonMat(leafColorHex, { map: this.leafVeinTex, side: THREE.DoubleSide });
      const leftOld = new THREE.Mesh(this.teaLeafGeo, oldMat);
      leftOld.scale.set(1.12, 1.0, 1.05);
      leftOld.position.set(0, 0.14, 0);
      leftOld.rotation.set(0.45, -1.25, 0.08);
      addToonOutline(leftOld, 1.05);
      group.add(leftOld);

      const rightOld = new THREE.Mesh(this.teaLeafGeo, oldMat);
      rightOld.scale.set(1.15, 1.0, 1.08);
      rightOld.position.set(0, 0.11, 0);
      rightOld.rotation.set(0.42, 1.75, -0.08);
      addToonOutline(rightOld, 1.05);
      group.add(rightOld);
    }

    const hitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(isBud ? 0.44 : 0.36, 10, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.position.y = 0.24;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  buildAllStepScenes() {
    this.buildStep1Pluck();
    this.buildStep2CanopyWither();
    this.buildStep3RotaryDrum();
    this.buildStep4ClothRoll();
    this.buildStep5Roast();
    this.buildStep6Finale();
  }

  /* -----------------------------------------------------------------------
     STEP 1 SCENE: 01 採菁 — 杉林溪弧形修剪茶樹壟、280片實葉 InstancedMesh 與細編竹簍
     ----------------------------------------------------------------------- */
  buildStep1Pluck() {
    const root = new THREE.Group();

    // Raised mountain black-soil mound (茶畦)
    const ridgeSoilGeo = new THREE.CylinderGeometry(1.1, 1.38, 3.85, 18);
    ridgeSoilGeo.rotateZ(Math.PI / 2);
    ridgeSoilGeo.scale(1, 0.34, 0.85);
    const soilMound = new THREE.Mesh(ridgeSoilGeo, this.toonMat(0x463527));
    soilMound.position.set(-0.72, 0.14, 0.08);
    soilMound.receiveShadow = true;
    addToonOutline(soilMound, 1.02);
    root.add(soilMound);

    // Forked woody tea trunks & branches visible under hedge skirt
    const woodMat = this.toonMat(0x5d4129);
    [-1.95, -1.35, -0.75, -0.15, 0.45].forEach((tx, idx) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 0.56, 7), woodMat);
      trunk.position.set(tx, 0.42, (idx % 2 === 0 ? -0.12 : 0.16));
      trunk.rotation.z = (idx % 2 === 0 ? 0.12 : -0.12);
      addToonOutline(trunk, 1.05);
      root.add(trunk);

      [-0.38, 0.38].forEach((forkTilt) => {
        const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 0.42, 6), woodMat);
        limb.position.set(tx + forkTilt * 0.25, 0.68, (idx % 2 === 0 ? -0.12 : 0.16));
        limb.rotation.z = forkTilt * 1.1;
        root.add(limb);
      });
    });

    // Rounded softly domed shaded foliage core tucked cleanly inside leaf blanket
    const coreGeo = new THREE.SphereGeometry(1, 20, 14);
    coreGeo.scale(1.68, 0.42, 0.64);
    const coreMesh = new THREE.Mesh(coreGeo, this.toonMat(0x163822));
    coreMesh.position.set(-0.72, 0.56, 0.08);
    root.add(coreMesh);

    // 460 real curved veined mature leaves completely blanketing the terraced tea row (InstancedMesh)
    const leafCount = 460;
    const canopyMat = this.toonMat(0xffffff, {
      map: this.leafVeinTex,
      side: THREE.DoubleSide
    });
    const canopyInst = new THREE.InstancedMesh(this.teaLeafGeo, canopyMat, leafCount);
    canopyInst.castShadow = true;
    canopyInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const leafPalette = [
      new THREE.Color(0x215431),
      new THREE.Color(0x2a663c),
      new THREE.Color(0x327546),
      new THREE.Color(0x1b4628),
      new THREE.Color(0x3a824c)
    ];

    for (let i = 0; i < leafCount; i++) {
      // Rounded dome cross-section across length & arched crown
      const uLen = ((i * 0.6180339887) % 1) * 2 - 1; // [-1 .. +1]
      const endArch = Math.sqrt(Math.max(0.08, 1 - Math.pow(uLen, 4)));
      const hx = -0.72 + uLen * 1.82;
      const ang = ((i * 2.39996) % (Math.PI * 1.24)) - Math.PI * 0.12;
      const archRatio = Math.max(0, Math.sin(ang));
      const rCross = (0.64 + (i % 5) * 0.045) * endArch;
      const hz = 0.08 + Math.cos(ang) * rCross;
      const hy = 0.34 + archRatio * 0.66 * endArch + (i % 3) * 0.02;

      dummy.position.set(hx, hy, hz);
      const yaw = Math.atan2(hz - 0.08, uLen * 0.45) + (Math.sin(i * 1.7) * 0.65);
      const pitch = 0.22 + (1 - archRatio) * 0.55;
      dummy.rotation.set(pitch, yaw, Math.sin(i) * 0.25);
      const sc = 0.86 + (i % 4) * 0.13;
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      canopyInst.setMatrixAt(i, dummy.matrix);
      canopyInst.setColorAt(i, leafPalette[i % leafPalette.length]);
    }
    canopyInst.instanceMatrix.needsUpdate = true;
    if (canopyInst.instanceColor) canopyInst.instanceColor.needsUpdate = true;
    root.add(canopyInst);

    // Woven Bamboo Tea-Picking Basket on right (採茶竹簍)
    const basket = new THREE.Group();
    basket.position.set(2.15, 0.52, 0.42);
    basket.rotation.z = 0.08;
    const basketPoints = [
      new THREE.Vector2(0.42, -0.45),
      new THREE.Vector2(0.55, 0.0),
      new THREE.Vector2(0.72, 0.46),
      new THREE.Vector2(0.67, 0.48),
      new THREE.Vector2(0.50, 0.0),
      new THREE.Vector2(0.39, -0.42)
    ];
    const basketMat = new THREE.MeshToonMaterial({
      color: 0xdab27c,
      map: this.bambooTex,
      gradientMap: this.gradientMap
    });
    const basketBody = new THREE.Mesh(new THREE.LatheGeometry(basketPoints, 22), basketMat);
    basketBody.castShadow = true;
    addToonOutline(basketBody, 1.04);
    basket.add(basketBody);

    const rimTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.70, 0.055, 8, 24),
      this.toonMat(0x9b6432)
    );
    rimTorus.rotation.x = Math.PI / 2;
    rimTorus.position.y = 0.47;
    basket.add(rimTorus);

    // Inner dark weave bottom + pre-placed harvested shoots revealed inside basket
    const innerBase = new THREE.Mesh(
      new THREE.CircleGeometry(0.52, 20),
      this.toonMat(0x4c341d)
    );
    innerBase.rotation.x = -Math.PI / 2;
    innerBase.position.y = -0.15;
    basket.add(innerBase);

    const harvestedInBasket = [];
    const slotOffsets = [
      [-0.2, 0.14, 0.1],
      [0.2, 0.18, -0.05],
      [0.0, 0.22, 0.18],
      [-0.14, 0.28, -0.15],
      [0.12, 0.34, 0.06]
    ];
    slotOffsets.forEach(([sx, sy, sz], idx) => {
      const sample = this.buildRealisticTeaShoot(true);
      sample.group.scale.setScalar(0.82);
      sample.group.position.set(sx, sy, sz);
      sample.group.rotation.set(1.1, idx * 1.2, 0.4);
      sample.group.visible = false;
      basket.add(sample.group);
      harvestedInBasket.push(sample.group);
    });
    root.add(basket);

    // 5 Interactive tender "one-bud two-leaves" shoots crowning the hedge
    const budCoords = [
      new THREE.Vector3(-2.05, 1.06, 0.12),
      new THREE.Vector3(-1.35, 1.15, -0.18),
      new THREE.Vector3(-0.72, 1.18, 0.28),
      new THREE.Vector3(-0.08, 1.14, -0.08),
      new THREE.Vector3(0.58, 1.08, 0.24)
    ];

    const buds = [];
    const hitTargets = [];
    budCoords.forEach((pos, idx) => {
      const shoot = this.buildRealisticTeaShoot(true);
      shoot.group.position.copy(pos);
      shoot.group.rotation.y = idx * 0.85;
      shoot.group.userData = {
        type: 'bud',
        index: idx,
        originPos: pos.clone(),
        picked: false,
        flying: false,
        flyT: 0
      };
      shoot.hitMesh.userData = { parentShoot: shoot.group, type: 'bud' };
      buds.push(shoot.group);
      hitTargets.push(shoot.hitMesh);
      root.add(shoot.group);
    });

    // 6 Mature dark-leaf twigs along the skirt/flanks (penalized wobble if clicked)
    const oldLeafCoords = [
      new THREE.Vector3(-2.22, 0.72, 0.56),
      new THREE.Vector3(-1.55, 0.80, 0.64),
      new THREE.Vector3(-0.92, 0.82, -0.45),
      new THREE.Vector3(-0.34, 0.78, 0.68),
      new THREE.Vector3(0.28, 0.84, -0.42),
      new THREE.Vector3(0.84, 0.74, 0.58)
    ];
    const oldLeaves = [];
    oldLeafCoords.forEach((pos, idx) => {
      const oldShoot = this.buildRealisticTeaShoot(false);
      oldShoot.group.position.copy(pos);
      oldShoot.group.rotation.y = idx * 1.1;
      oldShoot.group.userData = { type: 'oldLeaf', shakeTime: 0 };
      oldShoot.hitMesh.userData = { parentShoot: oldShoot.group, type: 'oldLeaf' };
      oldLeaves.push(oldShoot.group);
      hitTargets.push(oldShoot.hitMesh);
      root.add(oldShoot.group);
    });

    this.scene.add(root);
    this.stepObjects.pluck = { root, basket, harvestedInBasket, buds, oldLeaves, hitTargets, flyingBuds: [] };
  }

  /* -----------------------------------------------------------------------
     STEP 2 SCENE: 02 遮雨棚萎凋 — 室外黑網遮雨棚與可拉動左右擺盪之萎凋棚布
     ----------------------------------------------------------------------- */
  buildStep2CanopyWither() {
    const root = new THREE.Group();

    // Concrete footings + 4 galvanized steel shelter corner posts
    const steelMat = this.toonMat(0x88969c);
    const roofSupportY = 2.48;
    const postPositions = [
      [-2.45, -1.38],
      [2.45, -1.38],
      [-2.45, 1.38],
      [2.45, 1.38]
    ];
    postPositions.forEach(([px, pz]) => {
      const footing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.17, 0.22, 10),
        this.toonMat(0x6d7477)
      );
      footing.position.set(px, 0.11, pz);
      root.add(footing);

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.06, roofSupportY, 10),
        steelMat
      );
      post.position.set(px, roofSupportY * 0.5, pz);
      post.castShadow = true;
      addToonOutline(post, 1.06);
      root.add(post);
    });

    // Overhead beams, steel rafters & pitched gable truss
    [-1.38, 1.38].forEach((bz) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.08, 0.09), steelMat);
      beam.position.set(0, roofSupportY, bz);
      addToonOutline(beam, 1.03);
      root.add(beam);
    });
    [-2.45, 0, 2.45].forEach((bx) => {
      const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.9), steelMat);
      sideRail.position.set(bx, roofSupportY, 0);
      root.add(sideRail);
    });

    // Overhead translucent polycarbonate rain canopy (半透明防雨浪板遮雨棚)
    const rainRoofMat = this.toonMat(0xb6d6e2, {
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide
    });
    const rainRoofLeft = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.65), rainRoofMat);
    rainRoofLeft.position.set(0, roofSupportY + 0.18, -0.74);
    rainRoofLeft.rotation.x = -Math.PI / 2 + 0.16;
    root.add(rainRoofLeft);

    const rainRoofRight = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.65), rainRoofMat);
    rainRoofRight.position.set(0, roofSupportY + 0.18, 0.74);
    rainRoofRight.rotation.x = -Math.PI / 2 - 0.16;
    root.add(rainRoofRight);

    // Overhead Black Shade Mesh Netting below the rain roof (遮陽黑網)
    const shadeNetMat = new THREE.MeshBasicMaterial({
      map: this.shadeNetTex,
      transparent: true,
      opacity: 0.74,
      side: THREE.DoubleSide
    });
    const shadeNet = new THREE.Mesh(new THREE.PlaneGeometry(4.88, 2.7), shadeNetMat);
    shadeNet.rotation.x = -Math.PI / 2;
    shadeNet.position.set(0, roofSupportY - 0.10, 0);
    root.add(shadeNet);

    // Swinging Withering Tarp Cloth built directly in XZ space so vertex Y ripples natively
    const tarpW = 3.7;
    const tarpD = 1.98;
    const tarpGeo = new THREE.PlaneGeometry(tarpW, tarpD, 24, 14);
    tarpGeo.rotateX(-Math.PI / 2);
    const tarpBasePos = new Float32Array(tarpGeo.attributes.position.array);

    const tarpMat = new THREE.MeshToonMaterial({
      map: this.tarpTex,
      color: 0xe3eae6,
      gradientMap: this.gradientMap,
      side: THREE.DoubleSide
    });
    const tarpMesh = new THREE.Mesh(tarpGeo, tarpMat);
    tarpMesh.position.y = 0.86;
    tarpMesh.castShadow = true;
    tarpMesh.receiveShadow = true;
    root.add(tarpMesh);

    // Left & Right wooden/copper pull-bars clamped to tarp edges
    const leftBarGroup = new THREE.Group();
    const rightBarGroup = new THREE.Group();
    const barGeo = new THREE.CylinderGeometry(0.048, 0.048, tarpD + 0.3, 10);
    barGeo.rotateX(Math.PI / 2);
    const barMat = this.toonMat(0x8e592b);

    [leftBarGroup, rightBarGroup].forEach((bg, idx) => {
      const pole = new THREE.Mesh(barGeo, barMat);
      addToonOutline(pole, 1.06);
      bg.add(pole);

      // Red-copper hand grip sleeves on front/back ends
      [-tarpD * 0.5 - 0.05, tarpD * 0.5 + 0.05].forEach((gz) => {
        const grip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.065, 0.18, 10).rotateX(Math.PI / 2),
          this.toonMat(0xc8834b)
        );
        grip.position.z = gz;
        bg.add(grip);
      });
      bg.position.set(idx === 0 ? -tarpW * 0.5 : tarpW * 0.5, 0.86, 0);
      root.add(bg);
    });

    // 4 dynamic suspension ropes connecting shelter corners to pull-bar ends
    const ropes = [];
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0x3b484e });
    const ropeAnchors = [
      { post: new THREE.Vector3(-2.45, roofSupportY - 0.12, -1.38), bar: leftBarGroup, endZ: -tarpD * 0.48 },
      { post: new THREE.Vector3(-2.45, roofSupportY - 0.12, 1.38), bar: leftBarGroup, endZ: tarpD * 0.48 },
      { post: new THREE.Vector3(2.45, roofSupportY - 0.12, -1.38), bar: rightBarGroup, endZ: -tarpD * 0.48 },
      { post: new THREE.Vector3(2.45, roofSupportY - 0.12, 1.38), bar: rightBarGroup, endZ: tarpD * 0.48 }
    ];
    ropeAnchors.forEach((ra) => {
      const lineGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 6);
      const lineMesh = new THREE.Mesh(lineGeo, ropeMat);
      root.add(lineMesh);
      ropes.push({ mesh: lineMesh, post: ra.post, bar: ra.bar, endZ: ra.endZ });
    });

    // 64 Realistic Curved Tea Shoots tumbling on the swinging tarp
    const canopyLeaves = [];
    for (let i = 0; i < 64; i++) {
      const lx = (((i * 0.6180339887) % 1) - 0.5) * 3.0;
      const lz = (((i * 0.381966) % 1) - 0.5) * 1.5;
      const mat = this.toonMat(0x7fd452, { map: this.leafVeinTex, side: THREE.DoubleSide });
      const lMesh = new THREE.Mesh(this.smallTeaLeafGeo, mat);
      lMesh.position.set(lx, 0.9, lz);
      const yaw = (i * 1.7) % (Math.PI * 2);
      lMesh.rotation.set(0.08, yaw, ((i % 3) - 1) * 0.12);
      lMesh.castShadow = true;
      lMesh.userData = {
        baseX: lx,
        baseZ: lz,
        baseYaw: yaw,
        phase: i * 0.53,
        isRedEdge: i % 3 === 0,
        mat
      };
      addToonOutline(lMesh, 1.05);
      canopyLeaves.push(lMesh);
      root.add(lMesh);
    }

    // Floating Floral Orchid Aroma Particles released as tarp swings
    const aromaParticles = [];
    const aromaColors = [0xf7b9c4, 0xf2d479, 0xfbf6ed];
    const pGeo = new THREE.OctahedronGeometry(0.075, 0);
    for (let k = 0; k < 28; k++) {
      const pMat = new THREE.MeshBasicMaterial({ color: aromaColors[k % 3], transparent: true, opacity: 0.12 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set((Math.random() - 0.5) * 3.0, 0.9 + Math.random() * 1.3, (Math.random() - 0.5) * 1.5);
      pMesh.userData = { speed: 0.45 + Math.random() * 0.45, phase: Math.random() * Math.PI * 2, mat: pMat };
      aromaParticles.push(pMesh);
      root.add(pMesh);
    }

    this.scene.add(root);
    this.stepObjects.wither = {
      root,
      tarpMesh,
      tarpBasePos,
      tarpW,
      tarpD,
      leftBarGroup,
      rightBarGroup,
      ropes,
      canopyLeaves,
      aromaParticles
    };
  }

  /**
   * 輔助計算遮雨棚布在 (worldX, worldZ) 處因擺盪與波浪產生的實際曲面高度
   */
  sampleTarpSurfaceY(x, swingOffset, waveAmp, wavePhase) {
    const halfW = 1.85;
    const localX = x - swingOffset;
    const u = THREE.MathUtils.clamp(localX / halfW, -1, 1);
    const catenarySag = -0.18 * (1 - u * u);
    const clothWave = Math.sin(u * 3.1 - wavePhase) * waveAmp * (1 - Math.abs(u) * 0.45);
    return 0.86 + catenarySag + clothWave;
  }

  /* -----------------------------------------------------------------------
     STEP 3 SCENE: 03 滾筒炒菁 — 台灣茶廠橫置旋轉不鏽鋼滾筒式殺菁機 + 內壁瀑布翻落茶菁
     ----------------------------------------------------------------------- */
  buildStep3RotaryDrum() {
    const root = new THREE.Group();

    // Heavy industrial cast-iron base & roller stand on workshop floor
    const standMat = this.toonMat(0x2d434e);
    const steelFrameMat = this.toonMat(0x475a64);

    const floorSkid = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.24, 2.2), standMat);
    floorSkid.position.set(0.15, 0.12, 0);
    floorSkid.castShadow = true;
    addToonOutline(floorSkid, 1.02);
    root.add(floorSkid);

    // Angled machine pivot so open drum mouth cleanly faces front-left viewer
    const machinePivot = new THREE.Group();
    machinePivot.position.set(0.18, 1.62, 0.05);
    machinePivot.rotation.set(0.14, -0.52, 0);

    // 4 rubber/steel drive rollers supporting bottom of cylinder
    [[-0.82, -0.78], [0.82, -0.78], [-0.82, 0.78], [0.82, 0.78]].forEach(([rx, rz]) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.34, 14).rotateX(Math.PI / 2),
        this.toonMat(0x1f282e)
      );
      wheel.position.set(rx, -1.16, rz);
      machinePivot.add(wheel);

      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.22), standMat);
      bracket.position.set(rx, -1.34, rz);
      machinePivot.add(bracket);
    });

    // Bottom gas burner manifold positioned cleanly BELOW outer cylinder wall (-1.12)
    const firebox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 1.8), steelFrameMat);
    firebox.position.set(0, -1.46, -0.05);
    machinePivot.add(firebox);

    const flameMats = [];
    const flameGeo = new THREE.ConeGeometry(0.072, 0.22, 8);
    for (let f = 0; f < 6; f++) {
      const fMat = new THREE.MeshBasicMaterial({ color: 0xff8a3d });
      const fMesh = new THREE.Mesh(flameGeo, fMat);
      fMesh.position.set((f % 2 === 0 ? -0.2 : 0.2), -1.25, -0.62 + Math.floor(f / 2) * 0.56);
      machinePivot.add(fMesh);
      flameMats.push({ mesh: fMesh, mat: fMat, idx: f });
    }

    // Rotating Cylindrical Fixation Drum (spins continuously around local Z axis!)
    const drumGroup = new THREE.Group();
    const drumRadius = 1.12;
    const drumLength = 2.45;
    const drumPoints = [
      new THREE.Vector2(0.0, -drumLength * 0.5),
      new THREE.Vector2(drumRadius, -drumLength * 0.5),
      new THREE.Vector2(drumRadius, drumLength * 0.5),
      new THREE.Vector2(drumRadius - 0.08, drumLength * 0.5),
      new THREE.Vector2(drumRadius - 0.08, -drumLength * 0.5 + 0.12),
      new THREE.Vector2(0.0, -drumLength * 0.5 + 0.12)
    ];
    const drumGeo = new THREE.LatheGeometry(drumPoints, 32);
    drumGeo.rotateX(Math.PI / 2); // Align lathe Y axis -> local Z axis (mouth opens at +Z!)

    const drumOuterMat = new THREE.MeshToonMaterial({
      color: 0xc5d0d4,
      map: this.steelTex,
      gradientMap: this.gradientMap,
      side: THREE.DoubleSide
    });
    const drumShell = new THREE.Mesh(drumGeo, drumOuterMat);
    drumShell.castShadow = true;
    addToonOutline(drumShell, 1.025);
    drumGroup.add(drumShell);

    // Dark seasoned inner cast-iron barrel liner
    const innerBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(drumRadius - 0.085, drumRadius - 0.085, drumLength - 0.14, 28, 1, true).rotateX(Math.PI / 2),
      this.toonMat(0x252d33, { side: THREE.BackSide })
    );
    innerBarrel.position.z = 0.06;
    drumGroup.add(innerBarrel);

    // Exterior reinforcing rings + front rolled bronze-steel rim
    [-0.78, 0.78].forEach((rz) => {
      const beltRing = new THREE.Mesh(
        new THREE.TorusGeometry(drumRadius + 0.02, 0.045, 8, 32),
        this.toonMat(0xc8834b)
      );
      beltRing.position.z = rz;
      drumGroup.add(beltRing);
    });
    const mouthLip = new THREE.Mesh(
      new THREE.TorusGeometry(drumRadius - 0.02, 0.055, 8, 32),
      this.toonMat(0x9eaab0)
    );
    mouthLip.position.z = drumLength * 0.5;
    drumGroup.add(mouthLip);

    // 4 Internal tumbling lifting paddles (內壁炒菁導葉) clearly visible rotating inside mouth!
    const baffleMat = this.toonMat(0x526570);
    for (let b = 0; b < 4; b++) {
      const ang = (b / 4) * Math.PI * 2;
      const baffle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, drumLength * 0.82), baffleMat);
      const br = drumRadius - 0.20;
      baffle.position.set(Math.cos(ang) * br, Math.sin(ang) * br, 0.05);
      baffle.rotation.z = ang + Math.PI / 2;
      drumGroup.add(baffle);
    }

    // Rear drive axle cap
    const rearHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.38, 12).rotateX(Math.PI / 2),
      steelFrameMat
    );
    rearHub.position.z = -drumLength * 0.5 - 0.14;
    drumGroup.add(rearHub);

    machinePivot.add(drumGroup);

    // 48 Tea Leaves continuously riding up drum wall and waterfall-tumbling inside!
    const drumLeaves = [];
    for (let i = 0; i < 48; i++) {
      const lMat = this.toonMat(0x63bd49, { map: this.leafVeinTex, side: THREE.DoubleSide });
      const leaf = new THREE.Mesh(this.smallTeaLeafGeo, lMat);
      const startAng = -Math.PI * 0.8 + (i / 48) * Math.PI * 1.4;
      const zSlot = -0.78 + ((i * 0.37) % 1) * 1.72;
      leaf.userData = {
        mode: i % 3 === 0 ? 'fall' : 'ride',
        angle: startAng,
        zSlot,
        radius: 0.86 - (i % 4) * 0.05,
        fallX: (Math.random() - 0.5) * 0.6,
        fallY: 0.4 - Math.random() * 0.8,
        fallVx: (Math.random() - 0.5) * 0.35,
        fallVy: -0.25,
        spinX: Math.random() * 6,
        spinY: Math.random() * 6,
        mat: lMat
      };
      addToonOutline(leaf, 1.05);
      drumLeaves.push(leaf);
      machinePivot.add(leaf);
    }

    // Raw grassy vapor / white steam billowing out of front drum mouth
    const steamParticles = [];
    const steamGeo = new THREE.SphereGeometry(0.13, 8, 6);
    for (let i = 0; i < 22; i++) {
      const sMat = new THREE.MeshBasicMaterial({ color: 0xd5ebd9, transparent: true, opacity: 0.44 });
      const sp = new THREE.Mesh(steamGeo, sMat);
      sp.position.set((Math.random() - 0.5) * 1.15, -0.15 + Math.random() * 1.5, drumLength * 0.5 + Math.random() * 0.7);
      sp.userData = { speed: 0.65 + Math.random() * 0.55, mat: sMat };
      steamParticles.push(sp);
      machinePivot.add(sp);
    }

    root.add(machinePivot);
    this.scene.add(root);
    this.stepObjects.panfire = { root, machinePivot, drumGroup, drumLeaves, steamParticles, flameMats };
  }

  /* -----------------------------------------------------------------------
     STEP 4 SCENE: 04 布球團揉 — 平揉包布球機 + 右側竹箕解塊茶樣對照
     ----------------------------------------------------------------------- */
  buildStep4ClothRoll() {
    const root = new THREE.Group();

    // Left: Taiwanese Cloth-Ball Flat Kneading Machine (平揉機)
    const machineGroup = new THREE.Group();
    machineGroup.position.set(-0.78, 0, -0.05);

    const basePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.28, 0.68, 24),
      this.toonMat(0x2d434e)
    );
    basePedestal.position.y = 0.34;
    basePedestal.castShadow = true;
    addToonOutline(basePedestal, 1.025);
    machineGroup.add(basePedestal);

    // Lower grooved radial kneading table (帶放射稜條的揉捻盤)
    const lowerDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.42, 1.46, 0.14, 32),
      this.toonMat(0xc7955b)
    );
    lowerDisc.position.y = 0.74;
    lowerDisc.receiveShadow = true;
    addToonOutline(lowerDisc, 1.025);
    machineGroup.add(lowerDisc);

    // 14 raised radial kneading ribs on the tray surface
    const ribMat = this.toonMat(0x8e592b);
    for (let r = 0; r < 14; r++) {
      const a = (r / 14) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.05, 1.15), ribMat);
      rib.position.set(Math.sin(a) * 0.72, 0.82, Math.cos(a) * 0.72);
      rib.rotation.y = a;
      machineGroup.add(rib);
    }

    // Rear overhead C-frame gantry supporting crank shaft
    const gantryPost = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.95, 0.28), this.toonMat(0x3a525e));
    gantryPost.position.set(0, 1.55, -1.45);
    addToonOutline(gantryPost, 1.03);
    machineGroup.add(gantryPost);

    const gantryArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 1.65), this.toonMat(0x3a525e));
    gantryArm.position.set(0, 2.42, -0.72);
    addToonOutline(gantryArm, 1.03);
    machineGroup.add(gantryArm);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), this.toonMat(0xb6c2c8));
    shaft.position.set(0, 2.18, 0);
    machineGroup.add(shaft);

    // Eccentric orbiting upper compression disc + tightly wrapped white cotton cloth ball
    const pressArm = new THREE.Group();
    pressArm.position.set(0, 0.84, 0);

    const upperPressPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.16, 0.14, 28),
      this.toonMat(0x465b66)
    );
    upperPressPlate.position.set(0.18, 1.05, 0);
    upperPressPlate.castShadow = true;
    addToonOutline(upperPressPlate, 1.03);
    pressArm.add(upperPressPlate);

    const crankPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12), this.toonMat(0xc8834b));
    crankPivot.position.set(0.18, 1.2, 0);
    pressArm.add(crankPivot);

    // Cotton Cloth Ball (緊紮白色棉布茶球) between plate & ridged disc
    const clothBall = new THREE.Group();
    clothBall.position.set(0.18, 0.50, 0);
    const clothMat = this.toonMat(0xf4eee1);
    const mainBag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 2), clothMat);
    mainBag.scale.set(1.12, 0.72, 1.12);
    mainBag.castShadow = true;
    addToonOutline(mainBag, 1.045);
    clothBall.add(mainBag);

    const topKnot = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 10), clothMat);
    topKnot.position.y = 0.52;
    topKnot.rotation.z = Math.PI;
    addToonOutline(topKnot, 1.05);
    clothBall.add(topKnot);

    const bindingRope = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.048, 8, 20),
      this.toonMat(0xc8834b)
    );
    bindingRope.rotation.x = Math.PI / 2;
    bindingRope.position.y = 0.36;
    clothBall.add(bindingRope);

    pressArm.add(clothBall);
    machineGroup.add(pressArm);
    root.add(machineGroup);

    // Right-Front: Tilted Woven Bamboo Inspection Scoop (竹箕解塊茶樣盤)
    const scoopGroup = new THREE.Group();
    scoopGroup.position.set(1.62, 0.54, 0.45);
    scoopGroup.rotation.set(0.42, -0.45, 0.05);

    const scoopDish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.85, 0.14, 24),
      new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xdfb984, gradientMap: this.gradientMap })
    );
    scoopDish.receiveShadow = true;
    addToonOutline(scoopDish, 1.03);
    scoopGroup.add(scoopDish);

    const scoopRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.048, 8, 28),
      this.toonMat(0x8e592b)
    );
    scoopRim.rotation.x = Math.PI / 2;
    scoopRim.position.y = 0.06;
    scoopGroup.add(scoopRim);

    // 36 sample tea items inside the bamboo scoop morphing from loose strips -> compact hemispherical pellets
    const samplePellets = [];
    const sampleGeo = new THREE.SphereGeometry(0.11, 8, 6);
    for (let i = 0; i < 36; i++) {
      const a = i * 2.39996;
      const r = Math.sqrt(i / 36) * 0.68;
      const mMat = this.toonMat(0x52a349);
      const item = new THREE.Mesh(sampleGeo, mMat);
      item.position.set(Math.cos(a) * r, 0.11 + (i % 3) * 0.02, Math.sin(a) * r);
      item.scale.set(1.75, 0.28, 0.58);
      item.rotation.y = a + Math.PI * 0.35;
      item.userData = { mat: mMat };
      addToonOutline(item, 1.06);
      samplePellets.push(item);
      scoopGroup.add(item);
    }
    root.add(scoopGroup);

    this.scene.add(root);
    this.stepObjects.roll = { root, pressArm, clothBall, mainBag, samplePellets };
  }

  /* -----------------------------------------------------------------------
     STEP 5 SCENE: 05 焙籠乾燥 — 細編竹篾焙籠 + 焙窟炭火護網 + 半球茶乾
     ----------------------------------------------------------------------- */
  buildStep5Roast() {
    const root = new THREE.Group();

    // Recessed brick/iron charcoal hearth on workshop floor
    const hearthCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.38, 0.32, 24),
      this.toonMat(0x3a4347)
    );
    hearthCollar.position.y = 0.16;
    hearthCollar.castShadow = true;
    addToonOutline(hearthCollar, 1.03);
    root.add(hearthCollar);

    const emberDiscMat = new THREE.MeshBasicMaterial({ color: 0xe35c1e });
    const emberDisc = new THREE.Mesh(new THREE.CircleGeometry(0.95, 22), emberDiscMat);
    emberDisc.rotation.x = -Math.PI / 2;
    emberDisc.position.y = 0.33;
    root.add(emberDisc);

    // Fine hourglass woven bamboo roasting basket (細編竹篾焙籠)
    const roasterPoints = [
      new THREE.Vector2(1.22, 0.0),
      new THREE.Vector2(0.84, 0.82),
      new THREE.Vector2(0.84, 1.12),
      new THREE.Vector2(1.38, 1.96),
      new THREE.Vector2(1.31, 2.00),
      new THREE.Vector2(0.79, 1.12),
      new THREE.Vector2(0.79, 0.82),
      new THREE.Vector2(1.15, 0.0)
    ];
    const basketMesh = new THREE.Mesh(
      new THREE.LatheGeometry(roasterPoints, 32),
      new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xe2be88, gradientMap: this.gradientMap })
    );
    basketMesh.position.y = 0.30;
    basketMesh.castShadow = true;
    addToonOutline(basketMesh, 1.028);
    root.add(basketMesh);

    // Woven bamboo hoop bindings & side lift ears
    [0.32, 1.22, 2.26].forEach((hy, idx) => {
      const hr = idx === 1 ? 0.84 : idx === 0 ? 1.22 : 1.36;
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(hr, 0.045, 8, 28), this.toonMat(0x8a5629));
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = hy;
      root.add(hoop);
    });

    // Breathable roasting paper liner + 90 packed hemispherical pellets on top sieve
    const teaPaper = new THREE.Mesh(
      new THREE.CircleGeometry(1.22, 28),
      this.toonMat(0xf2ead7)
    );
    teaPaper.rotation.x = -Math.PI / 2;
    teaPaper.position.y = 1.94;
    root.add(teaPaper);

    const teaBed = new THREE.Group();
    teaBed.position.y = 2.01;
    const roastPellets = [];
    const pelletGeo = new THREE.SphereGeometry(0.105, 8, 6);
    for (let i = 0; i < 90; i++) {
      const a = i * 2.39996;
      const r = Math.sqrt(i / 90) * 1.08;
      const pMat = this.toonMat(0x4b7740);
      const pMesh = new THREE.Mesh(pelletGeo, pMat);
      pMesh.scale.set(1.12, 0.72, 0.96);
      pMesh.position.set(Math.cos(a) * r, (i % 4) * 0.025, Math.sin(a) * r);
      pMesh.rotation.y = a;
      pMesh.userData.mat = pMat;
      addToonOutline(pMesh, 1.06);
      roastPellets.push(pMesh);
      teaBed.add(pMesh);
    }
    root.add(teaBed);

    const vaporParticles = [];
    const vGeo = new THREE.SphereGeometry(0.11, 8, 6);
    for (let i = 0; i < 22; i++) {
      const vMat = new THREE.MeshBasicMaterial({ color: 0xfbf6ed, transparent: true, opacity: 0.55 });
      const vMesh = new THREE.Mesh(vGeo, vMat);
      vMesh.position.set((Math.random() - 0.5) * 1.5, 2.15 + Math.random() * 1.6, (Math.random() - 0.5) * 1.5);
      vMesh.userData = { speed: 0.7 + Math.random() * 0.55, mat: vMat };
      vaporParticles.push(vMesh);
      root.add(vMesh);
    }

    this.scene.add(root);
    this.stepObjects.roast = { root, basketMesh, emberDiscMat, roastPellets, vaporParticles };
  }

  /* -----------------------------------------------------------------------
     STEP 6 SCENE: 06 品茗完成 — 台灣工夫茶席（木茶盤 + 紫砂壺 + 白瓷品茗杯 + 賞茶則）
     ----------------------------------------------------------------------- */
  buildStep6Finale() {
    const root = new THREE.Group();
    const trayAssembly = new THREE.Group();
    trayAssembly.position.set(-0.68, 0, 0.08);

    // Slatted dark timber Gongfu Tea Tray (工夫木茶盤)
    const trayBase = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.22, 2.15), this.toonMat(0x47301f));
    trayBase.position.y = 0.11;
    trayBase.receiveShadow = true;
    addToonOutline(trayBase, 1.025);
    trayAssembly.add(trayBase);

    for (let s = -4; s <= 4; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.04, 0.16), this.toonMat(0x5e412c));
      slat.position.set(0, 0.24, s * 0.22);
      trayAssembly.add(slat);
    }

    // Classic Yixing Terracotta Teapot (紫砂壺) on Left
    const potGroup = new THREE.Group();
    potGroup.position.set(-0.88, 0.26, -0.05);
    potGroup.rotation.y = 0.35;
    const clayMat = this.toonMat(0x7c4530);

    const potPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.45, 0.0),
      new THREE.Vector2(0.68, 0.38),
      new THREE.Vector2(0.64, 0.76),
      new THREE.Vector2(0.36, 0.96),
      new THREE.Vector2(0.41, 1.02),
      new THREE.Vector2(0.35, 1.04)
    ];
    const potBody = new THREE.Mesh(new THREE.LatheGeometry(potPoints, 28), clayMat);
    potBody.castShadow = true;
    addToonOutline(potBody, 1.035);
    potGroup.add(potBody);

    const potLid = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.08, 22), clayMat);
    potLid.position.y = 1.05;
    potGroup.add(potLid);
    const potKnob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), clayMat);
    potKnob.position.y = 1.15;
    potGroup.add(potKnob);

    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.12, 0.56, 10), clayMat);
    spout.position.set(0.70, 0.65, 0);
    spout.rotation.z = -0.92;
    addToonOutline(spout, 1.05);
    potGroup.add(spout);

    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.055, 8, 18, Math.PI * 1.15), clayMat);
    handle.position.set(-0.62, 0.56, 0);
    handle.rotation.z = Math.PI * 0.42;
    potGroup.add(handle);
    trayAssembly.add(potGroup);

    // White Porcelain Tasting Cup (白瓷品茗杯) at front-center-right
    const cupGroup = new THREE.Group();
    cupGroup.position.set(0.55, 0.26, 0.28);
    const cupPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.34, 0.0),
      new THREE.Vector2(0.42, 0.14),
      new THREE.Vector2(0.66, 0.54),
      new THREE.Vector2(0.75, 0.92),
      new THREE.Vector2(0.68, 0.94),
      new THREE.Vector2(0.58, 0.55),
      new THREE.Vector2(0.36, 0.14),
      new THREE.Vector2(0.0, 0.12)
    ];
    const cupMesh = new THREE.Mesh(new THREE.LatheGeometry(cupPoints, 32), this.toonMat(0xf4f1ea));
    cupMesh.castShadow = true;
    addToonOutline(cupMesh, 1.035);
    cupGroup.add(cupMesh);

    const liquorMat = new THREE.MeshBasicMaterial({
      color: FINALE_OUTCOMES.light.liquorHex,
      transparent: true,
      opacity: 0.92
    });
    const liquorDisc = new THREE.Mesh(new THREE.CircleGeometry(0.66, 30), liquorMat);
    liquorDisc.rotation.x = -Math.PI / 2;
    liquorDisc.position.y = 0.86;
    cupGroup.add(liquorDisc);

    // Bamboo Tea Scoop Presentation Vessel (賞茶竹則) beside cup
    const teaPickTray = new THREE.Group();
    teaPickTray.position.set(1.22, 0.34, -0.45);
    teaPickTray.rotation.set(0.18, -0.35, 0);
    const scoopDish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.38, 0.10, 18),
      new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xdab27c, gradientMap: this.gradientMap })
    );
    scoopDish.scale.set(1.25, 1, 0.8);
    addToonOutline(scoopDish, 1.04);
    teaPickTray.add(scoopDish);

    const dryGeo = new THREE.SphereGeometry(0.075, 7, 5);
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(dryGeo, this.toonMat(0x284e34));
      const a = i * 2.4;
      const r = Math.sqrt(i / 12) * 0.28;
      p.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r * 0.72);
      teaPickTray.add(p);
    }
    trayAssembly.add(teaPickTray);

    // Gentle rising steam curls above cup
    const cupSteam = [];
    const sGeo = new THREE.SphereGeometry(0.11, 10, 8);
    for (let i = 0; i < 16; i++) {
      const sMat = new THREE.MeshBasicMaterial({ color: 0xfbf6ed, transparent: true, opacity: 0.42 });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set((Math.random() - 0.5) * 0.48, 0.98 + Math.random() * 1.5, (Math.random() - 0.5) * 0.48);
      sMesh.userData = { speed: 0.45 + Math.random() * 0.35, phase: Math.random() * Math.PI * 2, mat: sMat };
      cupSteam.push(sMesh);
      cupGroup.add(sMesh);
    }

    trayAssembly.add(cupGroup);
    root.add(trayAssembly);
    this.scene.add(root);
    this.stepObjects.finale = { root, cupAssembly: trayAssembly, liquorMat, cupSteam };
  }

  maybeLoadExternalGltfOverrides() {
    const entries = Object.entries(GLB_MODEL_PATHS).filter(([, path]) => Boolean(path));
    entries.forEach(([slot, path]) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const styled = applyToonStyleToGltf(gltf.scene, this.gradientMap);
          styled.name = 'glb_' + slot;
          if (slot === 'teaTray' && this.stepObjects.finale) {
            this.stepObjects.finale.cupAssembly.add(styled);
          }
        },
        undefined,
        () => {}
      );
    });
  }

  switchSceneGroup(idx) {
    if (!this.initialized) return;
    const ids = ['pluck', 'wither', 'panfire', 'roll', 'roast', 'finale'];
    const targetId = ids[idx];

    Object.entries(this.stepObjects).forEach(([key, obj]) => {
      if (obj && obj.root) {
        obj.root.visible = key === targetId;
      }
    });

    const isWorkshop = targetId === 'panfire' || targetId === 'roll' || targetId === 'roast';
    this.outdoorEnvGroup.visible = !isWorkshop;
    this.workshopEnvGroup.visible = isWorkshop;
    const bgHex = isWorkshop ? 0xe4dfd4 : 0xe6efee;
    this.scene.background.setHex(bgHex);
    this.scene.fog.color.setHex(bgHex);

    const camPresets = {
      pluck: { pos: [0.1, 2.75, 5.85], look: [0.05, 0.85, 0.15] },
      wither: { pos: [0.0, 2.25, 6.75], look: [0.0, 1.15, 0] },
      panfire: { pos: [-0.95, 2.45, 5.45], look: [0.15, 1.44, 0.05] },
      roll: { pos: [0.25, 2.95, 5.85], look: [0.25, 0.72, 0.15] },
      roast: { pos: [0, 3.05, 5.45], look: [0, 1.28, 0] },
      finale: { pos: [-0.72, 2.45, 5.55], look: [0.45, 0.65, 0.05] }
    };
    const preset = camPresets[targetId] || camPresets.pluck;
    this.camera.position.set(...preset.pos);
    this.camera.lookAt(...preset.look);

    if (targetId === 'finale' && this.stepObjects.finale) {
      const outcome = FINALE_OUTCOMES[this.roastOutcome];
      this.stepObjects.finale.liquorMat.color.setHex(outcome.liquorHex);
    }

    this.emberLight.intensity = (targetId === 'panfire' || targetId === 'roast') ? 2.4 : 0;
  }

  /* -----------------------------------------------------------------------
     UNIFIED POINTER GESTURES (Mouse + Touch via PointerEvents)
     ----------------------------------------------------------------------- */
  bindCanvasPointerEvents() {
    this.canvasShell.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvasShell.addEventListener('pointerdown', (e) => {
      this.sound.unlock();
      if (this.activePointerId !== null) return;
      this.activePointerId = e.pointerId;
      this.isDragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.canvasShell.classList.add('is-dragging');

      try {
        this.canvasShell.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if capture is unsupported
      }

      const stepId = STEPS[this.currentStepIdx].id;
      if (stepId === 'pluck') {
        this.tryPluckAtPointer(e);
      } else if (stepId === 'panfire') {
        this.triggerPanfireStir(0.55);
      } else if (stepId === 'roll') {
        this.lastRollAngle = this.computeCenterAngle(e.clientX, e.clientY);
        this.hideCircleGuide();
      } else if (stepId === 'roast') {
        this.setHoldingHeat(true);
      }
    });

    this.canvasShell.addEventListener('pointermove', (e) => {
      const stepId = STEPS[this.currentStepIdx].id;

      if (!this.isDragging) {
        if (stepId === 'pluck') {
          this.updateHoverCursor(e);
        }
        return;
      }
      if (e.pointerId !== this.activePointerId) return;

      const dx = e.clientX - this.lastPointerX;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (stepId === 'pluck') {
        this.tryPluckAtPointer(e);
      } else if (stepId === 'wither') {
        this.handleWitherSwingDelta(dx);
      } else if (stepId === 'panfire') {
        if (Math.abs(dx) > 4) {
          this.triggerPanfireStir(Math.min(1.0, Math.abs(dx) / 26));
        }
      } else if (stepId === 'roll') {
        this.handleRollGesture(e.clientX, e.clientY);
      } else if (stepId === 'finale') {
        this.finaleOrbitYaw += dx * 0.01;
      }
    });

    const releasePointer = (e) => {
      if (e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      this.isDragging = false;
      this.canvasShell.classList.remove('is-dragging');
      if (STEPS[this.currentStepIdx].id === 'roast') {
        this.setHoldingHeat(false);
      }
    };

    this.canvasShell.addEventListener('pointerup', releasePointer);
    this.canvasShell.addEventListener('pointercancel', releasePointer);
  }

  updatePointerNdc(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  updateHoverCursor(e) {
    if (!this.stepObjects.pluck) return;
    this.updatePointerNdc(e);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.stepObjects.pluck.hitTargets, false);
    const hitBud = hits.some((h) => h.object.userData.type === 'bud' && !h.object.userData.parentShoot.userData.picked);
    this.canvasShell.classList.toggle('is-pointer-target', hitBud);
  }

  tryPluckAtPointer(e) {
    const step = this.stepObjects.pluck;
    if (!step) return;
    this.updatePointerNdc(e);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(step.hitTargets, false);
    if (!hits.length) return;

    const hitData = hits[0].object.userData;
    const shoot = hitData.parentShoot;
    if (!shoot) return;

    if (hitData.type === 'bud' && !shoot.userData.picked) {
      this.collectSingleBud(shoot);
    } else if (hitData.type === 'oldLeaf') {
      shoot.userData.shakeTime = 0.45;
      this.sound.playOldLeafBrush();
      this.showToast('老葉纖維較粗！只採頂端鮮嫩的「一心二葉」喔', 'warn');
    }
  }

  collectSingleBud(shoot) {
    if (!shoot || shoot.userData.picked) return;
    shoot.userData.picked = true;
    shoot.userData.flying = true;
    shoot.userData.flyT = 0;
    this.stepObjects.pluck.flyingBuds.push(shoot);

    this.sound.playPluckSnap();
    this.spawnBurstParticles(shoot.position, 0x9ae465);
    this.pluckPicked = Math.min(this.pluckTotal, this.pluckPicked + 1);

    if (this.pluckPicked >= this.pluckTotal) {
      this.markStepComplete(0);
      this.sound.playSweetspotChime(false);
      this.showToast('採菁完成！已採收 5 株鮮嫩一心二葉進竹簍', 'success');
    } else {
      this.showToast(`成功採下嫩芽（${this.pluckPicked} / ${this.pluckTotal}）`, 'normal');
    }
    this.updateUI();
  }

  handleWitherSwingDelta(dx) {
    const absDx = Math.abs(dx);
    if (absDx < 3) return;

    const dir = Math.sign(dx);
    const dirReverseBonus = (this.lastMoveDir !== 0 && dir !== this.lastMoveDir) ? 1.85 : 0.75;
    this.lastMoveDir = dir;

    this.witherSwingTarget = THREE.MathUtils.clamp(this.witherSwingTarget + dx * 0.015, -0.56, 0.56);
    this.witherWaveEnergy = Math.min(1.0, this.witherWaveEnergy + absDx * 0.025);

    if (!this.completedSteps[1]) {
      this.witherProgress = Math.min(100, this.witherProgress + absDx * 0.12 * dirReverseBonus);
      if (this.witherProgress >= 100) {
        this.markStepComplete(1);
        this.sound.playSweetspotChime(false);
        this.showToast('遮雨棚走水完成！茶菁微顯紅邊、蘭花清香已甦醒', 'success');
      }
      this.updateUI();
    }
  }

  triggerPanfireStir(strength = 0.6) {
    this.drumSpinSpeed = Math.min(4.6, this.drumSpinSpeed + 2.2 * strength);
    if (this.completedSteps[2]) return;

    this.panfireTemp = Math.min(100, this.panfireTemp + 11 * strength);

    if (this.panfireTemp >= 55 && this.panfireTemp <= 88) {
      this.panfireProgress = Math.min(100, this.panfireProgress + 11 * strength);
      if (this.panfireProgress >= 100) {
        this.markStepComplete(2);
        this.sound.playSweetspotChime(true);
        this.showToast('滾筒殺菁完成！生青氣散盡、高山果膠已鎖住', 'success');
      }
    } else if (this.panfireTemp > 88) {
      this.showToast('火力稍猛，停半秒鐘讓滾筒均勻帶動避免焦邊！', 'warn');
    } else {
      this.showToast('繼續滑動加速滾筒旋轉，將鍋溫帶進 55%～85% 殺菁區', 'normal');
    }
    this.updateUI();
  }

  computeCenterAngle(clientX, clientY) {
    const rect = this.canvasShell.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  }

  hideCircleGuide() {
    if (this.circleGuideEl) {
      this.circleGuideEl.classList.remove('is-visible');
    }
  }

  handleRollGesture(clientX, clientY) {
    const angle = this.computeCenterAngle(clientX, clientY);
    let delta = angle - this.lastRollAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    this.lastRollAngle = angle;

    const absDelta = Math.abs(delta);
    if (absDelta < 0.004 || absDelta > 1.2) return;

    this.rollCrankAngle += delta * 1.45;
    this.rollSpinEnergy = Math.min(1.0, this.rollSpinEnergy + absDelta * 1.65);

    if (!this.completedSteps[3]) {
      this.rollProgress = Math.min(100, this.rollProgress + (absDelta / (Math.PI * 8)) * 100);
      if (this.rollProgress >= 100) {
        this.markStepComplete(3);
        this.sound.playSweetspotChime(false);
        this.showToast('布球團揉完成！竹箕裡的茶條已緊縮為飽滿半球顆粒', 'success');
      }
      this.updateUI();
    }
  }

  setHoldingHeat(holding) {
    if (this.currentStepIdx !== 4 || this.overheatCooldown > 0) {
      this.isHoldingHeat = false;
    } else {
      this.isHoldingHeat = holding;
    }
    if (this.holdBtnEl) {
      this.holdBtnEl.classList.toggle('is-holding', this.isHoldingHeat);
    }
  }

  finalizeRoastAndEnterFinale(allowDirectBrowse = false) {
    if (!allowDirectBrowse && this.roastProgress < 60) {
      this.showToast('請長按烘乾至至少 60%（輕焙清香區）以上再出焙', 'warn');
      return;
    }
    this.roastOutcome = this.roastProgress >= 79 ? 'roasted' : 'light';
    if (this.roastProgress >= 60) {
      this.markStepComplete(4);
    }
    this.markStepComplete(5);
    this.goToStep(5);
  }

  spawnBurstParticles(originPos, colorHex) {
    if (!this.scene) return;
    const geo = new THREE.OctahedronGeometry(0.07, 0);
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(originPos);
      const a = (i / 8) * Math.PI * 2;
      mesh.userData = {
        vx: Math.cos(a) * 1.3,
        vy: 1.8 + Math.random() * 1.1,
        vz: Math.sin(a) * 1.3,
        life: 0.65,
        mat
      };
      this.scene.add(mesh);
      this.activeParticles.push(mesh);
    }
  }

  updateSoundButtonUI() {
    if (!this.soundBtn) return;
    const muted = !this.sound.enabled;
    this.soundBtn.classList.toggle('is-muted', muted);
    this.soundBtn.setAttribute('aria-pressed', String(this.sound.enabled));
    if (this.soundLabelEl) {
      this.soundLabelEl.textContent = muted ? '音效：靜音' : '音效：開';
    }
  }

  /* -----------------------------------------------------------------------
     UI EVENTS & UN-GATED STATE MACHINE TRANSITIONS
     ----------------------------------------------------------------------- */
  bindUIEvents() {
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.sound.setEnabled(!this.sound.enabled);
        this.updateSoundButtonUI();
        this.showToast(this.sound.enabled ? '已開啟製茶擬音音效' : '已切換為靜音模式', 'normal');
      });
    }

    // Open access to every stage tab at any time (no prerequisite gate!)
    this.stepBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        this.sound.unlock();
        this.goToStep(idx);
      });
    });

    if (this.prevStepBtn) {
      this.prevStepBtn.addEventListener('click', () => {
        this.sound.unlock();
        if (this.currentStepIdx > 0) {
          this.goToStep(this.currentStepIdx - 1);
        }
      });
    }

    if (this.nextStepBtn) {
      this.nextStepBtn.addEventListener('click', () => {
        this.sound.unlock();
        if (this.currentStepIdx === 4) {
          this.finalizeRoastAndEnterFinale(true);
        } else if (this.currentStepIdx < STEPS.length - 1) {
          this.goToStep(this.currentStepIdx + 1);
        } else {
          this.goToStep(0);
        }
      });
    }

    if (this.resetStepBtn) {
      this.resetStepBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.resetCurrentStep();
      });
    }

    if (this.assistBtn) {
      this.assistBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.triggerAssistAction();
      });
    }

    if (this.holdBtnEl) {
      this.holdBtnEl.addEventListener('contextmenu', (e) => e.preventDefault());
      this.holdBtnEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.sound.unlock();
        this.setHoldingHeat(true);
      });
      const stopHold = () => this.setHoldingHeat(false);
      this.holdBtnEl.addEventListener('pointerup', stopHold);
      this.holdBtnEl.addEventListener('pointerleave', stopHold);
      this.holdBtnEl.addEventListener('pointercancel', stopHold);
    }

    if (this.confirmRoastBtn) {
      this.confirmRoastBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.finalizeRoastAndEnterFinale(false);
      });
    }

    if (this.continueRoastBtn) {
      this.continueRoastBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.showToast('請持續長按「長按文火焙茶」將火力烘至 79%~92% 熟香區', 'normal');
      });
    }

    if (this.finaleReplayBtn) {
      this.finaleReplayBtn.addEventListener('click', () => {
        this.sound.unlock();
        this.resetEntireExperience();
      });
    }
  }

  triggerAssistAction() {
    const id = STEPS[this.currentStepIdx].id;
    if (id === 'pluck' && this.stepObjects.pluck) {
      const nextBud = this.stepObjects.pluck.buds.find((b) => !b.userData.picked);
      if (nextBud) this.collectSingleBud(nextBud);
    } else if (id === 'wither') {
      this.witherSwingTarget = (this.lastMoveDir >= 0 ? -0.45 : 0.45);
      this.lastMoveDir = Math.sign(this.witherSwingTarget);
      this.witherWaveEnergy = 0.95;
      this.witherProgress = Math.min(100, this.witherProgress + 25);
      if (this.witherProgress >= 100) {
        this.markStepComplete(1);
        this.sound.playSweetspotChime(false);
        this.showToast('遮雨棚走水完成！茶菁微顯紅邊、蘭花清香已甦醒', 'success');
      }
      this.updateUI();
    } else if (id === 'panfire') {
      this.panfireTemp = 72;
      this.triggerPanfireStir(1.1);
    } else if (id === 'roll') {
      this.hideCircleGuide();
      this.rollCrankAngle += Math.PI * 2;
      this.rollSpinEnergy = 0.88;
      this.rollProgress = Math.min(100, this.rollProgress + 25);
      if (this.rollProgress >= 100) {
        this.markStepComplete(3);
        this.sound.playSweetspotChime(false);
        this.showToast('布球團揉完成！竹箕裡的茶條已緊縮為飽滿半球顆粒', 'success');
      }
      this.updateUI();
    } else if (id === 'roast') {
      this.roastProgress = this.roastProgress < 65 ? 70 : 85;
      if (this.roastProgress >= 60) this.markStepComplete(4);
      this.sound.playSweetspotChime(this.roastProgress >= 79);
      this.showToast(
        this.roastProgress >= 79
          ? '已烘至 85% 中度熟香區，可點選確認出焙或再重置體驗'
          : '已乾燥至 70% 輕焙清香區（含水量 <4%），可立即出焙或再長按轉熟香',
        'success'
      );
      this.updateUI();
    } else if (id === 'finale') {
      this.roastOutcome = this.roastOutcome === 'light' ? 'roasted' : 'light';
      if (this.stepObjects.finale) {
        this.stepObjects.finale.liquorMat.color.setHex(FINALE_OUTCOMES[this.roastOutcome].liquorHex);
      }
      this.sound.playTeaPour();
      this.updateUI();
    }
  }

  markStepComplete(idx) {
    this.completedSteps[idx] = true;
  }

  goToStep(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    this.currentStepIdx = idx;
    this.setHoldingHeat(false);
    this.rollSpinEnergy = 0;
    this.sound.muteAllContinuous();
    if (this.toastEl) {
      clearTimeout(this.toastTimer);
      this.toastEl.classList.remove('is-visible');
    }
    this.switchSceneGroup(idx);
    if (STEPS[idx].id === 'finale') {
      this.sound.playTeaPour();
    }
    this.updateUI();
  }

  resetCurrentStep() {
    const id = STEPS[this.currentStepIdx].id;
    this.completedSteps[this.currentStepIdx] = false;

    if (id === 'pluck' && this.stepObjects.pluck) {
      this.pluckPicked = 0;
      this.stepObjects.pluck.flyingBuds = [];
      this.stepObjects.pluck.harvestedInBasket.forEach((h) => { h.visible = false; });
      this.stepObjects.pluck.buds.forEach((b) => {
        b.userData.picked = false;
        b.userData.flying = false;
        b.position.copy(b.userData.originPos);
        b.scale.setScalar(1);
        b.rotation.set(0, b.userData.index * 0.85, 0);
        b.visible = true;
      });
    } else if (id === 'wither' && this.stepObjects.wither) {
      this.witherProgress = 0;
      this.witherSwingTarget = 0;
      this.witherSwingCurrent = 0;
      this.witherWaveEnergy = 0;
      this.stepObjects.wither.canopyLeaves.forEach((l) => l.userData.mat.color.setHex(0x7fd452));
    } else if (id === 'panfire') {
      this.panfireTemp = 32;
      this.panfireProgress = 0;
      this.drumSpinSpeed = 0.55;
    } else if (id === 'roll') {
      this.rollProgress = 0;
      this.rollCrankAngle = 0;
    } else if (id === 'roast') {
      this.roastProgress = 0;
      this.isHoldingHeat = false;
    }
    this.updateUI();
    this.showToast(`已重置「${STEPS[this.currentStepIdx].shortTitle}」關卡`, 'normal');
  }

  resetEntireExperience() {
    this.completedSteps = [false, false, false, false, false, false];
    this.roastOutcome = 'light';
    for (let i = 4; i >= 0; i--) {
      this.currentStepIdx = i;
      this.resetCurrentStep();
    }
    this.goToStep(0);
  }

  showToast(msg, variant = 'normal') {
    if (!this.toastEl) return;
    clearTimeout(this.toastTimer);
    this.toastEl.textContent = msg;
    this.toastEl.className = 'tea3d-toast is-visible';
    if (variant === 'warn') this.toastEl.classList.add('is-warn');
    if (variant === 'success') this.toastEl.classList.add('is-success');
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('is-visible');
    }, 2600);
  }

  /* -----------------------------------------------------------------------
     UI SYNCHRONIZATION
     ----------------------------------------------------------------------- */
  updateUI() {
    const step = STEPS[this.currentStepIdx];
    const isDone = this.completedSteps[this.currentStepIdx];

    // Step Nav Buttons (All freely accessible)
    this.stepBtns.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === this.currentStepIdx);
      btn.classList.toggle('is-done', this.completedSteps[i]);
      btn.setAttribute('aria-selected', String(i === this.currentStepIdx));
      const stateBadge = btn.querySelector('.tea3d-step-state');
      if (stateBadge) {
        if (this.completedSteps[i]) stateBadge.textContent = '已完成';
        else if (i === this.currentStepIdx) stateBadge.textContent = '體驗中';
        else stateBadge.textContent = '可體驗';
      }
    });

    if (this.badgeEl) this.badgeEl.textContent = step.badge;
    if (this.promptTextEl) this.promptTextEl.textContent = step.prompt;
    if (this.assistBtn) this.assistBtn.textContent = step.assistLabel;
    if (this.meterLabelEl) this.meterLabelEl.textContent = step.meterLabel;

    if (this.knowledgeTitleEl) this.knowledgeTitleEl.textContent = step.knowledgeTitle;
    if (this.knowledgeBodyEl) this.knowledgeBodyEl.textContent = step.knowledgeBody;
    if (this.knowledgeEffectEl) this.knowledgeEffectEl.textContent = step.knowledgeEffect;

    this.witherWrapEl.classList.remove('is-visible');
    this.panfireWrapEl.classList.remove('is-visible');
    this.holdWrapEl.classList.remove('is-visible');
    this.roastChoiceEl.classList.remove('is-visible');
    this.finalePanelEl.classList.remove('is-visible');
    this.bandLightEl.className = 'tea3d-sweetspot-band';
    this.bandDeepEl.className = 'tea3d-sweetspot-band';
    this.progressFillEl.className = 'tea3d-progress-fill';
    this.circleGuideEl.classList.remove('is-visible');

    let pct = 0;
    let countDisplay = '';
    let meterDisplay = '';

    if (step.id === 'pluck') {
      pct = (this.pluckPicked / this.pluckTotal) * 100;
      countDisplay = `已採收 ${this.pluckPicked} / ${this.pluckTotal}`;
      meterDisplay = `${this.pluckPicked} / ${this.pluckTotal} 株`;
    } else if (step.id === 'wither') {
      this.witherWrapEl.classList.add('is-visible');
      pct = this.witherProgress;
      const moisture = Math.round(78 - (pct / 100) * 16);
      countDisplay = isDone ? '走水與輕發酵完成' : `擺盪走水 ${Math.round(pct)}%`;
      meterDisplay = `${Math.round(pct)}%（含水率 ${moisture}%）`;
      if (this.witherStatusEl) {
        this.witherStatusEl.textContent = isDone
          ? `遮雨黑網防護中 ｜ 含水率降至 ${moisture}% · 茶菁微顯紅邊與蘭花清香`
          : `遮雨黑網防護中 ｜ 茶菁含水率：${moisture}%（左右拉動棚布擺盪讓葉片均勻消水）`;
      }
    } else if (step.id === 'panfire') {
      this.panfireWrapEl.classList.add('is-visible');
      this.bandLightEl.className = 'tea3d-sweetspot-band is-panfire';
      pct = this.panfireProgress;
      countDisplay = `殺菁進度 ${Math.round(this.panfireProgress)}%`;
      meterDisplay = `鎖鮮完成 ${Math.round(this.panfireProgress)}%`;
      if (this.panfireTemp > 86) this.progressFillEl.classList.add('is-hot');
      if (this.panfireTempEl) {
        this.panfireTempEl.textContent = `滾筒轉速與鍋溫指標：${Math.round(this.panfireTemp)}%（黃金殺菁區 55%～85% · 約 280°C）`;
      }
    } else if (step.id === 'roll') {
      if (this.rollProgress < 5 && !this.isDragging) {
        this.circleGuideEl.classList.add('is-visible');
      }
      pct = this.rollProgress;
      countDisplay = `團揉緊結 ${Math.round(this.rollProgress)}%`;
      meterDisplay = `${Math.round(this.rollProgress)}%`;
    } else if (step.id === 'roast') {
      this.holdWrapEl.classList.add('is-visible');
      this.bandLightEl.className = 'tea3d-sweetspot-band is-roast-light';
      this.bandDeepEl.className = 'tea3d-sweetspot-band is-roast-deep';
      pct = this.roastProgress;

      const moisture = this.roastProgress >= 60
        ? '< 4%（安全久存標準）'
        : `${Math.max(4, Math.round(58 - this.roastProgress * 0.9))}%`;
      if (this.roastMoistureEl) {
        this.roastMoistureEl.textContent = `茶葉含水量：${moisture} ｜ 輕焙區 60–78% · 熟香區 79–92%`;
      }

      if (this.roastProgress >= 60) {
        this.roastChoiceEl.classList.add('is-visible');
        const isDeep = this.roastProgress >= 79;
        if (this.roastChoiceHintEl) {
          this.roastChoiceHintEl.textContent = isDeep
            ? '目前火候：中度慢焙「熟香熟火烏龍」風味（琥珀橙金茶湯）'
            : '目前火候：輕焙清香「杉林溪春茶／冬茶」風味（蜜綠金黃茶湯）';
        }
        if (this.confirmRoastBtn) {
          this.confirmRoastBtn.textContent = isDeep
            ? '以熟香風味出焙品茗 →'
            : '以輕焙清香出焙品茗 →';
        }
        if (this.continueRoastBtn) {
          this.continueRoastBtn.hidden = isDeep;
        }
      }

      countDisplay = `乾燥焙火 ${Math.round(this.roastProgress)}%`;
      meterDisplay = `${Math.round(this.roastProgress)}%`;
    } else if (step.id === 'finale') {
      pct = 100;
      countDisplay = '工夫茶席展示';
      meterDisplay = '已完成體驗';
      this.finalePanelEl.classList.add('is-visible');
      const outcome = FINALE_OUTCOMES[this.roastOutcome];
      this.finaleTitleEl.textContent = outcome.title;
      this.finalePillEl.textContent = outcome.pillText;
      this.finaleDotEl.className = `tea3d-finale-dot ${outcome.dotClass}`;
      this.finaleDescEl.textContent = outcome.desc;
      this.finaleRecommendEl.textContent = '';
      const recStrong = document.createElement('strong');
      recStrong.textContent = outcome.recommendTitle;
      this.finaleRecommendEl.append('對應品項：', recStrong, outcome.recommendTail);
      this.finaleCtaEl.textContent = outcome.ctaText;
      this.finaleCtaEl.href = outcome.ctaHref;
    }

    if (this.countEl) this.countEl.textContent = countDisplay;
    if (this.meterValueEl) this.meterValueEl.textContent = meterDisplay;
    if (this.progressFillEl) {
      const clampedRatio = Math.min(1, Math.max(0, pct / 100));
      this.progressFillEl.style.transform = `scaleX(${clampedRatio})`;
      if (isDone) this.progressFillEl.classList.add('is-complete');
    }

    if (this.prevStepBtn) {
      this.prevStepBtn.hidden = this.currentStepIdx === 0;
    }

    if (this.nextStepBtn) {
      this.nextStepBtn.disabled = false;
      if (step.id === 'finale') {
        this.nextStepBtn.textContent = '回到第一關重看製程 ↺';
      } else if (step.id === 'roast') {
        const modeLabel = this.roastProgress >= 79 ? '熟香烏龍' : '輕焙清香';
        this.nextStepBtn.textContent = `直接前往下一關：品茗完成（${modeLabel}）→`;
        if (this.roastProgress >= 60) this.markStepComplete(4);
      } else {
        this.nextStepBtn.textContent = isDone
          ? `進入下一步：${STEPS[this.currentStepIdx + 1].shortTitle} →`
          : `直接前往下一關：${STEPS[this.currentStepIdx + 1].shortTitle} →`;
      }
    }
  }

  /* -----------------------------------------------------------------------
     ANIMATION & CONTINUOUS PHYSICS LOOP
     ----------------------------------------------------------------------- */
  startLoop() {
    if (this.rafId !== null || !this.renderer) return;
    this.clock.getDelta();
    const tick = () => {
      if (!this.isInView) {
        this.rafId = null;
        return;
      }
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.updateFrame(dt, this.clock.elapsedTime);
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    this.sound.muteAllContinuous();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  updateFrame(dt, elapsed) {
    // 1. Drifting outdoor mountain clouds
    if (this.outdoorEnvGroup && this.outdoorEnvGroup.visible && this.cloudMeshes) {
      this.cloudMeshes.forEach((c) => {
        c.position.x = c.userData.baseX + Math.sin(elapsed * 0.28 + c.userData.phase) * 0.65;
      });
    }

    // 2. Burst picking particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.userData.life -= dt;
      p.userData.vy -= 4.2 * dt;
      p.position.x += p.userData.vx * dt;
      p.position.y += p.userData.vy * dt;
      p.position.z += p.userData.vz * dt;
      p.userData.mat.opacity = Math.max(0, p.userData.life / 0.65);
      if (p.userData.life <= 0) {
        this.scene.remove(p);
        this.activeParticles.splice(i, 1);
      }
    }

    const stepId = STEPS[this.currentStepIdx].id;

    // Step 1: Plucking tender shoots parabolic arc into bamboo basket
    if (stepId === 'pluck' && this.stepObjects.pluck) {
      this.sound.updateContinuous('pluck', {});
      const { buds, oldLeaves, flyingBuds, basket, harvestedInBasket } = this.stepObjects.pluck;
      buds.forEach((b, idx) => {
        if (!b.userData.picked) {
          b.position.y = b.userData.originPos.y + Math.sin(elapsed * 2.4 + idx * 1.1) * 0.032;
          b.rotation.z = Math.sin(elapsed * 1.6 + idx) * 0.06;
        }
      });

      const targetPos = basket.position.clone().add(new THREE.Vector3(0, 0.48, 0));
      for (let i = flyingBuds.length - 1; i >= 0; i--) {
        const fb = flyingBuds[i];
        fb.userData.flyT = Math.min(1, fb.userData.flyT + dt * 2.2);
        const t = fb.userData.flyT;
        fb.position.lerpVectors(fb.userData.originPos, targetPos, t);
        fb.position.y += Math.sin(t * Math.PI) * 1.35;
        fb.rotation.x += dt * 7;
        fb.scale.setScalar(1 - t * 0.6);
        if (t >= 1) {
          fb.visible = false;
          const slotIdx = Math.min(harvestedInBasket.length - 1, fb.userData.index);
          if (harvestedInBasket[slotIdx]) harvestedInBasket[slotIdx].visible = true;
          this.sound.playBasketRustle();
          flyingBuds.splice(i, 1);
        }
      }

      oldLeaves.forEach((ol) => {
        if (ol.userData.shakeTime > 0) {
          ol.userData.shakeTime = Math.max(0, ol.userData.shakeTime - dt);
          ol.rotation.z = Math.sin(elapsed * 42) * 0.32;
        } else {
          ol.rotation.z = 0;
        }
      });
    }

    // Step 2: Rain-Canopy Swinging Tarp + Dynamic Wave Mesh + Tumbling Leaves
    if (stepId === 'wither' && this.stepObjects.wither) {
      const { tarpMesh, tarpBasePos, tarpW, leftBarGroup, rightBarGroup, ropes, canopyLeaves, aromaParticles } = this.stepObjects.wither;

      this.witherSwingTarget = THREE.MathUtils.lerp(this.witherSwingTarget, 0, dt * 2.2);
      this.witherSwingCurrent = THREE.MathUtils.lerp(this.witherSwingCurrent, this.witherSwingTarget, dt * 8.5);
      this.witherWaveEnergy = THREE.MathUtils.lerp(this.witherWaveEnergy, 0, dt * 2.8);
      this.witherWavePhase += dt * (4.0 + this.witherWaveEnergy * 7.5);

      const swingX = this.witherSwingCurrent;
      const swingLift = Math.abs(swingX) * 0.24;
      const waveAmp = 0.025 + this.witherWaveEnergy * 0.16;

      tarpMesh.position.x = swingX;
      tarpMesh.position.y = 0.86 + swingLift;

      // Update tarp vertices for realistic sag + wave ripple
      const posAttr = tarpMesh.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = tarpBasePos[i * 3];
        const u = bx / (tarpW * 0.5);
        const sag = -0.18 * (1 - u * u);
        const ripple = Math.sin(u * 3.1 - this.witherWavePhase) * waveAmp * (1 - Math.abs(u) * 0.45);
        posAttr.setY(i, sag + ripple);
      }
      posAttr.needsUpdate = true;
      tarpMesh.geometry.computeVertexNormals();

      // Update left/right pull bars & keep suspension ropes attached to posts
      leftBarGroup.position.set(swingX - tarpW * 0.5, 0.86 + swingLift, 0);
      rightBarGroup.position.set(swingX + tarpW * 0.5, 0.86 + swingLift, 0);
      leftBarGroup.rotation.z = -swingX * 0.25;
      rightBarGroup.rotation.z = -swingX * 0.25;

      const tmpEnd = new THREE.Vector3();
      const tmpMid = new THREE.Vector3();
      ropes.forEach((rp) => {
        tmpEnd.set(rp.bar.position.x, rp.bar.position.y, rp.endZ);
        const len = rp.post.distanceTo(tmpEnd);
        tmpMid.addVectors(rp.post, tmpEnd).multiplyScalar(0.5);
        rp.mesh.position.copy(tmpMid);
        rp.mesh.scale.set(1, len, 1);
        rp.mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          tmpEnd.clone().sub(rp.post).normalize()
        );
      });

      // Animate 64 tea shoots tossing & shifting color toward soft red-edged withering
      const progressRatio = this.witherProgress / 100;
      const freshGreen = new THREE.Color(0x7fd452);
      const oliveJade = new THREE.Color(0x528f45);
      const redMargin = new THREE.Color(0x9a6443);

      canopyLeaves.forEach((leaf) => {
        const lx = leaf.userData.baseX + swingX;
        const clothY = this.sampleTarpSurfaceY(lx, swingX, waveAmp, this.witherWavePhase) + swingLift;
        const hop = Math.max(0, Math.sin(this.witherWavePhase * 1.15 + leaf.userData.phase)) * this.witherWaveEnergy * 0.34;
        leaf.position.set(lx, clothY + 0.03 + hop, leaf.userData.baseZ);
        leaf.rotation.x = 0.08 + hop * 2.8;
        leaf.rotation.y = leaf.userData.baseYaw + Math.sin(this.witherWavePhase + leaf.userData.phase) * this.witherWaveEnergy * 0.7;

        const targetCol = leaf.userData.isRedEdge ? redMargin : oliveJade;
        leaf.userData.mat.color.copy(freshGreen).lerp(targetCol, progressRatio * 0.88);
      });

      // Floral aroma particles brighten as withering progresses
      const aromaOpacity = 0.14 + progressRatio * 0.65;
      aromaParticles.forEach((ap) => {
        ap.position.y += ap.userData.speed * dt;
        ap.position.x += Math.sin(elapsed * 2 + ap.userData.phase) * 0.25 * dt;
        if (ap.position.y > 2.65) ap.position.y = 0.95;
        ap.userData.mat.opacity = aromaOpacity;
      });

      // Real-time continuous tarp wind & tumbling leaf rustle sound
      this.sound.updateContinuous('wither', {
        waveEnergy: this.witherWaveEnergy,
        cascadeBeat: 0.4 + 0.6 * Math.abs(Math.sin(this.witherWavePhase))
      });
    }

    // Step 3: Horizontal Rotary Fixation Drum with Waterfall Tumbling Leaves Inside!
    if (stepId === 'panfire' && this.stepObjects.panfire) {
      const { drumGroup, drumLeaves, steamParticles, flameMats } = this.stepObjects.panfire;

      this.drumSpinSpeed = THREE.MathUtils.lerp(this.drumSpinSpeed, 0.72, dt * 1.4);
      drumGroup.rotation.z -= this.drumSpinSpeed * dt;

      if (!this.completedSteps[2]) {
        this.panfireTemp = Math.max(28, this.panfireTemp - dt * 5.0);
        if (this.panfireTempEl) {
          this.panfireTempEl.textContent = `滾筒轉速與鍋溫指標：${Math.round(this.panfireTemp)}%（黃金殺菁區 55%～85% · 約 280°C）`;
        }
      }

      this.emberLight.intensity = 1.6 + (this.panfireTemp / 100) * 2.4;
      flameMats.forEach((f) => {
        f.mat.color.setHex(this.panfireTemp > 86 ? 0xff491f : (this.panfireTemp > 54 ? 0x5eb8ff : 0xff8a3d));
        f.mesh.scale.y = 0.7 + (this.panfireTemp / 100) * 0.8 + Math.sin(elapsed * 18 + f.idx) * 0.14;
      });

      const freshGreen = new THREE.Color(0x63bd49);
      const jadeFixed = new THREE.Color(0x367d40);
      const fixRatio = this.panfireProgress / 100;

      drumLeaves.forEach((leaf) => {
        leaf.userData.mat.color.copy(freshGreen).lerp(jadeFixed, fixRatio);

        if (leaf.userData.mode === 'ride') {
          // Carried upward along inner rotating cylinder wall until release angle
          leaf.userData.angle -= this.drumSpinSpeed * dt;
          if (leaf.userData.angle < -Math.PI * 1.15) {
            leaf.userData.mode = 'fall';
            leaf.userData.fallX = Math.cos(leaf.userData.angle) * leaf.userData.radius;
            leaf.userData.fallY = Math.sin(leaf.userData.angle) * leaf.userData.radius;
            leaf.userData.fallVx = 0.45 + Math.random() * 0.35;
            leaf.userData.fallVy = -0.15;
          } else {
            leaf.position.set(
              Math.cos(leaf.userData.angle) * leaf.userData.radius,
              Math.sin(leaf.userData.angle) * leaf.userData.radius,
              leaf.userData.zSlot
            );
            leaf.rotation.set(0.3, 0, leaf.userData.angle + Math.PI * 0.5);
          }
        } else {
          // Waterfall tumble downward through drum interior back onto lower drum wall
          leaf.userData.fallVy -= 2.4 * dt;
          leaf.userData.fallX += leaf.userData.fallVx * dt;
          leaf.userData.fallY += leaf.userData.fallVy * dt;
          leaf.position.set(leaf.userData.fallX, leaf.userData.fallY, leaf.userData.zSlot);
          leaf.rotation.x += dt * (4.5 + this.drumSpinSpeed);
          leaf.rotation.y += dt * 3.8;

          const distSq = leaf.userData.fallX * leaf.userData.fallX + leaf.userData.fallY * leaf.userData.fallY;
          if (leaf.userData.fallY < -0.68 || distSq >= leaf.userData.radius * leaf.userData.radius) {
            leaf.userData.mode = 'ride';
            leaf.userData.angle = Math.atan2(leaf.userData.fallY, leaf.userData.fallX);
            if (leaf.userData.angle > 0.4) leaf.userData.angle -= Math.PI * 2;
          }
        }
      });

      steamParticles.forEach((sp) => {
        sp.position.y += sp.userData.speed * dt;
        sp.position.z += dt * 0.45;
        if (sp.position.y > 1.75) {
          sp.position.y = -0.25;
          sp.position.z = 1.25 + Math.random() * 0.45;
        }
        sp.userData.mat.color.copy(new THREE.Color(0xc5e4cc)).lerp(new THREE.Color(0xf4d47e), fixRatio);
        sp.userData.mat.opacity = 0.48 * (1 - fixRatio * 0.42);
      });

      const spinNorm = THREE.MathUtils.clamp((this.drumSpinSpeed - 0.5) / 3.8, 0, 1);
      const tempNorm = THREE.MathUtils.clamp((this.panfireTemp - 25) / 75, 0, 1);
      const cascadeBeat = 0.5 + 0.5 * Math.sin(drumGroup.rotation.z * 4);
      const sizzleLevel = this.panfireTemp >= 52 ? Math.min(1, (this.panfireTemp - 50) / 38) : 0;
      this.sound.updateContinuous('panfire', { spinNorm, cascadeBeat, tempNorm, sizzleLevel });
    }

    // Step 4: Flat Rolling Machine Crank Orbit + Morphing Tea Samples Inside Bamboo Scoop
    if (stepId === 'roll' && this.stepObjects.roll) {
      const { pressArm, mainBag, samplePellets } = this.stepObjects.roll;
      const p = this.rollProgress / 100;

      this.rollSpinEnergy = Math.max(0, this.rollSpinEnergy - dt * 2.1);
      pressArm.rotation.y = this.rollCrankAngle;
      const pulse = this.isDragging ? Math.sin(elapsed * 9) * 0.045 : 0;
      mainBag.scale.set(1.12 + pulse, 0.72 - pulse * 0.6, 1.12 + pulse);

      const stripColor = new THREE.Color(0x52a349);
      const pelletColor = new THREE.Color(0x234c2f);
      samplePellets.forEach((item) => {
        const sx = THREE.MathUtils.lerp(1.75, 0.88, p);
        const sy = THREE.MathUtils.lerp(0.28, 0.74, p);
        const sz = THREE.MathUtils.lerp(0.58, 0.88, p);
        item.scale.set(sx, sy, sz);
        item.userData.mat.color.copy(stripColor).lerp(pelletColor, p);
      });

      this.sound.updateContinuous('roll', { kneadEnergy: this.rollSpinEnergy });
    }

    // Step 5: Fine-Weave Bamboo Roaster Hold Heat & Moisture Evaporation
    if (stepId === 'roast' && this.stepObjects.roast) {
      if (this.overheatCooldown > 0) {
        this.overheatCooldown = Math.max(0, this.overheatCooldown - dt);
      }

      if (this.isHoldingHeat) {
        const prev = this.roastProgress;
        this.roastProgress = Math.min(100, this.roastProgress + dt * 21);

        this.charcoalCrackleTimer -= dt;
        if (this.charcoalCrackleTimer <= 0) {
          this.sound.playEmberCrackle();
          this.charcoalCrackleTimer = 0.16 + Math.random() * 0.28;
        }

        if (prev < 60 && this.roastProgress >= 60) {
          this.sound.playSweetspotChime(false);
          this.showToast('進入輕焙清香區（60%～78%）！放手即可出焙或續烘至熟香', 'success');
        } else if (prev < 79 && this.roastProgress >= 79) {
          this.sound.playSweetspotChime(true);
          this.showToast('進入中度熟香區（79%～92%）！堅果蜜香正在釋放', 'success');
        }

        if (this.roastProgress >= 95) {
          this.isHoldingHeat = false;
          this.overheatCooldown = 0.9;
          this.roastProgress = 72;
          if (this.holdBtnEl) this.holdBtnEl.classList.remove('is-holding');
          this.sound.playScorchWarn();
          this.showToast('哎呀！焙太久有點微焦，已退回 72% 請溫柔控火', 'warn');
        }
        this.updateUI();
      }

      this.sound.updateContinuous('roast', { isHoldingHeat: this.isHoldingHeat });

      const { basketMesh, emberDiscMat, roastPellets, vaporParticles } = this.stepObjects.roast;
      const p = this.roastProgress / 100;
      this.emberLight.intensity = (this.isHoldingHeat ? 3.4 : 1.4) + p * 1.5;
      emberDiscMat.color.setHex(this.isHoldingHeat ? 0xff9742 : 0xd6581e);

      basketMesh.position.x = this.overheatCooldown > 0 ? Math.sin(elapsed * 45) * 0.06 : 0;

      const wetGreen = new THREE.Color(0x4b7740);
      const lightGloss = new THREE.Color(0x1f3d28);
      const roastedAmber = new THREE.Color(0x4a311e);
      roastPellets.forEach((pel) => {
        if (p < 0.78) {
          pel.userData.mat.color.copy(wetGreen).lerp(lightGloss, p / 0.78);
        } else {
          pel.userData.mat.color.copy(lightGloss).lerp(roastedAmber, (p - 0.78) / 0.22);
        }
      });

      const vaporDensity = this.overheatCooldown > 0 ? 0.85 : Math.max(0.06, 0.72 * (1 - p * 0.95));
      vaporParticles.forEach((vp) => {
        vp.position.y += vp.userData.speed * (this.isHoldingHeat ? 1.6 : 0.8) * dt;
        if (vp.position.y > 4.0) vp.position.y = 2.05;
        vp.userData.mat.color.setHex(this.overheatCooldown > 0 ? 0x616668 : 0xfbf6ed);
        vp.userData.mat.opacity = vaporDensity;
      });
    }

    // Step 6: Gongfu Tea Tray Gentle Orbit & Steam
    if (stepId === 'finale' && this.stepObjects.finale) {
      this.sound.updateContinuous('finale', {});
      const { cupAssembly, cupSteam } = this.stepObjects.finale;
      if (!this.isDragging) {
        this.finaleOrbitYaw += dt * 0.22;
      }
      cupAssembly.rotation.y = this.finaleOrbitYaw;
      cupSteam.forEach((cs) => {
        cs.position.y += cs.userData.speed * dt;
        cs.position.x += Math.sin(elapsed * 1.8 + cs.userData.phase) * 0.16 * dt;
        if (cs.position.y > 2.6) cs.position.y = 0.98;
        const heightRatio = (cs.position.y - 0.98) / 1.62;
        cs.userData.mat.opacity = Math.max(0, 0.45 * (1 - heightRatio));
      });
    }
  }
}

/* =========================================================================
 *  Bootstrap + Safe Automation Hooks
 * ========================================================================= */
const rootSection = document.getElementById('tea-craft-3d');
if (rootSection) {
  const app = new TeaCraftExperience(rootSection);
  window.__TEA_3D_APP__ = {
    getState: () => ({
      initialized: app.initialized,
      isInView: app.isInView,
      currentStepIdx: app.currentStepIdx,
      currentStepId: STEPS[app.currentStepIdx].id,
      completedSteps: [...app.completedSteps],
      pluckPicked: app.pluckPicked,
      witherProgress: app.witherProgress,
      panfireProgress: app.panfireProgress,
      rollProgress: app.rollProgress,
      roastProgress: app.roastProgress,
      roastOutcome: app.roastOutcome,
      soundEnabled: app.sound.enabled,
      audioReady: app.sound.isReady()
    }),
    goToStep: (idx) => {
      app.ensureInitialized();
      app.goToStep(idx);
    },
    completeStepForTest: (idx, roastMode = 'light') => {
      app.ensureInitialized();
      app.markStepComplete(idx);
      if (idx === 0) app.pluckPicked = 5;
      if (idx === 1) app.witherProgress = 100;
      if (idx === 2) { app.panfireTemp = 72; app.panfireProgress = 100; }
      if (idx === 3) app.rollProgress = 100;
      if (idx === 4) {
        app.roastProgress = roastMode === 'roasted' ? 86 : 70;
        app.roastOutcome = roastMode === 'roasted' ? 'roasted' : 'light';
        app.markStepComplete(5);
      }
      app.goToStep(idx);
    },
    finalizeForTest: (roastMode = 'roasted') => {
      app.ensureInitialized();
      for (let i = 0; i < 6; i++) app.markStepComplete(i);
      app.roastProgress = roastMode === 'roasted' ? 86 : 70;
      app.roastOutcome = roastMode === 'roasted' ? 'roasted' : 'light';
      app.goToStep(5);
    }
  };
}
