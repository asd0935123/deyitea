import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * =========================================================================
 *  Blender 外部 .glb 模型預留替換設定表（Model Config & GLTF Slot Registry）
 * =========================================================================
 *  目前所有模型皆以 Three.js 基礎幾何體 + MeshToonMaterial 賽璐璐描邊手工組裝。
 *  日後若您從 Blender 匯出 .glb 模型，只需將檔案放入 assets/models/，
 *  並將下方對應鍵值從 null 改為檔案路徑（例如 'assets/models/tea-bush.glb'），
 *  本模組會透過 GLTFLoader 自動載入，並套用相同的繪本賽璐璐色階與描邊輪廓！
 */
const GLB_MODEL_PATHS = {
  teaBush: null,        // e.g. 'assets/models/tea-bush.glb'
  teaBud: null,         // e.g. 'assets/models/tea-bud.glb'
  bambooTray: null,     // e.g. 'assets/models/bamboo-tray.glb'
  witheringRack: null,  // e.g. 'assets/models/withering-rack.glb'
  firingWok: null,      // e.g. 'assets/models/firing-wok.glb'
  clothBall: null,      // e.g. 'assets/models/cloth-ball.glb'
  roastingBasket: null, // e.g. 'assets/models/roasting-basket.glb'
  teaCup: null          // e.g. 'assets/models/tea-cup.glb'
};

/**
 * 路線 A：與德億茶莊首頁完全同步的 5 道製茶工序 + 完成品茗結局定義
 */
const STEPS = [
  {
    id: 'pluck',
    shortTitle: '採菁',
    badge: '工序 壹 · 手工採菁',
    prompt: '點擊或滑過畫面上輕輕浮動的「一心二葉」嫩芽（共 5 株）採進竹簍，注意別點到深色老葉喔！',
    assistLabel: '輔助採摘一株',
    meterLabel: '採菁進度',
    knowledgeTitle: '01 · 採菁 — 離枝留嫩，只取一心二葉',
    knowledgeBody: '海拔 1,600 公尺杉林溪茶區，堅持清晨露水退去後手工採摘「一心二葉」嫩芽，維持葉片完整無損，保留最純淨的山頭氣。',
    knowledgeEffect: '葉片完整未壓傷，茶湯就能保持清澈透亮、喝起來不雜不澀。'
  },
  {
    id: 'wither',
    shortTitle: '萎凋浪菁',
    badge: '工序 貳 · 萎凋浪菁',
    prompt: '第一階段：在竹篩上左右快速來回滑動，讓茶菁均勻走水並帶出淡淡紅邊；接著調節室內靜置發酵度。',
    assistLabel: '輔助搖晃一次',
    meterLabel: '走水與輕發酵進度',
    knowledgeTitle: '02 · 萎凋浪菁 — 搖篩走水，喚醒蘭花香',
    knowledgeBody: '透過雙手搖晃竹篩讓葉緣輕微摩擦走水，再於室內靜置控制約 20%～30% 的黃金輕發酵區間，孕育出杉林溪烏龍獨有的清雅蘭花香與甘醇喉韻。',
    knowledgeEffect: '走水與發酵拿捏均勻，熱水沖下去才會香氣上揚而不悶不青。'
  },
  {
    id: 'panfire',
    shortTitle: '炒菁',
    badge: '工序 參 · 高溫炒菁',
    prompt: '在炒菁鍋上快速左右撥炒或節奏點擊！將火力維持在黃金殺菁高溫區，蒸散生青草氣、鎖住高山果膠。',
    assistLabel: '輔助翻炒一次',
    meterLabel: '殺菁鎖鮮進度',
    knowledgeTitle: '03 · 炒菁 — 適溫止酵，去掉生青草味',
    knowledgeBody: '在發酵恰到好處的瞬間以高溫翻炒停止酵素作用，徹底去除生青味並妥善留住茶葉中的翠綠果膠與甘甜。',
    knowledgeEffect: '決定一杯烏龍「青不青、甜不甜」的分水嶺，也是耐泡甜度的來源。'
  },
  {
    id: 'roll',
    shortTitle: '揉捻',
    badge: '工序 肆 · 布球團揉',
    prompt: '在布球周圍用手指或滑鼠「畫圈轉動」，把鬆散的條狀茶葉逐步揉緊成飽滿半球型烏龍茶粒。',
    assistLabel: '輔助揉捻一圈',
    meterLabel: '團揉緊結度',
    knowledgeTitle: '04 · 揉捻 — 反覆團揉，鎖汁成半球顆粒',
    knowledgeBody: '將茶葉裹入棉布反覆壓揉整形，把茶汁緊鎖於葉表並揉成飽滿勻稱的半球型顆粒，造就連泡六至八次依然厚實的烏龍茶乾。',
    knowledgeEffect: '顆粒緊實勻稱，才能第一泡慢慢舒展、越泡喉韻越飽滿。'
  },
  {
    id: 'roast',
    shortTitle: '乾燥焙火',
    badge: '工序 伍 · 文火乾燥焙火',
    prompt: '長按「長按文火焙茶」按鈕（或長按畫布）控火乾燥！停在 60%~78% 可取輕焙清香，烘至 79%~92% 則得熟香熟果韻（過頭會微焦喔）。',
    assistLabel: '一鍵穩火烘乾',
    meterLabel: '焙火與乾燥度',
    knowledgeTitle: '05 · 乾燥焙火 — 降水量至 4% 以下，決定春冬清香或熟香韻',
    knowledgeBody: '文火慢烘降低含水量並封存山林香氣；輕焙保留春茶冬茶的清揚花果香，中度慢焙則轉化出溫潤熟香烏龍的堅果蜜香，久存不變質。',
    knowledgeEffect: '您可以自由決定出焙火候，這會直接改變最後端上桌的茶湯色澤與風味！'
  },
  {
    id: 'finale',
    shortTitle: '品茗完成',
    badge: '完成品茗 · 山頭茶湯上桌',
    prompt: '恭喜完成五道工序！可左右拖曳茶杯細細欣賞湯色與熱氣，或直接預約試茶與詢價這批茶品。',
    assistLabel: '切換看另一種湯色',
    meterLabel: '整體製茶完成度',
    knowledgeTitle: '品茗時刻 — 喝之前，您已親手讀懂這包茶',
    knowledgeBody: '從海拔 1,600 公尺清晨的一心二葉，歷經走水、炒菁、團揉到文火收乾，每一泡茶湯都是時間與手藝的總和。',
    knowledgeEffect: '歡迎預約來德億茶莊鹿谷門市坐下品茗，或透過下方連結直接將剛剛做好的這款茶帶入詢價表單。'
  }
];

/**
 * 雙結局資料設定（保留真實產品規格，絕不捏造價格與獎項）
 */
const FINALE_OUTCOMES = {
  light: {
    title: '杉林溪清香高山烏龍 · 輕焙完成',
    pillText: '湯色：蜜綠金黃',
    dotClass: 'is-light',
    liquorHex: 0xd8c958,
    rimHex: 0xede68c,
    desc: '您選擇在輕焙清香區出焙，茶葉保留極高的天然花香與果膠鮮甜，茶湯蜜綠金黃透亮、入口清雅回甘。',
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
    rimHex: 0xe39e56,
    desc: '您以耐心慢火焙至中度熟香區，轉化出堅果蜜香與熟果溫潤甜韻，茶湯琥珀橙金、不苦不澀且不刺激腸胃。',
    recommendTitle: '杉林溪 · 熟香熟火烏龍',
    recommendTail: '（四兩 150g 真空裝）',
    ctaText: '預約試茶／詢價熟香烏龍 ↗',
    ctaHref: 'index.html?tea=roasted#contact'
  }
};

/**
 * 產生賽璐璐（Toon）四階漸層貼圖
 */
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
 * 程式繪製暖木竹編紋理 CanvasTexture（避免外部圖片依賴）
 */
function createBambooWeaveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d9b583';
  ctx.fillRect(0, 0, 256, 256);

  const step = 32;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      const even = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = even ? '#c79b64' : '#e2c598';
      ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
      ctx.strokeStyle = '#8b6236';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, step - 2, step - 2);
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
 * 建立主體物件之 Inverted Hull 柔和描邊
 */
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

