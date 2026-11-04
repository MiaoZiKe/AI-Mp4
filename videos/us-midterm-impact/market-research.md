# 市場研究：爆紅時事知識短影音的共通點 → 本集製作規格

- 研究日期：2026/11/4
- 方法：WebSearch 摘要彙整（多數網站被本環境網路政策擋住，無法逐頁讀原文；以下為業界做法歸納，非嚴格數據）

## 1. 鉤子（前 3 秒）
- 3 秒內丟出「反差＋問題」，不從背景講起；前 3 秒畫面字卡切換 2–3 次。
- 問題要連到觀眾切身的東西（錢包、台股、晶片、台海），語氣中立、不煽動。
- 候選句型：
  1. 美國國會換人顧門，台積電要緊張嗎？ ← **本集採用**
  2. 美國人投的票，為什麼會影響你的薪水？
  3. 關稅、晶片、台海——選後誰說了算？
  4. 總統沒改選，為什麼全世界都在看這場選舉？
- 封面標題和第一幕用同一句鉤子。

## 2. 引導結構
鉤子 → 反差＋開放迴圈（「第 3 點跟台灣最有關」）→ 名詞卡 → 結果 → 3 個影響（1/3、2/3、3/3 進度標）→ 市場反應 → 時間軸 → 回扣開頭問題 → 留言 CTA。

## 3. 素材（全部程式自繪，不用照片、不畫真人）
- 白宮／國會線稿圖示、席次條＋過半線、數字遞增、流程箭頭、影響卡、時間軸。
- 每 2–3 秒一次視覺變化（元素彈出、數字跳動、緩推鏡），每 5–10 秒換一幕。
- 字幕在中下方；右側至少留 120px、底部至少 300px，避開 Shorts／Reels 按鈕。

## 4. 配音
- 台灣成人語速約每秒 4.4 字；知識短片建議每秒 4.5–5 字。
- OpenAI 官方推薦 marin／cedar 品質最好，但中文表現社群評價普通；建議正式上線前盲測 marin、cedar、coral、nova。
- 本集設定：`marin`＋「台灣新聞解說主播、冷靜中立、數字放慢」指示（見 script.json 的 `tts`）。
- **注意：本次製作時 OpenAI API 額度已用完、其他 TTS 服務被網路政策擋住，成片為「音樂＋音效、無旁白」版本。** 補上額度後設定 `TTS_PROVIDER=openai` 重跑 `npm run render` 即自動逐幕配音，BGM 會自動壓到旁白下方。

## 5. 配色
| 用途 | 色票 |
|---|---|
| 背景 | #070B1A → #0E1430 漸層，6% 格線 |
| 主色（資訊、已確定） | 青 #22E5D4 |
| 數字、重點、分析預期 | 琥珀 #FFC93C |
| 風險、尚未確定 | 珊瑚 #FF6B5A |
| 門檻、中性 | 紫 #8B7CFF |
| 兩黨（必附文字） | 民主黨 #6F8FC7、共和黨 #C77C7C、未定 #5B6280 |

理由：紫／青為主的中性科技感，避免紅藍對立；兩黨只在席次條用低飽和色並列並加文字。

## 6. 音樂與音效
- BGM：96 BPM、小調（Am–F–C–G）極簡電子，程式合成（固定 seed）。
- 有旁白時 BGM 用 sidechain 壓到旁白下約 20 dB；成品 -14 LUFS、峰值 -1 dBTP。
- 音效：whoosh 只用在換幕；pop 配卡片出現；tick 配數字遞增；hit 配重點揭曉；riser 配鉤子；ding 配片尾。

## 7. 其他
- 頂部全片進度條＋章節 1/3–3/3，給觀眾「快看完了」的進度感。
- 結尾回扣開頭問題，讓影片可以無縫重播；CTA 用二選一／三選一留言。

## 來源（只看到搜尋摘要）
- 志祺七七短影音經驗（數位時代）https://www.bnext.com.tw/article/76920/youtuber-shorts-audience
- Hook engineering https://dev.to/bulkdl/hook-engineering-the-science-of-the-first-3-seconds-in-short-form-video-2026-2jp9
- Open loops https://clipchamp.com/en/blog/boost-video-watch-time-open-loops/
- 安全區 https://www.revid.ai/youtube-shorts-safe-zone
- 台灣語速 https://www.thenewslens.com/article/260113
- OpenAI TTS 指南 https://developers.openai.com/de-DE/api/docs/guides/text-to-speech
- 旁白與音樂混音 https://shortsfast.com/blog/mix-background-music-under-narration-without-masking-speech/
- 紫色選舉地圖研究 https://stemlounge.com/the-trouble-with-the-purple-election-map/
- Pew 新聞來源調查 https://www.pewresearch.org/short-reads/2026/10/19/1-in-5-americans-regularly-get-news-on-tiktok/
