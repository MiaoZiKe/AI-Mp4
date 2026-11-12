# 非 SVG、非 3D 素材來源可行性（實測 2026-11-12 台灣時間 18:25–18:45）

## 結論

- **Remotion 這一端沒問題**：點陣圖、影片、Ken Burns、遮罩揭露、紙片進場都能渲染，每幀約 0.08–0.12 秒，60 秒的片約 3–4 分鐘。
- **素材來源目前全部卡住，需要使用者決定一件事才能開工**：
  - OpenAI 生圖：模型清單看得到，但生成回 `429 insufficient_quota`（帳號沒有餘額）。兩個模型各試一次都一樣，沒有生出任何圖。
  - 免授權素材站（Pexels、Pixabay、Unsplash、Wikimedia Commons、Openverse、Mixkit、Coverr）：全部被這個環境的代理擋下。
  - Gemini 生圖：模型清單裡有 6 個圖片模型，依任務指示沒有實測生成，免費額度能不能用還不知道。
- **現在不靠任何外部服務就做得到的**：用 Python（Pillow＋numpy）在本機程式生成紙紋、撕邊色紙、紙膠帶、便條紙這類點陣 PNG。這次效能測試用的紙片就是這樣做的。它能撐起「紙拼貼」的底和框，但做不出「伺服器機櫃」這種具象插畫。

要解鎖具象插畫，使用者三選一（可並用）：

| 選項 | 使用者要做的事 | 每張成本（估） | 備註 |
|---|---|---|---|
| A. OpenAI 加值 | 到 OpenAI 帳單頁加餘額 | 低畫質約 US$0.01–0.02、中畫質約 US$0.04–0.07 | 支援透明背景，最適合去背紙片。價格是記憶中的公開牌價，未在今天查證 |
| B. Gemini 生圖 | 同意花一次請求實測 | 付費層約 US$0.04；免費層是否有圖片額度未確認 | 不支援透明背景，要白底再去背 |
| C. 放行素材站主機 | 在環境設定放行下列主機 | 免費 | 照片／影片質感，不是插畫；要逐張記錄授權 |

## 1. OpenAI 生圖

- `GET https://api.openai.com/v1/models`：成功（代理有注入金鑰）。圖片模型：`gpt-image-1-mini`、`gpt-image-1.5`、`gpt-image-2`（含 `gpt-image-2-2026-04-21`）、`gpt-image-2.5-flare`／`-sunburst`、`gpt-image-2.6-flare`／`-sunburst`、`chatgpt-image-latest`。沒有 `dall-e-*`。
- 生成實測（`POST /v1/images/generations`，`size: 1024x1536`、`quality: low`、`n: 1`，題材：伺服器機櫃剪紙拼貼）：

| 次 | 模型 | HTTP | 耗時 | 結果 |
|---|---|---|---|---|
| 1 | gpt-image-1-mini | 429 | 1.2 秒 | `insufficient_quota`／`credit_balance_exhausted`：You have no credits remaining |
| 2 | gpt-image-2 | 429 | 0.9 秒 | 同上 |

- 第 3 次沒有再試：錯誤是帳號層級的餘額用完，換模型不會變。
- 沒有成功的圖。錯誤回應存在 `out/what-is-server/assets-test/resp1.json`、`resp2.json`。
- 因為沒成功，**實際生成耗時和回傳格式沒有量到**。依 API 文件，gpt-image 系列回 `data[0].b64_json`（base64 PNG），可設 `background: "transparent"`。

## 2. 免授權素材站

`curl -sI` 結果全部是 `CONNECT tunnel failed, response 403`（代理拒絕，主機不在允許清單）：

- `www.pexels.com`、`api.pexels.com`、`images.pexels.com`、`videos.pexels.com`
- `pixabay.com`、`cdn.pixabay.com`
- `unsplash.com`、`api.unsplash.com`、`images.unsplash.com`
- `commons.wikimedia.org`、`upload.wikimedia.org`
- `openverse.org`、`api.openverse.org`
- `mixkit.co`、`assets.mixkit.co`
- `coverr.co`、`api.coverr.co`

我沒有改環境設定。要用哪一家，就請使用者放行那一家的主機（網站＋API＋圖檔 CDN 三個都要）。

授權條款（因為連不上，下面是依我記得的條款整理，**今天沒有重新查證**，放行後要再讀一次原文）：

| 來源 | 商用 | 要標示嗎 | 注意 |
|---|---|---|---|
| Pexels | 可 | 不必 | API 要免費金鑰；不可原樣轉賣；有可辨識的人或商標要小心 |
| Pixabay | 可 | 不必 | API 要免費金鑰；同上 |
| Unsplash | 可 | 不必（鼓勵） | API 要金鑰，且要求熱連結與回報下載；Unsplash+ 是付費的另一種授權 |
| Mixkit | 可（免費授權項目） | 不必 | 沒有公開 API；各類素材授權不同，逐項看 |
| Coverr | 可 | 不必 | 影片為主 |
| Wikimedia Commons | 看每個檔案 | 多數要（CC BY／BY-SA）；CC0 與公有領域不必 | BY-SA 有相同方式分享的義務，建議只用 CC0／公有領域 |
| Openverse | 看每個檔案 | 看每個檔案 | 只是搜尋器；用 `license=cc0,pdm` 過濾最省事 |

本片不畫真實人物，所以素材站一律只挑沒有人的畫面（機房、機櫃、線材、手機螢幕）。

## 3. Remotion 端