/**
 * 供日後載入外部 .glb 模型後，自動套用插畫 Toon 材質與描邊的工具函式
 */
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
    this.assistBtn = sectionEl.querySelector('#tea3d-assist-btn');
    this.resetStepBtn = sectionEl.querySelector('#tea3d-reset-step-btn');
    this.toastEl = sectionEl.querySelector('#tea3d-toast');
    this.circleGuideEl = sectionEl.querySelector('#tea3d-circle-guide');

    this.meterLabelEl = sectionEl.querySelector('#tea3d-meter-label');
    this.meterValueEl = sectionEl.querySelector('#tea3d-meter-value');
    this.progressFillEl = sectionEl.querySelector('#tea3d-progress-fill');
    this.bandLightEl = sectionEl.querySelector('#tea3d-band-primary');
    this.bandDeepEl = sectionEl.querySelector('#tea3d-band-secondary');

    this.sliderWrapEl = sectionEl.querySelector('#tea3d-slider-wrap');
    this.fermentSliderEl = sectionEl.querySelector('#tea3d-ferment-slider');
    this.fermentReadoutEl = sectionEl.querySelector('#tea3d-ferment-readout');

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
    this.nextStepBtn = sectionEl.querySelector('#tea3d-next-btn');

    // Runtime & Lifecycle State
    this.initialized = false;
    this.isInView = false;
    this.rafId = null;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
    this.gltfLoader = new GLTFLoader();

    // Shared Interactive Craft State
    this.currentStepIdx = 0;
    this.maxUnlockedIdx = 0;
    this.completedSteps = [false, false, false, false, false, false];
    this.roastOutcome = 'light'; // 'light' | 'roasted'

    // Per-Step Interactive State
    this.pluckPicked = 0;
    this.pluckTotal = 5;
    this.witherPhase = 'shake'; // 'shake' -> 'ferment'
    this.witherShakeProgress = 0;
    this.fermentLevel = 8; // 0-50
    this.fermentHoldTimer = 0;

    this.panfireTemp = 32; // sweet spot 55-85
    this.panfireProgress = 0;

    this.rollProgress = 0; // 0-100
    this.roastProgress = 0; // 0-100
    this.isHoldingHeat = false;
    this.overheatCooldown = 0;

    // Pointer Gesture State
    this.activePointerId = null;
    this.isDragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.lastMoveDir = 0;
    this.lastRollAngle = 0;
    this.finaleOrbitYaw = 0.2;

    this.toastTimer = null;
    this.stepObjects = {};
    this.activeParticles = [];

    this.bindUIEvents();
    this.observeVisibility();
    this.updateUI();
  }

  observeVisibility() {
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
    this.scene.fog = new THREE.FogExp2(0xe4eceb, 0.025);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 80);
    this.camera.position.set(0, 3.6, 7.6);
    this.camera.lookAt(0, 0.5, 0);

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
    this.bambooTex = createBambooWeaveTexture();

    this.setupLightingAndBackdrop();
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

  setupLightingAndBackdrop() {
    const hemi = new THREE.HemisphereLight(0xfbf6ed, 0x3b636b, 1.05);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff5e4, 1.45);
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

    const rim = new THREE.DirectionalLight(0xd99559, 0.48);
    rim.position.set(-5, 4, -4);
    this.scene.add(rim);

    // Warm charcoal / wok point light (activated in Step 3 & Step 5)
    this.emberLight = new THREE.PointLight(0xff7d2b, 0, 10);
    this.emberLight.position.set(0, 0.45, 0.5);
    this.scene.add(this.emberLight);

    // Ground meadow platform
    const groundMat = new THREE.MeshToonMaterial({ color: 0xc2d5c9, gradientMap: this.gradientMap });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9, 0.5, 40), groundMat);
    ground.position.y = -0.35;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Subtle Shanlinxi distant mountain ridges & drifting mist ribbons
    this.mistGroup = new THREE.Group();
    const mountainColors = [0x9fb8bc, 0x7c9ca2, 0x5c7f89];
    const ridgeConfigs = [
      { x: -5.5, y: 0.9, z: -11, r: 4.4, h: 4.5, c: mountainColors[0] },
      { x: 0.4, y: 1.4, z: -13, r: 5.5, h: 5.8, c: mountainColors[1] },
      { x: 6.2, y: 0.8, z: -10.5, r: 4.2, h: 4.2, c: mountainColors[0] },
      { x: -2.2, y: 0.5, z: -8.5, r: 3.4, h: 3.2, c: mountainColors[2] },
      { x: 3.6, y: 0.5, z: -8.8, r: 3.6, h: 3.4, c: mountainColors[2] }
    ];
    ridgeConfigs.forEach((cfg) => {
      const mat = new THREE.MeshToonMaterial({ color: cfg.c, gradientMap: this.gradientMap });
      const peak = new THREE.Mesh(new THREE.ConeGeometry(cfg.r, cfg.h, 7), mat);
      peak.position.set(cfg.x, cfg.y, cfg.z);
      peak.rotation.y = cfg.x * 0.3;
      this.mistGroup.add(peak);
    });

    // Soft floating mountain clouds
    this.cloudMeshes = [];
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfbf6ed, transparent: true, opacity: 0.65 });
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Group();
      for (let j = 0; j < 3; j++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.65 - j * 0.12, 12, 10), cloudMat);
        s.scale.set(1.6, 0.55, 0.8);
        s.position.set((j - 1) * 0.65, (j % 2) * 0.14, 0);
        puff.add(s);
      }
      puff.position.set(-6 + i * 2.5, 2.7 + (i % 2) * 0.7, -7.2 - (i % 3) * 1.4);
      puff.userData.baseX = puff.position.x;
      puff.userData.phase = i * 1.1;
      this.cloudMeshes.push(puff);
      this.mistGroup.add(puff);
    }
    this.scene.add(this.mistGroup);
  }

  toonMat(color, extra = {}) {
    return new THREE.MeshToonMaterial({
      color,
      gradientMap: this.gradientMap,
      ...extra
    });
  }

  buildTeaShootGroup(isBud = true) {
    const group = new THREE.Group();
    const stemMat = this.toonMat(isBud ? 0x6ea645 : 0x2d4f38);
    const leafMat = this.toonMat(isBud ? 0x7fd152 : 0x284e36, { side: THREE.DoubleSide });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, isBud ? 0.52 : 0.42, 8), stemMat);
    stem.position.y = 0.22;
    group.add(stem);

    // Central pointed tip bud
    const tipGeo = new THREE.ConeGeometry(isBud ? 0.095 : 0.13, isBud ? 0.44 : 0.32, 7);
    const tip = new THREE.Mesh(tipGeo, this.toonMat(isBud ? 0x9ae465 : 0x2a5239));
    tip.position.y = isBud ? 0.62 : 0.45;
    addToonOutline(tip, 1.07);
    group.add(tip);

    // Left & right sculpted curved tea leaves
    const leafGeo = new THREE.SphereGeometry(isBud ? 0.22 : 0.28, 10, 8);
    leafGeo.scale(0.55, 1.55, 0.22);

    const leftLeaf = new THREE.Mesh(leafGeo, leafMat);
    leftLeaf.position.set(-0.22, 0.42, 0.04);
    leftLeaf.rotation.set(0.2, 0.25, 0.78);
    addToonOutline(leftLeaf, 1.06);
    group.add(leftLeaf);

    const rightLeaf = new THREE.Mesh(leafGeo, leafMat);
    rightLeaf.position.set(0.22, 0.36, -0.04);
    rightLeaf.rotation.set(-0.18, -0.25, -0.82);
    addToonOutline(rightLeaf, 1.06);
    group.add(rightLeaf);

    // Larger invisible hit collider for forgiving mobile tapping
    const hitGeo = new THREE.SphereGeometry(0.54, 10, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 0.42;
    group.add(hitMesh);

    return { group, hitMesh, tip, leftLeaf, rightLeaf };
  }

  buildAllStepScenes() {
    this.buildStep1Pluck();
    this.buildStep2Wither();
    this.buildStep3Panfire();
    this.buildStep4Roll();
    this.buildStep5Roast();
    this.buildStep6Finale();
  }

  /* -----------------------------------------
     STEP 1 SCENE: 採菁 (Tea Bushes + 5 Tender Buds + Basket)
     ----------------------------------------- */
  buildStep1Pluck() {
    const root = new THREE.Group();

    // Terraced tea hedge bushes
    const bushGroup = new THREE.Group();
    const moundMat = this.toonMat(0x2f5e41);
    const bushPositions = [
      { x: -1.35, y: 0.55, z: -0.25, s: 1.25 },
      { x: -0.35, y: 0.72, z: 0.15, s: 1.45 },
      { x: 0.65, y: 0.58, z: -0.2, s: 1.28 },
      { x: -0.95, y: 0.45, z: 0.75, s: 1.05 },
      { x: 0.2, y: 0.42, z: 0.85, s: 1.1 }
    ];
    bushPositions.forEach((b) => {
      const geo = new THREE.IcosahedronGeometry(0.75 * b.s, 1);
      const mesh = new THREE.Mesh(geo, moundMat);
      mesh.scale.set(1.25, 0.85, 1.05);
      mesh.position.set(b.x, b.y, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      addToonOutline(mesh, 1.035);
      bushGroup.add(mesh);
    });
    root.add(bushGroup);

    // Woven Picking Bamboo Basket on right
    const basket = new THREE.Group();
    basket.position.set(2.35, 0.55, 0.45);
    const basketGeo = new THREE.CylinderGeometry(0.72, 0.46, 0.95, 16, 1, false);
    const basketMat = new THREE.MeshToonMaterial({
      color: 0xd9b17b,
      map: this.bambooTex,
      gradientMap: this.gradientMap
    });
    const basketBody = new THREE.Mesh(basketGeo, basketMat);
    basketBody.castShadow = true;
    addToonOutline(basketBody, 1.045);
    basket.add(basketBody);

    const rimTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.055, 8, 24),
      this.toonMat(0xa56d38)
    );
    rimTorus.rotation.x = Math.PI / 2;
    rimTorus.position.y = 0.47;
    basket.add(rimTorus);

    // Dark interior recess
    const innerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.66, 20),
      this.toonMat(0x5d4123)
    );
    innerDisc.rotation.x = -Math.PI / 2;
    innerDisc.position.y = 0.42;
    basket.add(innerDisc);
    root.add(basket);

    // 5 interactive tender "one-bud two-leaves" targets
    const budCoords = [
      new THREE.Vector3(-1.55, 1.15, 0.15),
      new THREE.Vector3(-0.85, 1.38, -0.15),
      new THREE.Vector3(-0.22, 1.46, 0.48),
      new THREE.Vector3(0.45, 1.32, 0.18),
      new THREE.Vector3(-0.35, 1.08, 1.02)
    ];

    const buds = [];
    const hitTargets = [];
    budCoords.forEach((pos, idx) => {
      const shoot = this.buildTeaShootGroup(true);
      shoot.group.position.copy(pos);
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

    // 6 mature dark leaves (penalty wobble if clicked by mistake)
    const oldLeafCoords = [
      new THREE.Vector3(-1.85, 0.85, 0.6),
      new THREE.Vector3(-1.12, 0.92, 0.92),
      new THREE.Vector3(0.1, 1.0, 0.98),
      new THREE.Vector3(0.95, 0.95, 0.35),
      new THREE.Vector3(-0.62, 1.2, -0.58),
      new THREE.Vector3(0.75, 1.12, -0.45)
    ];
    const oldLeaves = [];
    oldLeafCoords.forEach((pos, idx) => {
      const oldShoot = this.buildTeaShootGroup(false);
      oldShoot.group.position.copy(pos);
      oldShoot.group.rotation.y = idx * 0.9;
      oldShoot.group.userData = { type: 'oldLeaf', shakeTime: 0 };
      oldShoot.hitMesh.userData = { parentShoot: oldShoot.group, type: 'oldLeaf' };
      oldLeaves.push(oldShoot.group);
      hitTargets.push(oldShoot.hitMesh);
      root.add(oldShoot.group);
    });

    this.scene.add(root);
    this.stepObjects.pluck = { root, basket, buds, oldLeaves, hitTargets, flyingBuds: [] };
  }

  /* -----------------------------------------
     STEP 2 SCENE: 萎凋浪菁 (Shaking Bamboo Tray -> Indoor Withering Rack)
     ----------------------------------------- */
  buildStep2Wither() {
    const root = new THREE.Group();

    // Stage A: Bamboo Shaking Sieve
    const trayGroup = new THREE.Group();
    trayGroup.position.set(0, 1.15, 0);

    const trayRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.14, 12, 36),
      this.toonMat(0xaf743b)
    );
    trayRim.rotation.x = Math.PI / 2;
    trayRim.castShadow = true;
    addToonOutline(trayRim, 1.03);
    trayGroup.add(trayRim);

    const trayWall = new THREE.Mesh(
      new THREE.CylinderGeometry(2.14, 2.04, 0.34, 36, 1, true),
      this.toonMat(0xc7955b, { side: THREE.DoubleSide })
    );
    trayWall.position.y = -0.14;
    trayGroup.add(trayWall);

    const trayBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.04, 2.04, 0.08, 36),
      new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xe3c898, gradientMap: this.gradientMap })
    );
    trayBase.position.y = -0.26;
    trayBase.receiveShadow = true;
    trayGroup.add(trayBase);

    // 26 curled leaves on tray
    const trayLeaves = [];
    const leafGeo = new THREE.SphereGeometry(0.24, 8, 6);
    leafGeo.scale(1.4, 0.22, 0.75);
    for (let i = 0; i < 26; i++) {
      const ang = i * 2.39996;
      const rad = 0.28 + Math.sqrt(i / 26) * 1.48;
      const mat = this.toonMat(0x70be4d);
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.position.set(Math.cos(ang) * rad, -0.12 + (i % 3) * 0.03, Math.sin(ang) * rad);
      leaf.rotation.set((i % 5) * 0.12, ang, (i % 3) * 0.15);
      leaf.userData = {
        baseX: leaf.position.x,
        baseY: leaf.position.y,
        baseZ: leaf.position.z,
        phase: i * 0.7,
        mat
      };
      addToonOutline(leaf, 1.08);
      trayLeaves.push(leaf);
      trayGroup.add(leaf);
    }
    root.add(trayGroup);

    // Stage B: Indoor Wooden Withering Rack
    const rackGroup = new THREE.Group();
    rackGroup.visible = false;
    const poleMat = this.toonMat(0x78502c);
    [[-1.6, -1.0], [1.6, -1.0], [-1.6, 1.0], [1.6, 1.0]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 10), poleMat);
      post.position.set(px, 1.15, pz);
      addToonOutline(post, 1.05);
      rackGroup.add(post);
    });

    const rackLeaves = [];
    [0.55, 1.25, 1.95].forEach((tierY, tierIdx) => {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 0.08, 2.1),
        new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xdec08e, gradientMap: this.gradientMap })
      );
      shelf.position.set(0, tierY, 0);
      addToonOutline(shelf, 1.02);
      rackGroup.add(shelf);

      for (let j = 0; j < 10; j++) {
        const lMat = this.toonMat(0x63ae48);
        const lMesh = new THREE.Mesh(leafGeo, lMat);
        lMesh.position.set(-1.15 + (j % 5) * 0.56, tierY + 0.09, -0.45 + Math.floor(j / 5) * 0.9);
        lMesh.rotation.y = (j + tierIdx) * 0.65;
        lMesh.userData.mat = lMat;
        rackLeaves.push(lMesh);
        rackGroup.add(lMesh);
      }
    });

    // Floating Orchid Floral Aroma Particles for Step 2 Phase B
    const aromaGroup = new THREE.Group();
    const aromaParticles = [];
    const aromaColors = [0xf7b9c4, 0xf2d479, 0xfbf6ed];
    const pGeo = new THREE.OctahedronGeometry(0.08, 0);
    for (let k = 0; k < 28; k++) {
      const pMat = new THREE.MeshBasicMaterial({ color: aromaColors[k % 3], transparent: true, opacity: 0 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set((Math.random() - 0.5) * 2.8, 0.5 + Math.random() * 1.9, (Math.random() - 0.5) * 1.8);
      pMesh.userData = { speed: 0.4 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2, mat: pMat };
      aromaParticles.push(pMesh);
      aromaGroup.add(pMesh);
    }
    rackGroup.add(aromaGroup);
    root.add(rackGroup);

    this.scene.add(root);
    this.stepObjects.wither = { root, trayGroup, trayLeaves, rackGroup, rackLeaves, aromaParticles };
  }

  /* -----------------------------------------
     STEP 3 SCENE: 炒菁 (Slanted Firing Wok + Hearth + Leaves + Grass-Steam)
     ----------------------------------------- */
  buildStep3Panfire() {
    const root = new THREE.Group();

    // Brick-teal traditional tea stove base
    const hearth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 2.05, 1.05, 18),
      this.toonMat(0x3a545f)
    );
    hearth.position.set(0, 0.35, 0);
    hearth.castShadow = true;
    addToonOutline(hearth, 1.03);
    root.add(hearth);

    // Hearth glowing fire mouth
    const fireGlowMat = new THREE.MeshBasicMaterial({ color: 0xff8a3d });
    const fireWindow = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.36, 0.15), fireGlowMat);
    fireWindow.position.set(0, 0.25, 1.88);
    root.add(fireWindow);

    // Cast-iron tilted firing pan (Lathe bowl)
    const wokPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.85, 0.12),
      new THREE.Vector2(1.45, 0.45),
      new THREE.Vector2(1.85, 0.95),
      new THREE.Vector2(1.94, 0.92),
      new THREE.Vector2(1.52, 0.38),
      new THREE.Vector2(0.88, 0.05),
      new THREE.Vector2(0.0, -0.05)
    ];
    const wokMesh = new THREE.Mesh(
      new THREE.LatheGeometry(wokPoints, 28),
      this.toonMat(0x28333a)
    );
    wokMesh.position.set(0, 0.85, 0);
    wokMesh.rotation.x = 0.22;
    addToonOutline(wokMesh, 1.03);
    root.add(wokMesh);

    // Stir-fried leaves inside wok
    const wokLeavesGroup = new THREE.Group();
    wokLeavesGroup.position.set(0, 1.18, 0.1);
    const wokLeaves = [];
    const leafGeo = new THREE.SphereGeometry(0.18, 8, 6);
    leafGeo.scale(1.3, 0.25, 0.8);
    for (let i = 0; i < 24; i++) {
      const a = i * 2.4;
      const r = 0.2 + Math.sqrt(i / 24) * 1.15;
      const mat = this.toonMat(0x5cb847);
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.position.set(Math.cos(a) * r, (i % 3) * 0.05, Math.sin(a) * r * 0.85);
      leaf.rotation.set(Math.random(), a, Math.random());
      leaf.userData = { baseY: leaf.position.y, jumpVel: 0, mat };
      addToonOutline(leaf, 1.08);
      wokLeaves.push(leaf);
      wokLeavesGroup.add(leaf);
    }
    root.add(wokLeavesGroup);

    // Rising raw-grass steam turning into warm gold aroma
    const steamParticles = [];
    const steamGeo = new THREE.SphereGeometry(0.12, 8, 6);
    for (let i = 0; i < 20; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xb9dec2, transparent: true, opacity: 0.45 });
      const p = new THREE.Mesh(steamGeo, mat);
      p.position.set((Math.random() - 0.5) * 1.8, 1.3 + Math.random() * 1.6, (Math.random() - 0.5) * 1.4);
      p.userData = { speed: 0.6 + Math.random() * 0.6, mat };
      steamParticles.push(p);
      root.add(p);
    }

    this.scene.add(root);
    this.stepObjects.panfire = { root, wokMesh, wokLeaves, fireGlowMat, steamParticles };
  }

  /* -----------------------------------------
     STEP 4 SCENE: 揉捻 (Cloth Ball Kneading + 24 Morphing Leaves)
     ----------------------------------------- */
  buildStep4Roll() {
    const root = new THREE.Group();

    // Bamboo kneading mat
    const matDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.42, 0.14, 36),
      new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xe3c595, gradientMap: this.gradientMap })
    );
    matDisc.position.y = 0.05;
    matDisc.receiveShadow = true;
    addToonOutline(matDisc, 1.025);
    root.add(matDisc);

    // Central tied cream cloth ball (布球團揉)
    const clothGroup = new THREE.Group();
    clothGroup.position.set(0, 0.95, 0);

    const clothMat = this.toonMat(0xf4eee1);
    const mainBag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 2), clothMat);
    mainBag.scale.set(1.06, 0.88, 1.06);
    mainBag.castShadow = true;
    addToonOutline(mainBag, 1.045);
    clothGroup.add(mainBag);

    // Top gathered knot & copper binding rope
    const topFrill = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 10), clothMat);
    topFrill.position.y = 0.92;
    topFrill.rotation.z = Math.PI;
    addToonOutline(topFrill, 1.05);
    clothGroup.add(topFrill);

    const ropeBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.06, 8, 20),
      this.toonMat(0xc8834b)
    );
    ropeBand.rotation.x = Math.PI / 2;
    ropeBand.position.y = 0.72;
    clothGroup.add(ropeBand);
    root.add(clothGroup);

    // 24 outer tea leaves that transform from long strips -> plump hemispherical pellets
    const morphLeaves = [];
    const stripGeo = new THREE.SphereGeometry(0.16, 8, 6);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = 1.45 + (i % 2) * 0.3;
      const mMat = this.toonMat(0x4e9947);
      const leaf = new THREE.Mesh(stripGeo, mMat);
      leaf.position.set(Math.cos(a) * r, 0.24, Math.sin(a) * r);
      leaf.scale.set(1.85, 0.28, 0.65);
      leaf.rotation.y = a + Math.PI / 2;
      leaf.userData = { angle: a, baseRadius: r, mat: mMat };
      addToonOutline(leaf, 1.08);
      morphLeaves.push(leaf);
      root.add(leaf);
    }

    this.scene.add(root);
    this.stepObjects.roll = { root, clothGroup, mainBag, morphLeaves };
  }

  /* -----------------------------------------
     STEP 5 SCENE: 乾燥焙火 (Hourglass Bamboo Roaster + Glowing Embers + Vapor)
     ----------------------------------------- */
  buildStep5Roast() {
    const root = new THREE.Group();

    // Charcoal burner pan at bottom
    const burnerPan = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 0.95, 0.28, 24),
      this.toonMat(0x28353c)
    );
    burnerPan.position.y = 0.14;
    addToonOutline(burnerPan, 1.04);
    root.add(burnerPan);

    const emberDiscMat = new THREE.MeshBasicMaterial({ color: 0xe35c1e });
    const emberDisc = new THREE.Mesh(new THREE.CircleGeometry(0.88, 20), emberDiscMat);
    emberDisc.rotation.x = -Math.PI / 2;
    emberDisc.position.y = 0.29;
    root.add(emberDisc);

    // Traditional hourglass woven bamboo roasting basket (焙籠)
    const roasterPoints = [
      new THREE.Vector2(1.25, 0.0),
      new THREE.Vector2(0.86, 0.85),
      new THREE.Vector2(0.86, 1.15),
      new THREE.Vector2(1.38, 1.98),
      new THREE.Vector2(1.31, 2.02),
      new THREE.Vector2(0.80, 1.15),
      new THREE.Vector2(0.80, 0.85),
      new THREE.Vector2(1.18, 0.0)
    ];
    const basketMesh = new THREE.Mesh(
      new THREE.LatheGeometry(roasterPoints, 28),
      new THREE.MeshToonMaterial({ map: this.bambooTex, color: 0xdab27c, gradientMap: this.gradientMap })
    );
    basketMesh.position.y = 0.25;
    basketMesh.castShadow = true;
    addToonOutline(basketMesh, 1.03);
    root.add(basketMesh);

    // Bamboo hoops
    [0.27, 1.18, 2.22].forEach((hy, idx) => {
      const hr = idx === 1 ? 0.86 : idx === 0 ? 1.25 : 1.35;
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(hr, 0.05, 8, 28), this.toonMat(0x8e592b));
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = hy;
      root.add(hoop);
    });

    // Tea pellets bed resting inside upper tray of roaster
    const teaBed = new THREE.Group();
    teaBed.position.y = 1.95;
    const roastPellets = [];
    const pelletGeo = new THREE.SphereGeometry(0.14, 8, 6);
    for (let i = 0; i < 28; i++) {
      const a = i * 2.4;
      const r = Math.sqrt(i / 28) * 1.02;
      const pMat = this.toonMat(0x4b7740);
      const pMesh = new THREE.Mesh(pelletGeo, pMat);
      pMesh.scale.set(1.15, 0.78, 1.0);
      pMesh.position.set(Math.cos(a) * r, (i % 3) * 0.04, Math.sin(a) * r);
      pMesh.userData.mat = pMat;
      addToonOutline(pMesh, 1.08);
      roastPellets.push(pMesh);
      teaBed.add(pMesh);
    }
    root.add(teaBed);

    // Rising moisture vapor particles
    const vaporParticles = [];
    const vGeo = new THREE.SphereGeometry(0.11, 8, 6);
    for (let i = 0; i < 22; i++) {
      const vMat = new THREE.MeshBasicMaterial({ color: 0xfbf6ed, transparent: true, opacity: 0.55 });
      const vMesh = new THREE.Mesh(vGeo, vMat);
      vMesh.position.set((Math.random() - 0.5) * 1.5, 2.1 + Math.random() * 1.7, (Math.random() - 0.5) * 1.5);
      vMesh.userData = { speed: 0.7 + Math.random() * 0.55, mat: vMat };
      vaporParticles.push(vMesh);
      root.add(vMesh);
    }

    this.scene.add(root);
    this.stepObjects.roast = { root, basketMesh, emberDiscMat, roastPellets, vaporParticles };
  }

  /* -----------------------------------------
     STEP 6 SCENE: 完成品茗 (Porcelain Tea Cup + Saucer + Glowing Liquor + Steam)
     ----------------------------------------- */
  buildStep6Finale() {
    const root = new THREE.Group();
    const cupAssembly = new THREE.Group();

    // Warm dark timber tray saucer
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.78, 1.58, 0.16, 36),
      this.toonMat(0x523926)
    );
    saucer.position.y = 0.08;
    saucer.receiveShadow = true;
    addToonOutline(saucer, 1.03);
    cupAssembly.add(saucer);

    // Handcrafted celadon-cream teacup (LatheGeometry)
    const cupPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.56, 0.0),
      new THREE.Vector2(0.62, 0.16),
      new THREE.Vector2(0.95, 0.72),
      new THREE.Vector2(1.06, 1.28),
      new THREE.Vector2(0.96, 1.3),
      new THREE.Vector2(0.84, 0.74),
      new THREE.Vector2(0.52, 0.18),
      new THREE.Vector2(0.0, 0.14)
    ];
    const cupMesh = new THREE.Mesh(
      new THREE.LatheGeometry(cupPoints, 32),
      this.toonMat(0xf4f1ea)
    );
    cupMesh.position.y = 0.16;
    cupMesh.castShadow = true;
    addToonOutline(cupMesh, 1.035);
    cupAssembly.add(cupMesh);

    // Glowing Oolong Tea Liquor surface (color updates with roast outcome!)
    const liquorMat = new THREE.MeshBasicMaterial({
      color: FINALE_OUTCOMES.light.liquorHex,
      transparent: true,
      opacity: 0.92
    });
    const liquorDisc = new THREE.Mesh(new THREE.CircleGeometry(0.93, 32), liquorMat);
    liquorDisc.rotation.x = -Math.PI / 2;
    liquorDisc.position.y = 1.24;
    cupAssembly.add(liquorDisc);

    // Decorative specimen tea leaf resting beside saucer
    const sideShoot = this.buildTeaShootGroup(true);
    sideShoot.group.position.set(-1.35, 0.25, 0.88);
    sideShoot.group.rotation.set(1.25, 0.5, 0.4);
    sideShoot.group.scale.setScalar(0.82);
    cupAssembly.add(sideShoot.group);

    // Rising gentle steam curls above cup
    const steamGroup = new THREE.Group();
    const cupSteam = [];
    const sGeo = new THREE.SphereGeometry(0.14, 10, 8);
    for (let i = 0; i < 16; i++) {
      const sMat = new THREE.MeshBasicMaterial({ color: 0xfbf6ed, transparent: true, opacity: 0.42 });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set((Math.random() - 0.5) * 0.7, 1.35 + Math.random() * 1.9, (Math.random() - 0.5) * 0.7);
      sMesh.userData = { speed: 0.45 + Math.random() * 0.35, phase: Math.random() * Math.PI * 2, mat: sMat };
      cupSteam.push(sMesh);
      steamGroup.add(sMesh);
    }
    cupAssembly.add(steamGroup);

    root.add(cupAssembly);
    this.scene.add(root);
    this.stepObjects.finale = { root, cupAssembly, liquorMat, cupSteam };
  }

  /**
   * 預留之外部 .glb 載入器：若 GLB_MODEL_PATHS 有設定真實檔案路徑即會自動載入替換
   */
  maybeLoadExternalGltfOverrides() {
    const entries = Object.entries(GLB_MODEL_PATHS).filter(([, path]) => Boolean(path));
    entries.forEach(([slot, path]) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const styled = applyToonStyleToGltf(gltf.scene, this.gradientMap);
          styled.name = 'glb_' + slot;
          // Custom mount hook per slot when real .glb files are provided
          if (slot === 'teaCup' && this.stepObjects.finale) {
            this.stepObjects.finale.cupAssembly.add(styled);
          }
        },
        undefined,
        () => {
          // Keep built-in procedural toon geometry silently on load error
        }
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

    // Camera framing per craft station
    const camPresets = {
      pluck: { pos: [0.3, 3.3, 6.4], look: [0.25, 0.85, 0.1] },
      wither: { pos: [0, 3.9, 6.2], look: [0, 1.0, 0] },
      panfire: { pos: [0, 3.6, 5.8], look: [0, 1.0, 0] },
      roll: { pos: [0, 3.8, 5.8], look: [0, 0.6, 0] },
      roast: { pos: [0, 3.4, 5.9], look: [0, 1.3, 0] },
      finale: { pos: [-0.8, 2.7, 5.2], look: [0.2, 0.8, 0] }
    };
    const preset = camPresets[targetId] || camPresets.pluck;
    this.camera.position.set(...preset.pos);
    this.camera.lookAt(...preset.look);

    if (targetId === 'wither' && this.stepObjects.wither) {
      const showTray = this.witherPhase === 'shake';
      this.stepObjects.wither.trayGroup.visible = showTray;
      this.stepObjects.wither.rackGroup.visible = !showTray;
    }

    if (targetId === 'finale' && this.stepObjects.finale) {
      const outcome = FINALE_OUTCOMES[this.roastOutcome];
      this.stepObjects.finale.liquorMat.color.setHex(outcome.liquorHex);
    }

    this.emberLight.intensity = (targetId === 'panfire' || targetId === 'roast') ? 2.4 : 0;
  }

  /* -----------------------------------------
     UNIFIED POINTER GESTURES (Mouse + Touch)
     ----------------------------------------- */
  bindCanvasPointerEvents() {
    this.canvasShell.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvasShell.addEventListener('pointerdown', (e) => {
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
      } else if (stepId === 'wither' && this.witherPhase === 'shake') {
        this.handleWitherShakeDelta(dx);
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
      this.showToast('只取最嫩的一心二葉喔！老葉口感較澀', 'warn');
    }
  }

  collectSingleBud(shoot) {
    if (!shoot || shoot.userData.picked) return;
    shoot.userData.picked = true;
    shoot.userData.flying = true;
    shoot.userData.flyT = 0;
    this.stepObjects.pluck.flyingBuds.push(shoot);

    this.spawnBurstParticles(shoot.position, 0x9ae465);
    this.pluckPicked = Math.min(this.pluckTotal, this.pluckPicked + 1);

    if (this.pluckPicked >= this.pluckTotal) {
      this.markStepComplete(0);
      this.showToast('採菁完成！已備妥鮮嫩一心二葉，請點下方進入下一步', 'success');
    } else {
      this.showToast(`成功採下嫩芽（${this.pluckPicked} / ${this.pluckTotal}）`, 'normal');
    }
    this.updateUI();
  }

  handleWitherShakeDelta(dx) {
    if (this.completedSteps[1]) return;
    const absDx = Math.abs(dx);
    if (absDx < 4) return;

    const dir = Math.sign(dx);
    const bonus = (this.lastMoveDir !== 0 && dir !== this.lastMoveDir) ? 1.8 : 0.7;
    this.lastMoveDir = dir;

    const tray = this.stepObjects.wither.trayGroup;
    tray.rotation.z = THREE.MathUtils.clamp(-dx * 0.015, -0.35, 0.35);
    tray.position.x = THREE.MathUtils.clamp(dx * 0.02, -0.55, 0.55);

    this.witherShakeProgress = Math.min(100, this.witherShakeProgress + (absDx * 0.16 * bonus));

    // Shift leaves from fresh green toward warm slight red-tinted edge look
    const ratio = this.witherShakeProgress / 100;
    this.stepObjects.wither.trayLeaves.forEach((leaf, idx) => {
      const green = new THREE.Color(0x70be4d);
      const redEdge = new THREE.Color(idx % 2 === 0 ? 0x629b50 : 0x996d49);
      leaf.userData.mat.color.copy(green).lerp(redEdge, ratio * 0.85);
      leaf.position.y = leaf.userData.baseY + Math.abs(Math.sin(performance.now() * 0.02 + idx)) * 0.18;
    });

    if (this.witherShakeProgress >= 100) {
      this.witherPhase = 'ferment';
      this.stepObjects.wither.trayGroup.visible = false;
      this.stepObjects.wither.rackGroup.visible = true;
      this.showToast('浪菁走水完成！現在請拖曳下方滑桿調整輕發酵至 20%～30%', 'success');
    }
    this.updateUI();
  }

  triggerPanfireStir(strength = 0.6) {
    if (this.completedSteps[2]) return;
    this.panfireTemp = Math.min(100, this.panfireTemp + 11 * strength);

    // Bounce wok leaves physically
    if (this.stepObjects.panfire) {
      this.stepObjects.panfire.wokLeaves.forEach((leaf, i) => {
        leaf.userData.jumpVel = 0.08 + ((i % 4) * 0.025) * strength;
      });
    }

    if (this.panfireTemp >= 55 && this.panfireTemp <= 88) {
      this.panfireProgress = Math.min(100, this.panfireProgress + 10 * strength);
      if (this.panfireProgress >= 100) {
        this.markStepComplete(2);
        this.showToast('高溫炒菁成功！青氣已去、鮮甜果膠鎖住', 'success');
      }
    } else if (this.panfireTemp > 88) {
      this.showToast('火力稍猛，停半秒鐘翻勻避免炒焦！', 'warn');
    } else {
      this.showToast('再翻快一點，讓鍋溫升到綠色黃金殺菁區（55%～85%）', 'normal');
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
    if (this.completedSteps[3]) return;
    const angle = this.computeCenterAngle(clientX, clientY);
    let delta = angle - this.lastRollAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    this.lastRollAngle = angle;

    const absDelta = Math.abs(delta);
    if (absDelta < 0.004 || absDelta > 1.2) return;

    // 4 full rotations -> 100%
    this.rollProgress = Math.min(100, this.rollProgress + (absDelta / (Math.PI * 8)) * 100);
    if (this.stepObjects.roll) {
      this.stepObjects.roll.clothGroup.rotation.y += delta * 1.4;
    }

    if (this.rollProgress >= 100) {
      this.markStepComplete(3);
      this.showToast('布球團揉完成！鬆散茶條已塑形為緊實半球顆粒', 'success');
    }
    this.updateUI();
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

  finalizeRoastAndEnterFinale() {
    if (this.roastProgress < 60) {
      this.showToast('請長按烘乾至至少 60%（輕焙清香區）以上再出焙', 'warn');
      return;
    }
    this.roastOutcome = this.roastProgress >= 79 ? 'roasted' : 'light';
    this.markStepComplete(4);
    this.markStepComplete(5);
    this.goToStep(5);
  }

  spawnBurstParticles(originPos, colorHex) {
    if (!this.scene) return;
    const geo = new THREE.OctahedronGeometry(0.075, 0);
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

  /* -----------------------------------------
     UI EVENTS & STATE MACHINE TRANSITIONS
     ----------------------------------------- */
  bindUIEvents() {
    this.stepBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (idx <= this.maxUnlockedIdx) {
          this.goToStep(idx);
        } else {
          this.showToast('請先完成目前的製茶工序，才能解鎖下一道步驟', 'warn');
        }
      });
    });

    if (this.nextStepBtn) {
      this.nextStepBtn.addEventListener('click', () => {
        if (this.currentStepIdx < STEPS.length - 1 && this.completedSteps[this.currentStepIdx]) {
          this.goToStep(this.currentStepIdx + 1);
        }
      });
    }

    if (this.resetStepBtn) {
      this.resetStepBtn.addEventListener('click', () => this.resetCurrentStep());
    }

    if (this.assistBtn) {
      this.assistBtn.addEventListener('click', () => this.triggerAssistAction());
    }

    if (this.fermentSliderEl) {
      this.fermentSliderEl.addEventListener('input', () => {
        this.fermentLevel = Number(this.fermentSliderEl.value);
        this.fermentHoldTimer = 0;
        this.updateUI();
      });
    }

    if (this.holdBtnEl) {
      this.holdBtnEl.addEventListener('contextmenu', (e) => e.preventDefault());
      this.holdBtnEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.setHoldingHeat(true);
      });
      const stopHold = () => this.setHoldingHeat(false);
      this.holdBtnEl.addEventListener('pointerup', stopHold);
      this.holdBtnEl.addEventListener('pointerleave', stopHold);
      this.holdBtnEl.addEventListener('pointercancel', stopHold);
    }

    if (this.confirmRoastBtn) {
      this.confirmRoastBtn.addEventListener('click', () => this.finalizeRoastAndEnterFinale());
    }

    if (this.continueRoastBtn) {
      this.continueRoastBtn.addEventListener('click', () => {
        this.showToast('請持續長按「長按文火焙茶」將火力烘至 79%~92% 熟香區', 'normal');
      });
    }

    if (this.finaleReplayBtn) {
      this.finaleReplayBtn.addEventListener('click', () => this.resetEntireExperience());
    }
  }

  triggerAssistAction() {
    const id = STEPS[this.currentStepIdx].id;
    if (id === 'pluck' && this.stepObjects.pluck) {
      const nextBud = this.stepObjects.pluck.buds.find((b) => !b.userData.picked);
      if (nextBud) this.collectSingleBud(nextBud);
    } else if (id === 'wither') {
      if (this.witherPhase === 'shake') {
        this.handleWitherShakeDelta((this.lastMoveDir >= 0 ? -1 : 1) * 58);
      } else {
        this.fermentLevel = 25;
        if (this.fermentSliderEl) this.fermentSliderEl.value = '25';
        this.fermentHoldTimer = 1.25;
        this.markStepComplete(1);
        this.showToast('已調整至 25% 黃金輕發酵區，高山蘭花香已甦醒！', 'success');
        this.updateUI();
      }
    } else if (id === 'panfire') {
      this.panfireTemp = 70;
      this.triggerPanfireStir(1.2);
    } else if (id === 'roll') {
      this.hideCircleGuide();
      this.rollProgress = Math.min(100, this.rollProgress + 25);
      if (this.rollProgress >= 100) {
        this.markStepComplete(3);
        this.showToast('布球團揉完成！鬆散茶條已塑形為緊實半球顆粒', 'success');
      }
      this.updateUI();
    } else if (id === 'roast') {
      this.roastProgress = this.roastProgress < 65 ? 70 : 85;
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
      this.updateUI();
    }
  }

  markStepComplete(idx) {
    this.completedSteps[idx] = true;
    this.maxUnlockedIdx = Math.max(this.maxUnlockedIdx, Math.min(STEPS.length - 1, idx + 1));
  }

  goToStep(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    this.currentStepIdx = idx;
    this.setHoldingHeat(false);
    if (this.toastEl) {
      clearTimeout(this.toastTimer);
      this.toastEl.classList.remove('is-visible');
    }
    this.switchSceneGroup(idx);
    this.updateUI();
  }

  resetCurrentStep() {
    const id = STEPS[this.currentStepIdx].id;
    this.completedSteps[this.currentStepIdx] = false;

    if (id === 'pluck' && this.stepObjects.pluck) {
      this.pluckPicked = 0;
      this.stepObjects.pluck.flyingBuds = [];
      this.stepObjects.pluck.buds.forEach((b) => {
        b.userData.picked = false;
        b.userData.flying = false;
        b.position.copy(b.userData.originPos);
        b.scale.setScalar(1);
        b.visible = true;
      });
    } else if (id === 'wither' && this.stepObjects.wither) {
      this.witherPhase = 'shake';
      this.witherShakeProgress = 0;
      this.fermentLevel = 8;
      this.fermentHoldTimer = 0;
      if (this.fermentSliderEl) this.fermentSliderEl.value = '8';
      this.stepObjects.wither.trayGroup.visible = true;
      this.stepObjects.wither.rackGroup.visible = false;
      this.stepObjects.wither.trayLeaves.forEach((l) => l.userData.mat.color.setHex(0x70be4d));
    } else if (id === 'panfire') {
      this.panfireTemp = 32;
      this.panfireProgress = 0;
    } else if (id === 'roll') {
      this.rollProgress = 0;
    } else if (id === 'roast') {
      this.roastProgress = 0;
      this.isHoldingHeat = false;
    }
    this.updateUI();
    this.showToast(`已重置「${STEPS[this.currentStepIdx].shortTitle}」關卡`, 'normal');
  }

  resetEntireExperience() {
    this.completedSteps = [false, false, false, false, false, false];
    this.maxUnlockedIdx = 0;
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

  /* -----------------------------------------
     UI SYNCHRONIZATION
     ----------------------------------------- */
  updateUI() {
    const step = STEPS[this.currentStepIdx];
    const isDone = this.completedSteps[this.currentStepIdx];

    // Step Nav Buttons
    this.stepBtns.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === this.currentStepIdx);
      btn.classList.toggle('is-done', this.completedSteps[i]);
      btn.setAttribute('aria-selected', String(i === this.currentStepIdx));
      const stateBadge = btn.querySelector('.tea3d-step-state');
      if (stateBadge) {
        if (this.completedSteps[i]) stateBadge.textContent = '已完成';
        else if (i === this.currentStepIdx) stateBadge.textContent = '進行中';
        else if (i <= this.maxUnlockedIdx) stateBadge.textContent = '可開始';
        else stateBadge.textContent = '待解鎖';
      }
    });

    if (this.badgeEl) this.badgeEl.textContent = step.badge;
    if (this.promptTextEl) this.promptTextEl.textContent = step.prompt;
    if (this.assistBtn) this.assistBtn.textContent = step.assistLabel;
    if (this.meterLabelEl) this.meterLabelEl.textContent = step.meterLabel;

    // Knowledge card
    if (this.knowledgeTitleEl) this.knowledgeTitleEl.textContent = step.knowledgeTitle;
    if (this.knowledgeBodyEl) this.knowledgeBodyEl.textContent = step.knowledgeBody;
    if (this.knowledgeEffectEl) this.knowledgeEffectEl.textContent = step.knowledgeEffect;

    // Hide all step-specific control subbars first
    this.sliderWrapEl.classList.remove('is-visible');
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
      if (this.witherPhase === 'shake') {
        pct = this.witherShakeProgress * 0.5;
        countDisplay = `階段 1/2 · 搖篩走水 ${Math.round(this.witherShakeProgress)}%`;
        meterDisplay = `${Math.round(pct)}%`;
        if (this.promptTextEl) {
          this.promptTextEl.textContent = '階段一：在竹篩上左右快速滑動搖晃茶葉，讓葉緣輕微走水顯出微微紅邊！';
        }
      } else {
        this.sliderWrapEl.classList.add('is-visible');
        this.bandLightEl.className = 'tea3d-sweetspot-band is-ferment';
        pct = isDone ? 100 : 50 + (this.fermentLevel / 50) * 50;
        const inGolden = this.fermentLevel >= 20 && this.fermentLevel <= 30;
        countDisplay = isDone ? '輕發酵完成' : `階段 2/2 · 發酵度 ${this.fermentLevel}%`;
        meterDisplay = inGolden ? `${this.fermentLevel}%（黃金輕發酵區）` : `${this.fermentLevel}%（目標 20%～30%）`;
        if (this.fermentReadoutEl) {
          this.fermentReadoutEl.textContent = inGolden
            ? `目前發酵程度：${this.fermentLevel}% — 已進入黃金輕發酵區，保持穩定中⋯`
            : `目前發酵程度：${this.fermentLevel}%（建議調至 20%～30% 保留花香）`;
        }
        if (this.promptTextEl) {
          this.promptTextEl.textContent = '階段二：拖曳下方滑桿至 20%～30% 輕發酵黃金區並靜候 1 秒，喚醒蘭花香！';
        }
      }
    } else if (step.id === 'panfire') {
      this.panfireWrapEl.classList.add('is-visible');
      this.bandLightEl.className = 'tea3d-sweetspot-band is-panfire';
      pct = this.panfireProgress;
      countDisplay = `殺菁進度 ${Math.round(this.panfireProgress)}%`;
      meterDisplay = `鎖鮮完成 ${Math.round(this.panfireProgress)}%`;
      if (this.panfireTemp > 86) this.progressFillEl.classList.add('is-hot');
      if (this.panfireTempEl) {
        this.panfireTempEl.textContent = `目前鍋溫指標：${Math.round(this.panfireTemp)}%（黃金殺菁區 55%～85%）`;
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
      countDisplay = '製茶全流程完成';
      meterDisplay = '100% 完成品茗';
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

    if (this.nextStepBtn) {
      if (step.id === 'finale') {
        this.nextStepBtn.textContent = '已完成全部製茶步驟';
        this.nextStepBtn.disabled = true;
      } else if (step.id === 'roast') {
        this.nextStepBtn.textContent = this.roastProgress >= 60 ? '立即出焙並端上茶湯 →' : '請先烘至 60% 以上';
        this.nextStepBtn.disabled = this.roastProgress < 60;
        if (this.roastProgress >= 60) this.markStepComplete(4);
      } else {
        this.nextStepBtn.textContent = isDone ? `進入下一步：${STEPS[this.currentStepIdx + 1].shortTitle} →` : '完成本關操作即可下一步';
        this.nextStepBtn.disabled = !isDone;
      }
    }
  }

  /* -----------------------------------------
     ANIMATION & CONTINUOUS PHYSICS LOOP
     ----------------------------------------- */
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
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  updateFrame(dt, elapsed) {
    // Animate drifting Shanlinxi valley clouds
    if (this.cloudMeshes) {
      this.cloudMeshes.forEach((c) => {
        c.position.x = c.userData.baseX + Math.sin(elapsed * 0.28 + c.userData.phase) * 0.65;
      });
    }

    // Update burst star particles
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

    // Step 1 animations: floating buds + parabolic flight into basket + old leaf wobble
    if (stepId === 'pluck' && this.stepObjects.pluck) {
      const { buds, oldLeaves, flyingBuds, basket } = this.stepObjects.pluck;
      buds.forEach((b, idx) => {
        if (!b.userData.picked) {
          b.position.y = b.userData.originPos.y + Math.sin(elapsed * 2.6 + idx * 1.1) * 0.06;
          b.rotation.y = Math.sin(elapsed * 1.2 + idx) * 0.25;
        }
      });

      const targetPos = basket.position.clone().add(new THREE.Vector3(0, 0.55, 0));
      for (let i = flyingBuds.length - 1; i >= 0; i--) {
        const fb = flyingBuds[i];
        fb.userData.flyT = Math.min(1, fb.userData.flyT + dt * 2.2);
        const t = fb.userData.flyT;
        fb.position.lerpVectors(fb.userData.originPos, targetPos, t);
        fb.position.y += Math.sin(t * Math.PI) * 1.35;
        fb.rotation.x += dt * 7;
        fb.scale.setScalar(1 - t * 0.65);
        if (t >= 1) {
          fb.visible = false;
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

    // Step 2 animations: spring tray recovery + fermentation golden zone hold + floral particles
    if (stepId === 'wither' && this.stepObjects.wither) {
      const { trayGroup, rackLeaves, aromaParticles } = this.stepObjects.wither;
      if (this.witherPhase === 'shake') {
        trayGroup.rotation.z = THREE.MathUtils.lerp(trayGroup.rotation.z, 0, dt * 8);
        trayGroup.position.x = THREE.MathUtils.lerp(trayGroup.position.x, 0, dt * 8);
      } else {
        const inGolden = this.fermentLevel >= 20 && this.fermentLevel <= 30;
        if (inGolden && !this.completedSteps[1]) {
          this.fermentHoldTimer += dt;
          if (this.fermentHoldTimer >= 1.1) {
            this.markStepComplete(1);
            this.showToast('黃金輕發酵鎖定！蘭花清香充分釋放', 'success');
            this.updateUI();
          }
        }
        const tColor = new THREE.Color(0x63ae48).lerp(new THREE.Color(inGolden ? 0x769f56 : 0x5c7544), this.fermentLevel / 50);
        rackLeaves.forEach((l) => l.userData.mat.color.copy(tColor));

        const targetOpacity = inGolden || this.completedSteps[1] ? 0.85 : 0.18;
        aromaParticles.forEach((ap) => {
          ap.position.y += ap.userData.speed * dt;
          ap.position.x += Math.sin(elapsed * 2 + ap.userData.phase) * 0.25 * dt;
          if (ap.position.y > 2.8) ap.position.y = 0.55;
          ap.userData.mat.opacity = THREE.MathUtils.lerp(ap.userData.mat.opacity, targetOpacity, dt * 3);
        });
      }
    }

    // Step 3 animations: wok leaf toss & natural temperature cooling
    if (stepId === 'panfire' && this.stepObjects.panfire) {
      const { wokLeaves, steamParticles, fireGlowMat } = this.stepObjects.panfire;
      if (!this.completedSteps[2]) {
        this.panfireTemp = Math.max(25, this.panfireTemp - dt * 5.2);
        if (this.panfireTempEl) {
          this.panfireTempEl.textContent = `目前鍋溫指標：${Math.round(this.panfireTemp)}%（黃金殺菁區 55%～85%）`;
        }
      }
      this.emberLight.intensity = 1.4 + (this.panfireTemp / 100) * 2.2;
      fireGlowMat.color.setHex(this.panfireTemp > 86 ? 0xff491f : 0xff8a3d);

      const freshGreen = new THREE.Color(0x5cb847);
      const crispJade = new THREE.Color(0x3a8243);
      wokLeaves.forEach((leaf) => {
        leaf.userData.mat.color.copy(freshGreen).lerp(crispJade, this.panfireProgress / 100);
        if (leaf.userData.jumpVel !== 0 || leaf.position.y > leaf.userData.baseY) {
          leaf.position.y += leaf.userData.jumpVel;
          leaf.userData.jumpVel -= 0.32 * dt;
          leaf.rotation.x += dt * 4;
          if (leaf.position.y <= leaf.userData.baseY) {
            leaf.position.y = leaf.userData.baseY;
            leaf.userData.jumpVel = 0;
          }
        }
      });

      steamParticles.forEach((sp) => {
        sp.position.y += sp.userData.speed * dt;
        if (sp.position.y > 3.1) sp.position.y = 1.25;
        const doneRatio = this.panfireProgress / 100;
        sp.userData.mat.color.copy(new THREE.Color(0xb9dec2)).lerp(new THREE.Color(0xf4d47e), doneRatio);
        sp.userData.mat.opacity = 0.52 * (1 - doneRatio * 0.45);
      });
    }

    // Step 4 animations: kneading ball pulse + tea strip to hemispherical pellet morph
    if (stepId === 'roll' && this.stepObjects.roll) {
      const { clothGroup, mainBag, morphLeaves } = this.stepObjects.roll;
      const p = this.rollProgress / 100;
      const pulse = this.isDragging ? Math.sin(elapsed * 9) * 0.04 : 0;
      mainBag.scale.set(1.06 + pulse, 0.88 - pulse, 1.06 + pulse);
      clothGroup.position.y = 0.95 - p * 0.06;

      const stripColor = new THREE.Color(0x4e9947);
      const pelletColor = new THREE.Color(0x284e34);
      morphLeaves.forEach((leaf) => {
        const sx = THREE.MathUtils.lerp(1.85, 0.85, p);
        const sy = THREE.MathUtils.lerp(0.28, 0.72, p);
        const sz = THREE.MathUtils.lerp(0.65, 0.85, p);
        leaf.scale.set(sx, sy, sz);
        const r = THREE.MathUtils.lerp(leaf.userData.baseRadius, 1.05 + (leaf.userData.angle % 0.25), p);
        leaf.position.x = Math.cos(leaf.userData.angle + p * 0.8) * r;
        leaf.position.z = Math.sin(leaf.userData.angle + p * 0.8) * r;
        leaf.userData.mat.color.copy(stripColor).lerp(pelletColor, p);
      });
    }

    // Step 5 animations: hold-to-roast progress, moisture vapor drop, overheat rebound
    if (stepId === 'roast' && this.stepObjects.roast) {
      if (this.overheatCooldown > 0) {
        this.overheatCooldown = Math.max(0, this.overheatCooldown - dt);
      }

      if (this.isHoldingHeat) {
        const prev = this.roastProgress;
        this.roastProgress = Math.min(100, this.roastProgress + dt * 21);

        if (prev < 60 && this.roastProgress >= 60) {
          this.showToast('進入輕焙清香區（60%～78%）！放手即可出焙或續烘至熟香', 'success');
        } else if (prev < 79 && this.roastProgress >= 79) {
          this.showToast('進入中度熟香區（79%～92%）！堅果蜜香正在釋放', 'success');
        }

        if (this.roastProgress >= 95) {
          this.isHoldingHeat = false;
          this.overheatCooldown = 0.9;
          this.roastProgress = 72;
          if (this.holdBtnEl) this.holdBtnEl.classList.remove('is-holding');
          this.showToast('哎呀！焙太久有點微焦，已退回 72% 請溫柔控火', 'warn');
        }
        this.updateUI();
      }

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

    // Step 6 animations: finale cup gentle orbit & rising steam
    if (stepId === 'finale' && this.stepObjects.finale) {
      const { cupAssembly, cupSteam } = this.stepObjects.finale;
      if (!this.isDragging) {
        this.finaleOrbitYaw += dt * 0.25;
      }
      cupAssembly.rotation.y = this.finaleOrbitYaw;
      cupSteam.forEach((cs) => {
        cs.position.y += cs.userData.speed * dt;
        cs.position.x += Math.sin(elapsed * 1.8 + cs.userData.phase) * 0.18 * dt;
        if (cs.position.y > 3.2) cs.position.y = 1.35;
        const heightRatio = (cs.position.y - 1.35) / 1.85;
        cs.userData.mat.opacity = Math.max(0, 0.45 * (1 - heightRatio));
      });
    }
  }
}

/* =========================================================================
 *  Bootstrap + Safe Automation Test Hooks
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
      witherPhase: app.witherPhase,
      panfireProgress: app.panfireProgress,
      rollProgress: app.rollProgress,
      roastProgress: app.roastProgress,
      roastOutcome: app.roastOutcome
    }),
    goToStep: (idx) => {
      app.maxUnlockedIdx = Math.max(app.maxUnlockedIdx, idx);
      app.goToStep(idx);
    },
    completeStepForTest: (idx, roastMode = 'light') => {
      app.ensureInitialized();
      app.markStepComplete(idx);
      if (idx === 0) app.pluckPicked = 5;
      if (idx === 1) { app.witherPhase = 'ferment'; app.witherShakeProgress = 100; app.fermentLevel = 25; }
      if (idx === 2) { app.panfireTemp = 72; app.panfireProgress = 100; }
      if (idx === 3) { app.rollProgress = 100; }
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
