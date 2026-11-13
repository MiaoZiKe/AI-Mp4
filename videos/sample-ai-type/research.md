# sample-ai-type 查證紀錄（AI 教學風格試片）

查證日期：2026/11/13（台灣時間）。題目：「提示詞只打一句話？官方指南說要有四塊」。

## 旁白裡的事實與出處

| 旁白說法 | 狀態 | 出處 | 我實際看到什麼 |
|---|---|---|---|
| Google 的官方指南說，好的提示詞有四塊：角色、任務、背景、格式 | 已確定 | Google Workspace《Gemini for Google Workspace Prompting guide 101》（2024/4 發布，之後有改版）；Google Workspace 官網「Writing effective prompts」頁；Chrome 企業版說明頁「Get started with Gemini in Chrome」 | 只看到搜尋結果摘要。摘要一致寫四個要素是 Persona、Task、Context、Format；Chrome 說明頁的摘要把四項解釋成「Gemini 要扮演的角色、要做的動作、需要的細節、輸出的形式」。PDF 本身（services.google.com）這個環境連不上，沒有親眼讀到原文 |
| 四塊補上去，回答更貼近你要的 | 分析預期（官方建議，不是量測數字） | 同上；OpenAI Help Center「Best practices for prompt engineering with the OpenAI API」 | 摘要：Google 指南寫「不需要四項都用，但用上幾項會有幫助」；OpenAI 說明文章寫「對想要的背景、結果、長度、格式、風格，寫得越具體越好」。兩者都是官方的寫法建議，沒有給「好多少」的數字，所以旁白只說「更貼近你要的」，不說倍數 |

中文譯名：Persona→角色、Task→任務、Context→背景、Format→格式（自己翻的，官方繁中版用詞沒有查到）。

## 沒有採用的說法

- 「最有效的提示詞平均約 21 個英文單字」：Android Authority 等二手報導有寫，但這次沒有在 Google 自己的文字裡確認到，所以旁白和畫面都不用。
- 「不用四項都寫」：官方原意是用上幾項就有幫助。旁白為了短，只講「四塊補上去」；README 的人耳確認清單有提醒，正式片應該補一句「不用每次都四塊寫滿」。

## 畫面上的示範文字

聊天框裡的提示詞與 AI 回覆（手沖咖啡新品貼文）是自己編的示範，不是任何真實產品的輸出；畫面不出現任何真實產品的商標或介面截圖，聊天視窗是自製的中性介面。

## 來源網址

- https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf （連不上，僅摘要）
- https://workspace.google.com/resources/ai/writing-effective-prompts （僅摘要）
- https://support.google.com/chrome/a/answer/17031594 （僅摘要）
- https://9to5google.com/2024/04/09/gemini-google-workspace-prompting-guide/ （僅摘要，二手報導）
- https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api （僅摘要）
