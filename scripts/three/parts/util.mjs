// 固定 seed 的亂數（零件庫用：壞晶粒位置每次一樣）
export const seeded = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
