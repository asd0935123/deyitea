---
name: 德億茶莊 DEYI TEA HOUSE
description: 台灣南投杉林溪高山烏龍茶品牌官網與包裝規格標視覺系統
colors:
  primary: "#c8834b"
  primary-bright: "#d99559"
  primary-bright-hover: "#e5a870"
  primary-on-dark: "#e5a36a"
  primary-dark: "#8f4318"
  primary-dark-hover: "#743410"
  teal-dark: "#142630"
  teal-deep: "#1d3541"
  teal: "#284756"
  teal-night: "#0e1c24"
  neutral-bg: "#f7f6f2"
  neutral-warm: "#efece3"
  neutral-spec: "#f4f1ea"
  neutral-spec-th: "#e4dfd4"
  neutral-card: "#ffffff"
  text-cream: "#fbf6ed"
  text-cream-soft: "#edeacc"
  text-mist: "#d2e1e6"
  text-mist-soft: "#b6ccd4"
  text-ink: "#142630"
  text-muted: "#455963"
  border-subtle: "rgba(237, 234, 204, 0.18)"
  border-card: "rgba(20, 38, 48, 0.22)"
typography:
  display:
    fontFamily: "'Noto Serif TC', Georgia, serif"
    fontSize: "46px"
    fontWeight: 900
    lineHeight: 1.18
    letterSpacing: "0.015em"
  headline:
    fontFamily: "'Noto Serif TC', Georgia, serif"
    fontSize: "32px"
    fontWeight: 900
    lineHeight: 1.3
    letterSpacing: "0.05em"
  subheadline:
    fontFamily: "'Noto Serif TC', Georgia, serif"
    fontSize: "22px"
    fontWeight: 900
    lineHeight: 1.4
    letterSpacing: "0.02em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.02em"
  vertical-caption:
    fontFamily: "'Noto Serif TC', Georgia, serif"
    fontSize: "15.5px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "1.7px"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  section: "90px"
components:
  button-primary-on-dark:
    backgroundColor: "{colors.primary-bright}"
    textColor: "{colors.teal-dark}"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  button-primary-on-light:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.text-cream}"
    rounded: "{rounded.sm}"
    padding: "13px 16px"
  spec-badge:
    backgroundColor: "{colors.neutral-spec}"
    textColor: "{colors.text-ink}"
    rounded: "{rounded.none}"
    border: "1.5px solid #142630"
---

# 德億茶莊 DEYI TEA HOUSE · 視覺設計系統 (DESIGN.md)

## Overview
本系統為台灣高山茶品牌「德億茶莊」的核心視覺規範，立足於南投杉林溪海拔 1,600 公尺之高山風土。
視覺哲學採「**包裝規格標（Package Spec Label）**」與「茶農誠實手藝」，核心主張為**「喝之前，先讀懂這包茶」**。全站以技術規格標籤的嚴謹排印、啞光銀箔真空包的實物感，以及古銅篆印與深邃高山茶區冷礦色調，構築沈穩、內斂且值得信賴的高山茶品牌形象。

## Colors
- **主色（Primary / Copper & Cinnabar）**：
  - 亮銅金 `#d99559`（Hover `#e5a870`）：用於深青灰底面之主按鈕，搭配深墨字 `#142630` 確保高對比度。
  - 深褐古銅 `#8f4318`（Hover `#743410`）：用於宣紙亮底按鈕與送出訂購鈕，搭配雲霧米白字 `#fbf6ed` 達到 WCAG AA 級對比。
  - 暖銅強調字 `#e5a36a`：深青底上的標題、海拔數字與連結高亮色；品牌主印泥為 `#c8834b`。
- **明暗交替底色（Terroir Teal & Warm Rice Paper）**：
  - 杉林溪深潭藍 `#284756`、幽谷玄青 `#1d3541`、深墨青 `#142630` 與極夜青 `#0e1c24`：用於首屏、風土展板、沖泡工作台與聯絡門市區。
  - 暖宣紙白 `#f7f6f2` 與規格貼紙白 `#f4f1ea` / `#ffffff`：用於當季主力茶品箋與五道製茶工序帳冊，與深青區段交替形成清晰閱讀節奏。
  - 雲霧米白 `#fbf6ed` / `#edeacc` 與青調霧灰 `#d2e1e6` / `#b6ccd4`：深底正文與次要說明；亮底次要說明為 `#455963`（深底禁用中性灰字）。

