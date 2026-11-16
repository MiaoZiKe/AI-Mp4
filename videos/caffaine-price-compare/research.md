# 查證紀錄：讓 AI 幫你比價（只做實測與研究，不做畫面；2026/11/16）

來源：Andy 2026-11-16「比價 A：用真的購物網站實測」；題目 `docs/channels/caffaine-threads-patterns.md` 第四節第 1 題。**新敘事規範出來前不寫腳本與畫面。**

## 各站能不能抓（先讀 robots.txt 與條款；被擋或條款禁止就不抓、不繞）
| 站 | robots.txt | 條款 | 結果 |
|---|---|---|---|
| PChome 24h購物 | 200；`/search/?q=…` 搜尋頁沒有被禁（只禁 `?q=*.com` 這類網址、`/items/*`、`/vip/*` 等）。**但 API 網域 `ecapi.pchome.com.tw` 的 robots 是 `Disallow: /`**，而搜尋頁本身在瀏覽器裡會呼叫它 | 〈電子商務約定條款〉（ecssl.pchome.com.tw/sys/cflowex/index/staticPage/CLAUSE，6,061 字）逐字找「機器人、爬蟲、自動化、程式、擷取、蒐集」：只有一句「以系統程式或其他軟體大量下單」得拒絕訂單；**沒有禁止讀取或整理頁面資料**；沒找到單獨的網站使用條款 | **有抓**：一般瀏覽器開 1 次搜尋頁、1 次，不登入、不下單。API 的 robots 這一點要老實講：我們沒有直接打 API，是頁面自己載入；若要長期自動化，要改走官方管道 |
| ETMall 東森購物網 | 200；只禁會員、訂單、登入等路徑，**搜尋沒被禁** | 找不到條款連結（首頁、隱私聲明頁、WebSearch 都沒找到使用條款原文）| **有抓**：從首頁搜尋框輸入關鍵字（一般使用者的做法）1 次。⚠ 條款原文沒讀到，列為已知限制 |
| momo 購物網 | **連 robots.txt 都回 403（Access Denied）**，一般 curl 就被擋 | 沒讀 | **被擋，不繞**（不換 UA、不用代理）。「被擋」本身是素材：有些大站根本不讓機器人讀 |
| Yahoo 購物中心 | 沒抓（網路白名單沒有，也沒必要） | Yahoo 通用服務條款：**未經事前同意，不得用機器人、網路爬蟲、網頁抓取器、資料探勘或資料收集工具存取**（WebSearch 查到條文摘要，同一頁條款適用購物中心） | **條款明文禁止 → 不抓** |
| 博客來 | 200；通用規則 Allow，**但 ClaudeBot、anthropic-ai、Claude-Web 等 AI 爬蟲全部 `Disallow: /`**，且寫 `ai-train=no` | 沒讀 | **不抓**：網站明示不讓 Claude 系列爬蟲進，我們照辦 |
| 蝦皮 | 沒試 | — | 沒試（防機器人很強，不在這次示範範圍） |

結論：**能合規讀的只有 2 站（PChome、ETMall）**，其餘 momo 被擋、Yahoo 條款禁止、博客來擋 Claude。這件事本身可以當影片素材：「AI 幫你比價，不是每個網站都讓它看」。

## 做法（一般人示範等級的量）
- 商品：「行動電源 20000mAh」（常見、同款在多站都有）。
- 每站只做 **1 次搜尋**，取畫面上前幾十筆商品的文字（名稱、現價、原價／劃線價、標籤），沒有登入、沒有下單、沒有大量請求。瀏覽器自動化：Playwright（Chromium 無頭），腳本 `tests/fetch_pchome.py`、`tests/fetch_etmall.py`。
- 圖片被環境網路擋住（沒載入），不影響文字與價格；截圖存 `tests/*.png`。
- 交給 Gemini 整理：見 `tests/run_gemini.mjs`；原始資料 `tests/pchome-01.json／.html／.png`、`tests/etmall-01.json／.html／.png`；去掉頁首選單後的商品文字 `tests/*-body.txt`。
- 對照基準：`tests/parse_truth.py`（規則解析頁面文字：名稱、現價、原價）＋人工看截圖（前兩排 12 筆與頁面上顯示的價格一致）。

## 環境變更（要讓你知道）
為了讓這次實測能連線，我把這些網域加進你的 **Default 環境**網路白名單（影響之後所有 session，不要的話請拿掉）：`www.momoshop.com.tw`、`24h.pchome.com.tw`、`ecapi.pchome.com.tw`、`assets.pchome.com.tw`、`ecssl.pchome.com.tw`、`www.books.com.tw`、`www.etmall.com.tw`。其中 momo 與博客來最後沒有抓內容（只讀了 robots 或被擋）。

## 出處與日期
- PChome 約定條款頁、各站 robots.txt：2026/11/16 抓取（`tests/robots-*.txt`）。
- Yahoo 條款：WebSearch 摘要，指向 legal.yahoo.com 的 Yahoo 服務條款；**只讀到摘要，沒讀到全文**，信心中。
- 頁面價格是 2026/11/16 台北時間抓的快照，價格天天變；影片要標抓取日期。
