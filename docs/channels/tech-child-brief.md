# 科技透明圈子聊天室：一頁開工說明（只讀這頁＋該片規格）

- 目標：一個主題做到「雙審 ≥8、六項檢查 0 error」就交件，交件後停，不接下一個主題（新主題開新聊天室）。
- 分支：claude/nifty-goodall-syke8a-1548；推送 `git pull -q --rebase --autostash origin <分支>; git push -q origin HEAD:<分支>`。
- 流程：研究（research.md，數字要有出處）→ 念稿（≤260 字、≥3 比喻、≤2 數字、開場 3 秒內問句接前一集、結尾鉤子＋留言關鍵字、公司名後接半句說明）先傳全文給頻道聊天室 → 建模（model.json／genscript.py）→ precheck／validate／layout-check／card-overlap／kinematics／flow 0 error → 雙審（機台、物理各 ≥8）。
- 必守規則：tech-andy-fixes.md 第 38（不加運作音效）、39（旁白之間無聲 ≤1.0 秒）、40（公司卡 ≥1.2 秒×家數＋1.5、念完最後一家後 ≥1 秒才換幕）條；其他條遇到再查，不必整份讀。
- 省 token：審片抽關鍵格、縮到 ≤540 寬再看；指令輸出 `| tail`；不印整份 log／JSON；前文超過 25 萬 token 就停下回報。
- 不做：配音、送 TTS、渲染整片（頻道聊天室做）。