## Typography
- **襯線題字（Serif TC）**：使用本地嵌入之 `Noto Serif TC`，用於品牌標題、規格標題（品名、產地、焙度、製程）、海拔刻度與直排對句。
- **無襯線正文與數值（Sans-serif）**：使用高可讀性系統無襯線體，並於海拔、溫度、時間與電話使用 `tabular-nums` 等寬數字對齊。
- **古典直排文字（Vertical-RL）**：首屏右側保留 `writing-mode: vertical-rl` 雙欄對仗註釋，還原台灣傳統茶行茶則排版韻味。

## Layout
- **桌面首屏（Desktop Viewport）**：穩固三欄網格「左側主標與茶款規格切換器（春茶／冬茶／熟香）」、「中央啞光銀箔四兩真空包與零錯位統一規格貼紙（含茶湯色票與等高線山稜）」、「右側直書對句＋防偽朱印」。
- **下延明暗交替區塊**：
  - 當季主力茶品（宣紙亮底 `#f7f6f2`，配置東方細線銅版植物／焙籠插畫、茶湯色票與五格風味刻度條）
  - 杉林溪風土（幽谷深青 `#1d3541`，配置杉林溪全景山稜版畫、垂直海拔標高尺與風土參數帳冊）
  - 五道製茶工序（宣紙亮底 `#f7f6f2`，互動式五道工序切換台與總覽條列）
  - 沖泡指南與計時（深青 `#284756`，茶壺／馬克杯切換與 50 秒起跳實戰出湯計時器）
  - 門市資訊與即時諮詢（深墨青 `#142630`，營業狀態列、一鍵複製 LINE ID、Google 地圖與即時寫入試算表的訂購表單）
- **行動端適應（Mobile Adaptation @ 390px - 992px）**：手機版首屏優先呈現主標、茶款切換器與主 CTA，再向下展開四兩真空包與規格貼紙，消除擁擠與溢出。

## Elevation & Depth
- **摒棄虛浮陰影**：全站以 `1px`–`1.5px` 建築細線、明暗色塊轉場與銅版畫圖層建立層次，不套用浮誇霓虹或模板漸層。
- **插畫圖層整合（Botanical & Topographic Plates）**：
  - 三款主力茶插畫（`tea-spring.jpg`、`tea-winter.jpg`、`tea-roasted.jpg`）採暖宣紙底銅版畫風，透過 `mix-blend-mode: multiply` 無縫融入 `#f7f6f2` 紙面。
  - 杉林溪風土山稜版畫（`terroir-shanlinxi.jpg`）採純平 `#1d3541` 底細線雕刻風與區塊完全融合。

## Shapes
- **建築幾何邊界**：卡片與規格標籤採用直角或 `4px` 極微圓角，維持規格表與茶箋帳冊的嚴謹工藝感。
- **圓形印鑑與色票**：防偽篆印與茶湯色票採正圓形，作為方正表格中的視覺焦點。

## Components
- **互動規格貼紙（`.pack-spec-sheet`）**：以單一統一網格承載品名、茶湯色票、產地山稜線、焙度與製程五步，消除元件錯位風險，點擊茶款按鈕即同步切換內容並連動訂購單。
- **安靜的即時營業狀態（`.store-status`）**：透過 JavaScript 即時偵測台北時間（UTC+8，週一至週六 09:00-18:00），以靜態清晰指示點搭配文字標示營業狀態，不使用裝飾性閃爍動畫。
- **預約與詢價按鈕（`.btn-product-inquire` / `.btn-hero-cta`）**：深底用亮銅配深墨字、亮底用深古銅配米白字，點擊自動帶入對應茶款並平滑捲動至諮詢表單。

## Do's and Don'ts
- **DO**：
  - 始終以「真空四兩 150g」作為高山茶標準規格。
  - 保持「包裝規格標」的嚴謹科學精神與產地誠實數據。
  - 確保按鈕與背景間具備清晰的文字對比度。
  - 遵循純靜態輕量架構，保持秒開載入效能。
- **DON'T**：
  - 禁止捏造未經證實之有機標章、得獎獎項或虛構人物背書。
  - 禁止在標題上方添加 AI 模板常見的英文小標 kicker/eyebrow。
  - 禁止使用強烈螢光色、發光霓虹燈效（glow shadow）破壞茶道靜謐氣質。
  - 禁止替換已通過審查之核心真空茶包板位為通用圖庫插圖。
