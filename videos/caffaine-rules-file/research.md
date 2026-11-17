# caffaine-rules-file 查證（2026/11/17）
主旨：把身分、口氣、格式、禁忌寫成一份規則檔貼一次，之後每次新對話 AI 都先照著做。

## 實測做法（原始請求與回應都在 tests/，不改字）
- 模型：gemini-3.5-flash-lite（Gemini API generateContent，純文字，沒開搜尋）。
- 情境（虛構）：專案經理回覆同事「下週三產品會議改到週四下午三點，原因是客戶臨時出差」。請求一字不改。
- A：沒有系統提示。B：同一句，systemInstruction 放 tests/rules.txt（四行：身分、口氣、格式、禁忌）。各跑 5 次。
- 評分規則先寫（tests/rubric.md）：五條機器判讀，每條 1 分——第一行含結論、全文 ≤80 字、無客套詞、無表情符號、條列 ≤3 點。
- 結果：A 平均 1.6／5（1、2、1、2、2 分）；B 五次都 5／5（score.json）。
- 如實說明：A 的回覆是三種語氣的選項，第一行不是結論，所以第 1、2 條必然失分；這正是「沒規則時 AI 不知道你要什麼」的樣子，不是模型壞掉。
- 片中放的是 A-run1 與 B-run1 的節錄（去掉表情符號與粗體符號），畫面標「節錄」。
- API 的 systemInstruction 對應各 App 的「放規則的欄位」；片中只講實測，不宣稱各 App 的內部做法一樣。

## 功能名稱與位置（查證 2026/11/17）
- ChatGPT「自訂指令」：OpenAI 說明中心 ChatGPT Custom Instructions（help.openai.com/en/articles/8096356）— 網頁版 設定 → 個人化（Personalization）→ 自訂指令；手機版 設定 → Customize ChatGPT；設定後套用在新對話。（WebSearch 摘要；說明中心頁面本機連不上，未讀全文。）
- Claude「專案指示」：Claude 說明中心（support.claude.com/en/articles/9519177）讀到全文：專案頁右側按 “Set project instructions”→ 輸入後 “Save instructions”，專案內所有對話都會使用。中文介面名稱以介面為準，片中寫「專案指示」。
- Gemini「技能」：Google 說明「Gems 轉為技能」（support.google.com/gemini/answer/18560919）— 個人帳號 2026/11 起 Gems 轉為技能，Gems 於 2026/11/17 唯讀、2026/12/17 移除；可在技能頁「手動建立」，把 Gem 的名稱、說明、指令貼過去。依 WebSearch 摘要（TechRepublic、Android Authority 報導同日期）。片中寫「Gemini 的技能（原 Gem）」。選單名稱各版本不同（設定／自訂），片中不講選單路徑。
- 兩個官方說明頁本機連不上（support.google.com、help.openai.com 不在允許網域），Claude 頁是讀到全文；其餘只有搜尋摘要，標在這裡。

## 數字／事實（片中）
四行、五次、平均 1.6 分、滿分 5、三行（B 的回覆行數）。

## 還不知道（內部紀錄，片中不放）
只測 1 個模型、1 個請求；各 App 在產品裡如何處理規則檔沒有逐一實測。
