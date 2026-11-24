# tech-resist1：光阻-1：照到光就會變的膠（科技透明圈 系列 2「代工的供應商」第 5 集；下一集光阻-2：塗佈顯影機）
- 狀態（11/24）：成片 v1 完成（59.8 秒），見文末「11/24 配音與成片」；⚠ 音高 137.9 Hz 偏高、s13 疑似吞「年」、s3「光罩」原字錄音，待 Andy 決定是否重配。
- 產生：`python3 videos/tech-resist1/genscript.py` → `node scripts/ui/silent-timeline.mjs tech-resist1 --force`（配音後改跑 tts-take --resplit＋align --force）→ `python3 videos/tech-resist1/genmodel.py`（自動再跑 genscript、把各幕 props 併進 script.json）。改稿只改 genscript.py；改畫面只改 genmodel.py／HudResist.tsx。
- 2D 卡：`src/components/three/HudResist.tsx`（kind 以 pr1- 開頭，14 張），Hud.tsx 只加 import 與一行分派。
- 主素材框：所有層 bg，另放看不見的 px_a／px_a2／px_b／px_br／px_bn／px_c／px_d／px_e／px_f／px_t（每段只亮鏡頭對準的那一個）。標籤一律手動放頂端兩格（xy [300,300]／[780,300]），鏡頭用 `S()` 把主體放在 y≈380–910。
- 檢查（11/23）：layout-check 0 error、1 warning（IG 底部出處列，固定版面每支都有）；card-overlap 0 error、0 warning；validate 0 error。
- 留言關鍵字「光阻」（派工指定；lessons 77 寫 11/27 後新片一律「透明圈」，待 CEO 確認）。

## 11/24 配音與成片
- 配音前刪字（念稿 266→250 字，無聲估算 63.6→60.0 秒）：刪掉公司名稱句整幕 s12「供應商以日本廠為主，像捷時雅、東京應化、信越化學」（材料倉與 pr1-co 卡不再入鏡）；s13 改成一句帶過並接上前句「這些光阻以日本廠為主，捷時雅還找夥伴，在雲林合資蓋廠，最快 2028 年投產」；s1「晶片的圖案」→「晶片圖案」；s8「再加熱烘烤」→「再烘烤」。事實、來源標示不變。
- 鏡頭推近：s9 念到 EUV 時 d 70→56；s10 起 d 52、念到斷掉前推到 d 42 對準 EUV 那塊（光源 d_src 收起來，不壓頂端讀數）；s11 念到「業界在試」時 d 66→48。標籤仍在頂端兩格，不壓主物件中央。
- 「＋」號：Ops.tsx 的 flow 加選用欄位 `plus`（每顆點上畫白色「＋」，舊片不受影響）；s8 沿鏈跳的酸 H⁺（c_hop0／c_hop1）開啟；靜止的酸球「＋」加大。
- 配音：gemini-2.5-flash-preview-tts＋Iapetus＋說明 B，整篇 1 次請求（TTS_NO_RETRY=1）。原始 68.89 秒（`out/tech-resist1-take.orig.wav`），靜音（−40 dB、≥0.16 秒）15.68 秒 → 純說話 250÷53.21＝4.70 字/秒；倍數 5.75÷4.70＝1.22 → 純說話約 5.73 字/秒。音高中位數 137.9 Hz（voice-measure.py，超過基準 110–125）。對齊整篇信心 0.919。
- 一條龍：`bash scripts/three/make-tech.sh tech-resist1 --take=out/tech-resist1-take.orig.wav --atempo=1.22 --ver=v1` → `out/tech-resist1.v1.mp4`（59.80 秒、1794 幀、正片 −15.8 LUFS、片尾 −11.2 LUFS），複製成 `out/tech-resist1.mp4`。渲染 10:14–11:13。
- 檢查：layout-check 0 error、card-overlap 0/0、flow 0（26 條）、kinematics 0；verify4 四道不全過，判讀在 out/tech-resist1/verify4/human.md。
- 渲染之後另一個 session 改了原始碼（念稿光罩→光照、雲林廠標籤加台灣旗、合資卡加日台國旗）；v1 成片不含這些，要的話需重渲（0 次 TTS，約 1 小時）。
- 預覽：out/preview/tech-resist1-sheet.png、tech-resist1-close-acid／euv／stoch／mor.png。

## 11/24 v2 準備（重配待額度重置）
- v1 音高 137.9 Hz（基準 121.5，允許 112–126）作廢，要用 `bash scripts/three/tts-pitch-take.sh tech-resist1` 重配；11/24 11:18 第 1 次請求回 429（當日免費額度用完），等 16:00 後重配。
- 念稿：光罩→光照（替身字表）；「最快 2028 年投產」改念「最快在二零二八年開始投產」（v1 疑似吞「年」），字幕不變。
- 審片 7.4 必改已修：s13 開頭加日本光阻廠（捷時雅官方 LOGO 廠牌、日本國旗念「日本廠」時升旗、門口光阻桶），念「捷時雅還找夥伴」時鏡頭移到雲林廠（台灣旗）；合資卡加 JSR LOGO 與日台國旗（不透明，輪到粗框）；s14 一開場就滴膠、晶圓轉起來攤平，鏡頭對準晶圓台；s14 出處拿掉「下一集」；片尾「下一支」縮短成「光阻-2 塗佈機」、小標只留「塗佈顯影機」。
- LOGO：捷時雅 JSR＝Commons File:JSRlogo.gif（thumb.php 轉 PNG；原檔是低解析 GIF）。
- 檢查：validate 0 error、layout-check 0 error、card-overlap 0/0（時間軸仍是 v1 錄音的，重配後要重跑 genmodel 與檢查，並重抽 44–54 秒原尺寸送審）。
