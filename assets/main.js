'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Real-time Store Hours Detection (Taipei UTC+8: Mon-Sat 09:00-18:00)
  const updateStoreStatus = () => {
    const statusText = document.getElementById('store-status-text');
    const statusDot = document.getElementById('store-status-dot');
    if (!statusText || !statusDot) return;

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const taipeiTime = new Date(utc + (3600000 * 8));
    const day = taipeiTime.getDay();
    const hour = taipeiTime.getHours();

    const isOpen = (day >= 1 && day <= 6) && (hour >= 9 && hour < 18);
    statusText.textContent = isOpen
      ? '門市營業中 · 歡迎來店試茶品茗'
      : '今日門市打烊 · 歡迎線上留單／明日盡快回覆';
    statusDot.classList.toggle('status-dot--open', isOpen);
    statusDot.classList.toggle('status-dot--closed', !isOpen);
  };
  updateStoreStatus();

  // 2. Hero Interactive Spec Sheet Switcher
  const HERO_TEA_DATA = {
    spring: {
      name: '杉林溪烏龍 · 春茶',
      swatchClass: 'swatch--spring',
      liquorLabel: '湯色：蜜綠金黃',
      altitude: '海拔 1,600m 以上 · 四兩 150g',
      roastLevel: '輕焙火',
      roastFlavor: '蘭花冷香清揚、茶湯滑順回甘生津',
      lastStep: '5 乾燥',
      highlightLast: false,
      formValue: '杉林溪高山烏龍 · 當季春茶 (四兩 150g)'
    },
    winter: {
      name: '杉林溪烏龍 · 冬茶',
      swatchClass: 'swatch--winter',
      liquorLabel: '湯色：澄亮鵝黃',
      altitude: '海拔 1,650m 以上 · 四兩 150g',
      roastLevel: '極輕焙',
      roastFlavor: '冷山韻味鮮明、茶氣凝鍊持久耐泡',
      lastStep: '5 乾燥',
      highlightLast: false,
      formValue: '杉林溪高山烏龍 · 嚴選冬茶 (四兩 150g)'
    },
    roasted: {
      name: '杉林溪 · 熟香烏龍',
      swatchClass: 'swatch--roasted',
      liquorLabel: '湯色：琥珀橙金',
      altitude: '海拔 1,600m · 四兩 150g',
      roastLevel: '中度慢焙',
      roastFlavor: '堅果蜜香與熟果韻、溫潤不刺激腸胃',
      lastStep: '5 慢火精焙',
      highlightLast: true,
      formValue: '杉林溪熟香熟火烏龍 (四兩 150g)'
    }
  };

  const heroTabs = document.querySelectorAll('.hero-tea-tab[data-hero-tea]');
  const specNameEl = document.getElementById('spec-tea-name');
  const specDotEl = document.getElementById('spec-liquor-dot');
  const specLiquorEl = document.getElementById('spec-liquor-name');
  const specAltEl = document.getElementById('spec-origin-alt');
  const specRoastEl = document.getElementById('spec-roast-level');
  const specFlavorEl = document.getElementById('spec-roast-flavor');
  const specLastStepEl = document.getElementById('spec-step-last');
  const heroCtaLink = document.getElementById('hero-cta-link');
  const teaSelect = document.getElementById('utea');

  heroTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-hero-tea');
      const data = HERO_TEA_DATA[key];
      if (!data) return;

      heroTabs.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      if (specNameEl) specNameEl.textContent = data.name;
      if (specDotEl) specDotEl.className = 'spec-liquor-dot ' + data.swatchClass;
      if (specLiquorEl) specLiquorEl.textContent = data.liquorLabel;
      if (specAltEl) specAltEl.textContent = data.altitude;
      if (specRoastEl) specRoastEl.textContent = data.roastLevel;
      if (specFlavorEl) specFlavorEl.textContent = data.roastFlavor;
      if (specLastStepEl) {
        specLastStepEl.textContent = data.lastStep;
        specLastStepEl.classList.toggle('is-highlighted', data.highlightLast);
      }
      if (heroCtaLink) {
        heroCtaLink.setAttribute('data-selected-tea', data.formValue);
      }
    });
  });

  if (heroCtaLink && teaSelect) {
    heroCtaLink.addEventListener('click', () => {
      const val = heroCtaLink.getAttribute('data-selected-tea');
      if (val) teaSelect.value = val;
    });
  }

  // 3. Product Card Quick Select -> Auto-select dropdown in Inquiry Form
  const productButtons = document.querySelectorAll('.btn-product-inquire[data-tea]');
  productButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTea = btn.getAttribute('data-tea');
      if (teaSelect && targetTea) {
        teaSelect.value = targetTea;
      }
    });
  });

  // 4. Interactive 5-Step Process Board
  const PROCESS_STEPS = [
    {
      title: '01 · 採菁 — 離枝留嫩，守住葉片完整',
      desc: '清晨露水退去後，茶工嚴選採摘一心二葉鮮嫩茶菁，維持葉片完整無損，不帶老梗與過多雨水，為後續清香走水打下乾淨底子。',
      impact: '葉片完整未壓傷，茶湯就能保持清澈透亮、喝起來不雜不澀。',
      m1: '一心二葉至一心三葉',
      m2: '露水退去後手工嫩採',
      m3: '茶湯乾淨清亮、甘甜不雜'
    },
    {
      title: '02 · 萎凋 — 陽光與室內靜置走水喚香',
      desc: '先經溫和日光萎凋散去表層多餘水分，再移入室內靜置並定時輕翻走水，使葉片緣微發酵轉化，喚醒高山茶特有的清揚花香。',
      impact: '走水夠均勻，熱水一沖下去才有天然蘭花香，而不是生青味。',
      m1: '日光萎凋 ＋ 室內靜置',
      m2: '逐次翻動、均勻消水',
      m3: '激發高山茶細緻蘭花香氣'
    },
    {
      title: '03 · 炒菁 — 高溫鎖鮮，封存山嵐果膠',
      desc: '在最佳發酵時刻以適度高溫炒菁停止酵素作用，妥善鎖住茶葉翠綠鮮活與天然果膠質，徹底去除生青草味，留存清爽甘醇。',
      impact: '決定一杯茶「青不青、甜不甜」的分水嶺，也是耐泡甜度的來源。',
      m1: '適度高溫鍋炒止酵',
      m2: '去除青氣、留住果膠',
      m3: '保留鮮活翠綠與清甜口感'
    },
    {
      title: '04 · 揉捻 — 布球團揉成緊實半球顆粒',
      desc: '將茶葉包入棉布反覆整形與壓揉，逐步揉緊成飽滿勻稱的半球型顆粒，適度破壞葉表細胞組織，讓滋味封存於顆粒之中。',
      impact: '緊實度越均勻，第一泡慢慢展開、連泡六至八次都還有喉韻。',
      m1: '多次反覆布球團揉',
      m2: '外型緊結飽滿半球狀',
      m3: '香氣與茶湯層次穩定釋放'
    },
    {
      title: '05 · 乾燥 — 慢火收乾含水量 4% 以下',
      desc: '最後透過低溫緩慢烘乾去除多餘水氣至含水量 4% 以下，鎖住高山純淨清香；若製作熟香烏龍則進一步以慢火精焙，轉出堅果熟果甘甜。',
      impact: '乾燥徹底加上真空四兩封存，即使放半年一年依然能泡出山頭甜韻。',
      m1: '含水量 4% 以下低溫封乾',
      m2: '春／冬茶輕焙 · 熟香中焙',
      m3: '利於長久存放與穩定醇化'
    }
  ];

  const procTabs = document.querySelectorAll('.process-step-tab[data-step]');
  const procTitle = document.getElementById('proc-stage-title');
  const procDesc = document.getElementById('proc-stage-desc');
  const procImpact = document.getElementById('proc-stage-impact');
  const procM1 = document.getElementById('proc-m1-val');
  const procM2 = document.getElementById('proc-m2-val');
  const procM3 = document.getElementById('proc-m3-val');

  procTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.getAttribute('data-step'));
      const step = PROCESS_STEPS[idx];
      if (!step) return;

      procTabs.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      if (procTitle) procTitle.textContent = step.title;
      if (procDesc) procDesc.textContent = step.desc;
      if (procImpact) procImpact.textContent = step.impact;
      if (procM1) procM1.textContent = step.m1;
      if (procM2) procM2.textContent = step.m2;
      if (procM3) procM3.textContent = step.m3;
    });
  });

  // 5. Vessel Switcher in Brewing Section
  const VESSEL_CONFIG = {
    teapot: {
      tempNum: '95°C ~ 100°C',
      tempDesc: '高山茶顆粒緊實，建議以滾燙沸水充分激發高山茶的冷香與花香。',
      ratioNum: '1 : 20',
      ratioDesc: '一般紫砂壺或瓷壺，茶葉鋪滿壺底約 1/4 至 1/5 空間即可。',
      timeNum: '50 秒',
      timeDesc: '溫潤泡後，第一泡浸泡約 50 秒即可出湯，往後每泡順延 10~15 秒。',
      refillNum: '6 ~ 8 泡',
      refillDesc: '正宗高山手採烏龍葉肉肥厚，可連續回沖 6 至 8 次依然香氣清雅。'
    },
    mug: {
      tempNum: '95°C ~ 100°C',
      tempDesc: '馬克杯可直接沖入熱開水；若想帶甜柔一點可開蓋散熱 10 秒再泡。',
      ratioNum: '約 3g : 300ml',
      ratioDesc: '抓取約十元硬幣大小的一小撮茶粒放入 300ml 馬克杯（茶葉約佔杯底一層）。',
      timeNum: '2 分半 ~ 3 分',
      timeDesc: '浸泡約 2 分半即可喝一半留一半再回沖，避免久浸讓茶湯過濃。',
      refillNum: '3 ~ 4 次回沖',
      refillDesc: '辦公室或旅途也能輕鬆喝到杉林溪花香與不澀回甘。'
    }
  };

  const vesselBtns = document.querySelectorAll('.vessel-btn[data-vessel]');
  const bpTempNum = document.getElementById('bp-temp-num');
  const bpTempDesc = document.getElementById('bp-temp-desc');
  const bpRatioNum = document.getElementById('bp-ratio-num');
  const bpRatioDesc = document.getElementById('bp-ratio-desc');
  const bpTimeNum = document.getElementById('bp-time-num');
  const bpTimeDesc = document.getElementById('bp-time-desc');
  const bpRefillNum = document.getElementById('bp-refill-num');
  const bpRefillDesc = document.getElementById('bp-refill-desc');

  vesselBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-vessel');
      const cfg = VESSEL_CONFIG[key];
      if (!cfg) return;

      vesselBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      if (bpTempNum) bpTempNum.textContent = cfg.tempNum;
      if (bpTempDesc) bpTempDesc.textContent = cfg.tempDesc;
      if (bpRatioNum) bpRatioNum.textContent = cfg.ratioNum;
      if (bpRatioDesc) bpRatioDesc.textContent = cfg.ratioDesc;
      if (bpTimeNum) bpTimeNum.textContent = cfg.timeNum;
      if (bpTimeDesc) bpTimeDesc.textContent = cfg.timeDesc;
      if (bpRefillNum) bpRefillNum.textContent = cfg.refillNum;
      if (bpRefillDesc) bpRefillDesc.textContent = cfg.refillDesc;
    });
  });

  // 6. Out-Pour Steep Countdown Timer
  const steepChips = document.querySelectorAll('.steep-chip[data-seconds]');
  const timerDisplay = document.getElementById('timer-display');
  const timerStatus = document.getElementById('timer-status');
  const timerStartBtn = document.getElementById('btn-timer-start');
  const timerResetBtn = document.getElementById('btn-timer-reset');

  let selectedSeconds = 50;
  let selectedLabel = '第 1 泡';
  let remainingSeconds = 50;
  let timerInterval = null;

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const renderTimerClock = () => {
    if (timerDisplay) timerDisplay.textContent = formatTime(remainingSeconds);
  };

  steepChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      stopTimer();
      steepChips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');

      selectedSeconds = Number(chip.getAttribute('data-seconds')) || 50;
      selectedLabel = chip.getAttribute('data-label') || '第 1 泡';
      remainingSeconds = selectedSeconds;
      renderTimerClock();

      if (timerStartBtn) timerStartBtn.textContent = '開始計時';
      if (timerStatus) {
        timerStatus.className = 'timer-status-line';
        timerStatus.textContent = `已選${selectedLabel}（${selectedSeconds} 秒），注入沸水後按下開始`;
      }
    });
  });

  if (timerStartBtn) {
    timerStartBtn.addEventListener('click', () => {
      if (timerInterval) {
        stopTimer();
        timerStartBtn.textContent = '繼續計時';
        if (timerStatus) {
          timerStatus.className = 'timer-status-line';
          timerStatus.textContent = `已暫停（${selectedLabel} 剩餘 ${remainingSeconds} 秒）`;
        }
        return;
      }

      if (remainingSeconds <= 0) {
        remainingSeconds = selectedSeconds;
        renderTimerClock();
      }

      timerStartBtn.textContent = '暫停計時';
      if (timerStatus) {
        timerStatus.className = 'timer-status-line';
        timerStatus.textContent = `${selectedLabel} 浸泡中，準備出湯⋯`;
      }

      timerInterval = setInterval(() => {
        remainingSeconds -= 1;
        renderTimerClock();

        if (remainingSeconds <= 0) {
          stopTimer();
          timerStartBtn.textContent = '重新計時';
          if (timerStatus) {
            timerStatus.className = 'timer-status-line is-done';
            timerStatus.textContent = `✓ ${selectedLabel}出湯時間到，請倒盡茶湯享用！`;
          }
        }
      }, 1000);
    });
  }

  if (timerResetBtn) {
    timerResetBtn.addEventListener('click', () => {
      stopTimer();
      remainingSeconds = selectedSeconds;
      renderTimerClock();
      if (timerStartBtn) timerStartBtn.textContent = '開始計時';
      if (timerStatus) {
        timerStatus.className = 'timer-status-line';
        timerStatus.textContent = `已重置為${selectedLabel}（${selectedSeconds} 秒）`;
      }
    });
  }

  // 7. LINE ID One-Click Copy Button
  const copyLineBtn = document.getElementById('btn-copy-line');
  const copyFeedback = document.getElementById('line-copy-feedback');
  if (copyLineBtn && copyFeedback) {
    copyLineBtn.addEventListener('click', async () => {
      const lineId = copyLineBtn.getAttribute('data-line-id') || '@deyitea';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(lineId);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = lineId;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }
        copyFeedback.textContent = `✓ 已複製 ${lineId}`;
      } catch {
        copyFeedback.textContent = `請在 LINE 搜尋 ${lineId}`;
      }
    });
  }

  // 8. Mobile Navigation Drawer Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item, .btn-drawer-cta');

  if (mobileMenuToggle && mobileNavDrawer) {
    const toggleMobileMenu = (forceState) => {
      const isOpen = typeof forceState === 'boolean'
        ? forceState
        : !mobileNavDrawer.classList.contains('is-open');

      mobileNavDrawer.classList.toggle('is-open', isOpen);
      mobileMenuToggle.classList.toggle('is-active', isOpen);
      mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenuToggle.setAttribute('aria-label', isOpen ? '關閉選單' : '開啟選單');
    };

    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });

    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        toggleMobileMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNavDrawer.classList.contains('is-open')) {
        toggleMobileMenu(false);
      }
    });
  }

  // 9. Google Form Submission -> Hardened Validation, Formula Injection Defense & Anti-Spam
  const EXPECTED_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSdz_uBY2gX00KyCRygSRAhi27kaD3kgXnGyckxNyDYfAlHjfw/formResponse';
  const ALLOWED_TEA_OPTIONS = new Set([
    '杉林溪高山烏龍 · 當季春茶 (四兩 150g)',
    '杉林溪高山烏龍 · 嚴選冬茶 (四兩 150g)',
    '杉林溪熟香熟火烏龍 (四兩 150g)',
    '客製化商務/年節茶葉禮盒',
    '預約前往實體門市試茶'
  ]);
  const COOLDOWN_MS = 30000;
  const COOLDOWN_STORAGE_KEY = 'deyi_last_inquiry_ts';
  let lastSubmitAt = 0;

  // Defend Google Sheets / CSV export against spreadsheet formula injection
  const sanitizeForSheet = (raw) => {
    const cleaned = String(raw || '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim();
    if (/^[=+\-@\t\r]/.test(cleaned)) {
      return "'" + cleaned;
    }
    return cleaned;
  };

  const getLastSubmitTs = () => {
    let stored = 0;
    try {
      stored = Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY) || 0);
    } catch {
      stored = 0;
    }
    return Math.max(lastSubmitAt, Number.isFinite(stored) ? stored : 0);
  };

  const recordSubmitTs = (ts) => {
    lastSubmitAt = ts;
    try {
      window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(ts));
    } catch {
      // Ignore storage restriction in private mode
    }
  };

  // Expose pure validation helpers on a sealed namespace for automated checks
  window.__DEYI_FORM_SECURITY__ = Object.freeze({
    sanitizeForSheet,
    ALLOWED_TEA_OPTIONS: Array.from(ALLOWED_TEA_OPTIONS)
  });

  const inquiryForm = document.getElementById('deyi-inquiry-form');
  const submitBtn = document.getElementById('btn-submit-inquiry');
  const statusMsg = document.getElementById('form-status-msg');
  const nameInput = document.getElementById('uname');
  const contactInput = document.getElementById('ucontact');
  const msgInput = document.getElementById('umsg');
  const honeypotInput = document.getElementById('uwebsite');

  if (inquiryForm && submitBtn && statusMsg && nameInput && contactInput && teaSelect && msgInput) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Verify form target was not tampered in DOM
      if (inquiryForm.getAttribute('action') !== EXPECTED_FORM_ACTION) {
        statusMsg.textContent = '表單傳送目標異常，請重新整理頁面，或直接致電 049-2752193 訂購。';
        statusMsg.className = 'form-status-msg is-error';
        return;
      }

      // Honeypot trap: silently accept bot submissions without hitting Google Form
      if (honeypotInput && honeypotInput.value.trim() !== '') {
        inquiryForm.reset();
        statusMsg.textContent = '✓ 感謝您的訂購／詢價！資料已自動送達德億茶莊後台試算表，我們將於營業時間盡速透過電話或 LINE 與您聯繫確認。';
        statusMsg.className = 'form-status-msg is-success';
        return;
      }

      // Enforce 30s cooldown against rapid spam submissions
      const now = Date.now();
      const elapsed = now - getLastSubmitTs();
      if (elapsed >= 0 && elapsed < COOLDOWN_MS) {
        const remain = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        statusMsg.textContent = `請稍候 ${remain} 秒後再送出下一筆詢價，或直接致電 049-2752193。`;
        statusMsg.className = 'form-status-msg is-error';
        return;
      }

      const rawName = nameInput.value.trim();
      const rawContact = contactInput.value.trim();
      const rawTea = teaSelect.value;
      const rawMsg = msgInput.value.trim();

      if (rawName.length < 1 || rawName.length > 40) {
        statusMsg.textContent = '請輸入您的稱呼（1 至 40 字以內）。';
        statusMsg.className = 'form-status-msg is-error';
        nameInput.focus();
        return;
      }

      if (rawContact.length < 3 || rawContact.length > 60) {
        statusMsg.textContent = '請輸入有效的聯絡電話或 LINE ID（3 至 60 字以內）。';
        statusMsg.className = 'form-status-msg is-error';
        contactInput.focus();
        return;
      }

      if (!ALLOWED_TEA_OPTIONS.has(rawTea)) {
        statusMsg.textContent = '所選茶品項目不正確，請從下拉選單重新選擇。';
        statusMsg.className = 'form-status-msg is-error';
        teaSelect.focus();
        return;
      }

      if (rawMsg.length > 400) {
        statusMsg.textContent = '備註與提問內容請精簡於 400 字以內。';
        statusMsg.className = 'form-status-msg is-error';
        msgInput.focus();
        return;
      }

      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '訂購單傳送中...';
      statusMsg.className = 'form-status-msg';
      statusMsg.textContent = '';

      // Explicitly map only allowlisted entry IDs with spreadsheet-safe sanitization
      const urlEncodedData = new URLSearchParams();
      urlEncodedData.append('entry.1445876736', sanitizeForSheet(rawName));
      urlEncodedData.append('entry.797744910', sanitizeForSheet(rawContact));
      urlEncodedData.append('entry.1473249251', rawTea);
      urlEncodedData.append('entry.1008197756', sanitizeForSheet(rawMsg));

      try {
        await fetch(EXPECTED_FORM_ACTION, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: urlEncodedData.toString()
        });

        recordSubmitTs(Date.now());
        inquiryForm.reset();
        statusMsg.textContent = '✓ 感謝您的訂購／詢價！資料已自動送達德億茶莊後台試算表，我們將於營業時間盡速透過電話或 LINE 與您聯繫確認。';
        statusMsg.className = 'form-status-msg is-success';
      } catch (err) {
        statusMsg.textContent = '傳送時發生網路異常，請稍後再試，或直接撥打門市電話 049-2752193 聯繫我們。';
        statusMsg.className = 'form-status-msg is-error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }
});
