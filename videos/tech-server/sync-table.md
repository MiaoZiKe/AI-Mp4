# tech-server v2 逐句念稿 ↔ 該時刻畫面（每句字幕開始後 0.3 秒取一格）

| # | 場次 | 時間 | 念稿（字幕） | 該句對到的畫面事件（cue 觸發） | 截圖 |
|---|---|---|---|---|---|
| 1 | s1 | 0.3s | 一櫃 AI 伺服器 | [一櫃] （接續上一事件） | ![](out/tech-server-sync/01.jpg) |
| 2 | s1 | 1.4s | 約一點四公噸 | [一點四公噸] 疊層：約 1.4 公噸 | ![](out/tech-server-sync/02.jpg) |
| 3 | s1 | 2.5s | 跟一台小客車差不多重 | [小客車] 疊層：≈ 小客車 | ![](out/tech-server-sync/03.jpg) |
| 4 | s1 | 4.2s | 耗電一百多千瓦 | [一百多千瓦] 動作：r_cglow、疊層：120–132 kW | ![](out/tech-server-sync/04.jpg) |
| 5 | s1 | 5.8s | 裡面到底裝了什麼？ | [裝了什麼] 位移：c8、疊層：裡面？ | ![](out/tech-server-sync/05.jpg) |
| 6 | s2 | 7.6s | 拆開看 | [拆開看] 位移：frame、2D 卡「一櫃裡有幾顆」段 tray | ![](out/tech-server-sync/06.jpg) |
| 7 | s2 | 8.4s | 有七十二顆 GPU | [七十二顆] 引線標籤：運算托盤（GPU）、2D 卡「一櫃裡有幾顆」段 gpu | ![](out/tech-server-sync/07.jpg) |
| 8 | s2 | 9.8s | 也就是做運算的 | [做運算] 動作：r_cglow | ![](out/tech-server-sync/08.jpg) |
| 9 | s2 | 10.8s | AI 晶片 | [AI 晶片] 疊層：廠商公布 | ![](out/tech-server-sync/09.jpg) |
| 10 | s3 | 12.1s | 它們分在十八層托盤 | [十八層托盤] 動作：r_c8glow、位移：c8 | ![](out/tech-server-sync/10.jpg) |
| 11 | s3 | 13.7s | 每層四顆 | [每層四顆] 動作：t_gpuhot、動作：t_gpuhot1、動作：t_data、動作：t_rear、動作：t_rear2、動作：t_pwr、動作：t_vrm、動作：t_vrm0、動作：t_vrm1、引線標籤：電路板 PCB、引線標籤：供電模組 VRM、引線標籤：GPU × 4、位移：vrm0、位移：vrm1、位移：tpw、位移：trc、位移：tp_nic、位移：sc0、位移：sc1、位移：sc0_c、位移：sc0_g0、位移：sc0_g1、位移：sc1_c、位移：sc1_g0、位移：sc1_g1 | ![](out/tech-server-sync/11.jpg) |
| 12 | s3 | 14.6s | 旁邊配兩顆 CPU | [兩顆] 動作：t_cpuglow、引線標籤：CPU × 2 | ![](out/tech-server-sync/12.jpg) |
| 13 | s4 | 16.7s | 為什麼要整櫃一起設計？ | [整櫃一起設計] 動作：r_frglow、疊層：整櫃一起設計 | ![](out/tech-server-sync/13.jpg) |
| 14 | s4 | 18.4s | 因為七十二顆 | [七十二顆] 動作：r_cglow | ![](out/tech-server-sync/14.jpg) |
| 15 | s4 | 19.4s | 要像一顆一樣工作 | [像一顆] 2D 卡「72 顆怎麼變一顆」段 one | ![](out/tech-server-sync/15.jpg) |
| 16 | s4 | 20.9s | 得不停傳資料 | [不停傳資料] 動作：d_spine、動作：d_spine2、2D 卡「72 顆怎麼變一顆」段 link | ![](out/tech-server-sync/16.jpg) |
| 17 | s5 | 22.6s | 中間九層交換器 | [九層交換器] 動作：r_swglow、引線標籤：交換器 ×9 | ![](out/tech-server-sync/17.jpg) |
| 18 | s5 | 23.9s | 用五千多條銅線串起來 | [五千多條銅線] 動作：d_spine、動作：d_spine2、引線標籤：銅線背板、疊層：超過 5,000 條 | ![](out/tech-server-sync/18.jpg) |
| 19 | s5 | 25.8s | 每顆 GPU 都找得到 | [找得到] 動作：d_arms、疊層：每顆都連到 | ![](out/tech-server-sync/19.jpg) |
| 20 | s5 | 27.3s | 另外七十一顆 | [七十一顆] 疊層：另外 71 顆 | ![](out/tech-server-sync/20.jpg) |
| 21 | s6 | 29.0s | 電從電源層進來 | [電源層] 動作：r_pwglow、引線標籤：電源層、2D 卡「電怎麼進來」段 in | ![](out/tech-server-sync/21.jpg) |
| 22 | s6 | 30.4s | 順著銅排送到每一層 | [銅排] 動作：p_arm_l、動作：p_arm_r、動作：p_up、動作：p_dn、動作：p_up2、動作：p_dn2、2D 卡「電怎麼進來」段 bus | ![](out/tech-server-sync/22.jpg) |
| 23 | s6 | 32.1s | 最後都變成熱 | [變成熱] 動作：t_vrm、動作：t_vrm0、動作：t_vrm1、動作：t_pwr、2D 卡「電怎麼進來」段 heat | ![](out/tech-server-sync/23.jpg) |
| 24 | s7 | 33.9s | 風吹不動了 | [風吹不動] 動作：hs0_waves、動作：hs1_waves、動作：fan0_spin、動作：fan1_spin、動作：fan2_spin、動作：fan3_spin、動作：t_air、動作：t_air2、動作：t_air3、動作：t_air4、2D 卡「風冷 → 液冷」段 air | ![](out/tech-server-sync/24.jpg) |
| 25 | s7 | 35.2s | 所以改用冷卻液 | [冷卻液] 位移：hs0、位移：hs1、位移：fan0、位移：fan1、位移：fan2、位移：fan3、2D 卡「風冷 → 液冷」段 liq | ![](out/tech-server-sync/25.jpg) |
| 26 | s7 | 36.4s | 流過晶片 | [流過晶片] 動作：t_cold、動作：t_hot、引線標籤：蓋板、引線標籤：銅底板＋水道、引線標籤：晶片、位移：cp0、位移：cp1 | ![](out/tech-server-sync/26.jpg) |
| 27 | s7 | 37.2s | 把熱帶出機櫃外 | [帶出機櫃外] 動作：c_cold、動作：c_hot、動作：c_arm_c、動作：c_arm_h、動作：cdu_fan0、動作：cdu_fan1、2D 卡「風冷 → 液冷」段 out | ![](out/tech-server-sync/27.jpg) |
| 28 | s8a | 39.1s | 做這些的 | [做這些的] 動作：r_frglow | ![](out/tech-server-sync/28.jpg) |
| 29 | s8a | 39.8s | 有鴻海 廣達 | [鴻海] 動作：r_cglow、引線標籤：鴻海、廣達　組裝 | ![](out/tech-server-sync/29.jpg) |
| 30 | s8a | 41.1s | 緯穎組裝 | [緯穎] 動作：r_cut、引線標籤：緯穎　組裝 | ![](out/tech-server-sync/30.jpg) |
| 31 | s8a | 42.2s | 台達電做電源 | [台達電] 動作：r_pwglow、動作：p_arm_l、動作：p_arm_r、引線標籤：台達電　電源層 | ![](out/tech-server-sync/31.jpg) |
| 32 | s8b | 44.0s | 奇鋐和雙鴻做散熱 | [奇鋐] 動作：c_cold、動作：c_hot、動作：c_arm_c、動作：c_arm_h、動作：cdu_fan0、引線標籤：奇鋐、雙鴻　散熱 | ![](out/tech-server-sync/32.jpg) |
| 33 | s8b | 45.7s | 川湖做滑軌 | [川湖] 動作：r_c8glow、引線標籤：川湖　滑軌、位移：c8 | ![](out/tech-server-sync/33.jpg) |
| 34 | s8b | 46.9s | 勤誠做機殼 | [勤誠] 動作：r_frglow、引線標籤：勤誠　機殼 | ![](out/tech-server-sync/34.jpg) |
| 35 | s9 | 48.6s | 晶片 電源 風扇 | [晶片] 動作：r_cglow；[電源] 動作：p_up、動作：p_arm_l；[風扇] 動作：cdu_fan0 | ![](out/tech-server-sync/35.jpg) |
| 36 | s9 | 50.2s | 全塞進同一個櫃子 | [同一個櫃子] 動作：r_frglow | ![](out/tech-server-sync/36.jpg) |
| 37 | s9 | 51.6s | 會產生大量的熱 | [大量的熱] 動作：r_cut、動作：r_heat、疊層：大量的熱 | ![](out/tech-server-sync/37.jpg) |
| 38 | s9 | 53.0s | 所以要用特殊方法冷卻 | [特殊方法] 動作：c_cold、動作：c_hot、動作：c_arm_c、動作：c_arm_h、引線標籤：冷卻液分配單元、疊層：特殊方法冷卻 | ![](out/tech-server-sync/38.jpg) |
| 39 | s9 | 55.1s | 下一支 | [下一支] 疊層：下一支 | ![](out/tech-server-sync/39.jpg) |
| 40 | s9 | 55.7s | 來看液冷 | [液冷] 疊層：液冷 | ![](out/tech-server-sync/40.jpg) |
| 41 | s9 | 57.1s | 想要完整解說 | [完整解說] 疊層：完整解說 | ![](out/tech-server-sync/41.jpg) |
| 42 | s9 | 58.3s | 留言伺服器 | [留言伺服器] 疊層：留言「伺服器」 | ![](out/tech-server-sync/42.jpg) |
