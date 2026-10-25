---
name: 德億茶莊 DEYI TEA HOUSE
description: 台灣南投杉林溪高山烏龍茶品牌官網與包裝規格標視覺系統
colors:
  primary: "#c8834b"
  primary-dark: "#9c5020"
  teal-dark: "#1b333e"
  teal: "#284756"
  teal-deep: "#1d3541"
  neutral-bg: "#f7f6f2"
  neutral-card: "#ffffff"
  text-cream: "#fbf6ed"
  text-ink: "#111111"
  text-muted: "#a0b4ac"
  border-subtle: "rgba(255, 255, 255, 0.12)"
  border-card: "rgba(20, 38, 48, 0.15)"
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
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#f6e3c2"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  spec-badge:
    backgroundColor: "#ededed"
    textColor: "{colors.text-ink}"
    rounded: "{rounded.none}"
    border: "1px solid #111111"
---

# 德億茶莊 DEYI TEA HOUSE · 視覺設計系統 (DESIGN.md)

## Overview
本系統為台灣高山茶品牌「德億茶莊」的核心視覺規範，立足於南投杉林溪海拔 1,600 公尺之高山風土。
視覺哲學採「**包裝規格標（Package Spec Label）**」與「茶農誠實手藝」，核心主張為**「喝之前，先讀懂這包茶」**。全站以技術規格標籤的嚴謹排印、啞光銀箔真空包的實物感，以及古銅篆印與深邃高山茶區冷礦色調，構築沈穩、內斂且值得信賴的高山茶品牌形象。

## Colors
- **主色（Primary / Copper & Cinnabar）**：
  - 古銅赤金 `#c8834b`：源自銅雕篆印與熟焙茶湯，用於核心 Call-To-Action、重點數值標籤與篆章印泥。
  - 深褐古銅 `#9c5020`：按鈕 Hover 與聚焦狀態，確保在白底或深底均具備 WCAG AA 級對比。
- **背景底色（Terroir Teal & Mountain Mist）**：
  - 杉林溪深潭藍 `#284756`：代表杉林溪清晨山嵐與針葉林下的高冷空氣，全站核心基底。
  - 幽谷玄青 `#1d3541`、`#1b333e`：用於區塊深淺層次遞進，形成沈穩的高山空間感。
- **標籤與卡片色（Packaging Off-White & Cream）**：
  - 規格標籤白 `#ededed` / `#ffffff`：模擬四兩真空包實體貼紙的消光塗佈紙質。
  - 雲霧米白 `#fbf6ed` / `#f6e3c2`：用於深底字體排印，溫潤而不刺眼。
  - 冷杉青灰 `#a0b4ac` / `#a9b8b0`：次要說明文字與右側直排副標。

## Typography
- **襯線題字（Serif TC）**：使用本地嵌入之 `Noto Serif TC`，用於品牌標題、規格標題（品名、產地、製程）與直排詩意註釋，展現百年傳統茶工藝的典雅墨韻。
- **無襯線正文與數值（Sans-serif）**：使用乾淨的高可讀性系統無襯線體，用於茶品沖泡參數、海拔公尺數、門市營業資訊與諮詢表單。
- **古典直排文字（Vertical-RL）**：首屏右側保留 `writing-mode: vertical-rl` 雙欄對仗註釋，還原台灣傳統茶行茶則排版韻味。

## Layout
- **桌面首屏（Desktop Viewport）**：依據精確百分比切片，由左至右分別為「品牌銅印標識＋導覽」、「核心文案與預約 CTA」、「中央高山真空包實物＋規格貼紙橫排穿插疊加」、「右側直排短詠詩＋防偽朱印」。
- **下延故事區塊（Subsequent Story Sections）**：
  - 杉林溪風土（Terroir & Altitude）
  - 五道製茶工序（5-Step Craft Process）
  - 當季主力茶品（Seasonal Products: 春茶、冬茶、熟香烏龍）
  - 沖泡指南（Water Temp, Ratio, Steep Time, Rerinsing）
  - 門市資訊與即時諮詢（Live Store Status, Address, Phone, LINE, Booking Form）
- **行動端適應（Mobile Adaptation @ 390px - 768px）**：長條茶包與多欄規格卡片自動退化為垂直自然單欄堆疊，保持字級舒展與大觸控區間。

## Elevation & Depth
- **摒棄虛浮陰影**：不使用 AI 模板常見的大面積模糊陰影（`0 10px 30px rgba(...)`），以實體邊界（1px 幾何細線）與色塊層次建立空間感。
- **實體紙張與金屬消光疊加**：真空茶包以啞光銀箔高解析度圖層浮於深山背景上，白紙規格標籤直接橫切於茶包表面，透過 Z 軸層疊產生真實的物體空間感。

## Shapes
- **建築幾何邊界**：卡片與規格標籤採用極簡直角（`border-radius: 0` 或 `border-radius: 4px`），呈現規格標籤的嚴謹與機械美感。
- **圓形印鑑**：德億茶莊防偽印鑑採用純圓（`border-radius: 50%`），與方正矩形標籤形成方圓相濟的東方哲學對比。

## Components
- **首屏規格標籤列（`.spec-table-row`）**：
  - 包含左側灰底直標表頭（`.spec-th`）與右側白底數據欄（`.spec-td`），黑線外框（`1px solid #111111`）。
- **即時營業燈號（`.store-status`）**：
  - 透過 JavaScript 即時偵測台北時間（UTC+8，週一至週六 09:00-18:00），以呼吸燈（微光環縮放）展示門市營業動態。
- **預約與詢價按鈕（`.btn-product-inquire` / `.btn-hero-cta`）**：
  - 統一採用暖銅金底配米白字，點擊後平滑滾動至諮詢表單或直連 LINE 客服。

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