- 專案已經在用 `Img`＋`staticFile`（`src/components/v2/base.tsx`、`src/components/Background.tsx` 的底圖）。`OffthreadVideo` 還沒人用，但這次測試可以正常解碼渲染。
- 實測方式：臨時寫了 4 個 composition，素材放 `public/`，用專案同一組設定（swiftshader、1080×1920、並行 4、H.264、4 核機器）各渲染 30 幀。測完已刪除測試檔，repo 裡沒有留下。

| 測試 | 內容 | 每幀 | 換算 60 秒影片 |
|---|---|---|---|
| Ken Burns | 1024×1536 JPG 放大 1→1.15 加平移 | 101–120 ms | 3.0–3.6 分 |
| 遮罩揭露 | `clip-path: circle()` 加 `mask-image` 漸層擦除 | 83 ms | 2.5 分 |
| 紙片進場 | 6 張撕邊透明 PNG，位移＋旋轉＋縮放（spring，每 2 幀更新的逐格感），每張 `drop-shadow` | 118–122 ms | 3.5–3.6 分 |
| 影片 | `OffthreadVideo` 1080×1920 H.264 加縮放 | 118 ms | 3.5 分 |

- 對照：`scripts/lib.mjs` 註解記錄的 v2 基準是 194 ms/幀，所以點陣素材不比現有 SVG 版面慢。
- 抽幀看過畫面：紙片、落影、圓形遮罩、漸層擦除都正確。
- 沒測到的：`filter: blur()` 大範圍模糊、同幕十幾張大圖。正式製作時先對最重的一幕跑 `node scripts/bench.mjs`。

## 4. Gemini 生圖

- `GET /v1beta/models`（代理注入金鑰）成功，共 63 個模型，其中圖片模型都支援 `generateContent`：
  - `gemini-2.5-flash-image`
  - `gemini-3.1-flash-lite-image`、`gemini-3.1-flash-image`、`gemini-3.1-flash-image-preview`
  - `gemini-3-pro-image`、`gemini-3-pro-image-preview`
- 清單裡沒有 `imagen-*`。
- **只列清單，沒有實測生成**。「列得出來」不等於免費額度能用；圖片模型在免費層的額度可能是 0。要確認只能花一次請求試。建議先試最便宜的 `gemini-3.1-flash-lite-image`，而且要留意它和 TTS 共用同一個專案的額度。

## 5. 建議的素材製作流程

前提：上面 A／B／C 至少解鎖一項。未解鎖前，樣張只能用本機程式生成的紙紋與色紙。

1. **列素材表**：分鏡定稿後，在 `videos/what-is-server/visual-spec.md` 列出每幕需要的物件（預估全片 12–16 張，和 `viral-style-research.md` 方向 A 一致）。
2. **生成**（一張一個物件，不要一張畫整幕）：
   - 尺寸：直式物件 1024×1536，方形小物 1024×1024。畫面上最大只會放到約 950px 寬，夠用。
   - 畫質：先用 low 出全部草圖，挑定後只對要放大的 3–4 張重出 medium。
   - OpenAI 加 `background: "transparent"`、`output_format: "png"`；Gemini 用純白底，再用 Pillow 去背（白底轉透明加 2px 羽化）。
   - 提示詞模板（沿用 `viral-style-research.md` 的固定前綴，只換 `{物件}`）：
     ```
     cut-paper collage illustration of {物件}, gouache and colored paper texture,
     visible paper grain, slightly uneven scissor-cut edges, flat front view,
     single object centered, limited palette of tomato red, mustard yellow,
     ink blue, mint green, cream, plain solid white background,
     no text, no letters, no numbers, no logo, no people, no hands
     ```
     `{物件}` 例：`a tall server rack cabinet with rows of drives and small indicator lights`、`a smartphone with a blank screen`、`a cardboard delivery box`。
   - 畫面裡的字（Server、IG、LINE、App）一律由 Remotion 排字，不讓模型畫字。
3. **本機自製的部分**（不花額度）：桌面紙紋底、撕邊色紙、紙膠帶、便條紙，用 Pillow 腳本生成，固定 seed。
4. **命名與位置**：
   - 原始回傳與落選圖：`out/what-is-server/assets-raw/`（不 commit）
   - 定稿素材：`public/assets/what-is-server/`，檔名 `s<幕序兩位數>-<物件>-v<版次>.png`，例 `s03-server-rack-v1.png`；共用紙材放 `public/assets/paper/`
   - **`.gitignore` 目前沒有擋 `public/assets/`**，依「圖片不 commit」的規定要加一行（我沒有改 `.gitignore`，留給最後統一處理）
   - 每張的提示詞、模型、畫質、日期或素材站網址與授權，記在 `videos/what-is-server/assets.md`
5. **檢查**：每張看有沒有混進文字、人物、商標；不合格就重生，不修圖硬用。
6. **進 Remotion**：`<Img src={staticFile("assets/what-is-server/…")}>`；動作只用位移、旋轉、縮放、`clip-path`、`mask-image`、`drop-shadow`。

## 沒做到的

- 沒有任何一張 AI 生成圖（OpenAI 沒餘額）。
- 沒量到生成耗時與實際回傳格式。
- 素材站授權條款沒能在今天對原文查證。
- Gemini 圖片模型是否真的能生成、免費層有沒有額度，未確認。
- 這個工作階段另外掛著 Canva、Figma、Adobe 的連接器，裡面有生圖或圖庫工具；不在這次任務範圍，沒有測。
