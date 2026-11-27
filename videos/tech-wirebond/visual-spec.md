# tech-wirebond 畫面規格（模組與細節清單見 physics-spec.md §1；程式在 gen-model.mjs）
- 站別：A 導線架上的晶片（x＝0）｜B 打線機（x＝60）｜C 劈刀特寫（x＝120）｜D 焊點剖面（x＝170）｜E 金線與銅線（x＝250）。
- 2D 卡：src/components/three/HudWirebond.tsx（wb-hook、wb-path、wb-needle、wb-steps、wb-clay、wb-speed、wb-cu、wb-co、wb-next）。
- 背景層（bg，不算主素材框）：導線架、機殼與護罩、劈刀筒身與換能器桿、晶片與引腳本體、加熱台、打火棒座、細基底、線軸等；主素材＝焊墊、球、劈刀尖、線。
