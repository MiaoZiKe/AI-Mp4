# tech-server：AI 伺服器（科技透明圈 第 7 支，11/20（五）20:00）
進度（2026/11/17）：research.md、念稿、genmodel.py／genscript.py、HudServer.tsx（srv-* 四種 2D 示意卡）完成；validate 0 error、layout-check 0 error；無聲抽格看過。下一步：送 TTS 1 次 → make-tech.sh。
- 鏡頭 yaw 是「累加」：每鏡寫的是相對上一鏡的增量（s4 +2.4、s7 −2.4／+2.55、s8 −2.2、s9 +1.65）。
- 運作動畫：資料（銅線背板）、電（電源層→銅排→每層）、冷卻液（冷進熱出、顏色隨溫度）、風冷（風扇轉、氣流線、散熱鰭片）→換冷板。
- 改程式後：python3 genmodel.py && python3 genscript.py。
