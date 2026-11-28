# tech-carrier 素材來源（2026/11/28）

## 公司 LOGO（s9 公司卡）
| 公司 | 用法 | 來源 | 備註 |
|---|---|---|---|
| 家登精密（3680） | `Brand.tsx` 既有 `gudeng`（public/logos/gudeng.svg，官網原檔，未改色） | https://www.gudeng.com/img/logo.svg | 卡上寫「代號 3680」（research.md #16 兩源核對） |
| 中勤實業（CKplas） | 白底深色文字名牌「中勤 CKplas」（不仿商標） | 官網 https://www.ckplas.com 2026/11/28 試抓：本機代理回 403（CONNECT tunnel failed），抓不到原檔；Wikimedia Commons 查詢被限流 | 查不到上市櫃代號，不寫代號（research.md #17） |

## 國旗
- 台灣國旗：`Brand.tsx` 的 `FLAGS.TW` 程式繪製（官方比例與色碼），只畫在 2D 卡。

## 3D 貼圖
- 廠房屋頂名牌「載具廠（示意）」：`scripts/three/make-brand-tex.mjs tech-carrier text:carrierfab=載具廠|（示意）` 產生 `public/tex/brand/sign-carrierfab.png`（不進 git，gen-model.mjs 每次重產）；文字名牌，不是任何公司商標。

## 其他
- 3D 模型全部用基本形狀自建（gen-model.mjs），非特定廠牌／型號；不用照片、不用 AI 生圖。
