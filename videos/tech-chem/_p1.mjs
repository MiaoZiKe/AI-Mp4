
// ═════ 濕式化學品專用色票與材質 ═════
Object.assign(palette, {
  hdpeC: "#EEF2F6", drumC: "#2F6DB5", drumDarkC: "#1F4E86", pfaC: "#F2EFE6", pfaDarkC: "#CFC8B8", concC: "#B9B5AD", concDarkC: "#8E8A82", poolC: "#4FC3E8", tileC: "#E6F1F5", tileLineC: "#9FC4D0",
  cleanC: "#7FC8F0", etchC: "#F2C94C", slurryC: "#F1ECE2", silicaC: "#E3EAF5", ceriaC: "#EFD98A", dustC: "#3F444C", rustC: "#B5532B", rustDarkC: "#7E3318", padC: "#8F96A3", padDarkC: "#6E7482",
  acidC: "#D7E86A", oxidC: "#E5484D", ironC: "#6A727F", ironDarkC: "#3E444E", blueP: "#2F7FE0", lumpC: "#8A8F96", scratchC: "#E5484D", woodC: "#C9A66B", woodDarkC: "#9C7B45", lemonC: "#F5D948", n2mistC: "#DCE6F2", upwC: "#6CB6F0", wasteC: "#9AA1AB",
});
Object.assign(materials, {
  hdpe: M("std", "hdpeC", { rough: 0.6, metal: 0.05, env: 0.3 }), hdpeT: M("phys", "hdpeC", { rough: 0.3, metal: 0, clearcoat: 1, opacity: 0.32, env: 0.5 }),
  drum: M("std", "drumC", { rough: 0.55, metal: 0.1, env: 0.35 }), drumDark: M("std", "drumDarkC", { rough: 0.6, metal: 0.1 }),
  pfa: M("std", "pfaC", { rough: 0.45, metal: 0, env: 0.4 }), pfaT: M("phys", "pfaC", { rough: 0.25, metal: 0, clearcoat: 1, opacity: 0.38, env: 0.5 }), pfaDark: M("std", "pfaDarkC", { rough: 0.5, metal: 0 }),
  conc: M("std", "concC", { rough: 0.95, metal: 0 }), concDark: M("std", "concDarkC", { rough: 0.95, metal: 0 }),
  pool: M("phys", "poolC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.7, env: 0.5 }), tile: M("std", "tileC", { rough: 0.4, metal: 0.1 }), tileLine: M("std", "tileLineC", { rough: 0.6, metal: 0 }),
  clean: M("phys", "cleanC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.5 }), etch: M("phys", "etchC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.6, env: 0.5 }), slurry: M("phys", "slurryC", { rough: 0.2, metal: 0, clearcoat: 0.5, opacity: 0.62, env: 0.4 }),
  slurryS: M("std", "slurryC", { rough: 0.4, metal: 0, opacity: 0.9, env: 0.4 }), silica: M("phys", "silicaC", { rough: 0.15, metal: 0.05, clearcoat: 1, opacity: 0.92, env: 0.8 }), ceria: M("std", "ceriaC", { rough: 0.4, metal: 0.1, env: 0.6 }),
  dust: M("std", "dustC", { rough: 0.9, metal: 0 }), rust: M("std", "rustC", { rough: 0.9, metal: 0.1 }), rustDark: M("std", "rustDarkC", { rough: 0.95, metal: 0.1 }),
  pad: M("std", "padC", { rough: 0.9, metal: 0, env: 0.15 }), padDark: M("std", "padDarkC", { rough: 0.9, metal: 0 }),
  acid: M("phys", "acidC", { rough: 0.05, metal: 0, clearcoat: 1, opacity: 0.62, env: 0.5 }), oxid: glowM("oxidC", 0.95, 0.4), blueP: glowM("blueP", 0.95, 0.4),
  iron: M("std", "ironC", { rough: 0.55, metal: 0.8, env: 0.5, tex: "brushed", texScale: 2 }), ironDark: M("std", "ironDarkC", { rough: 0.6, metal: 0.7, env: 0.4 }), ironGhost: M("phys", "ironC", { rough: 0.4, metal: 0.6, clearcoat: 1, opacity: 0.22, env: 0.6 }),
  lump: M("std", "lumpC", { rough: 0.9, metal: 0.05 }), scratch: glowM("scratchC", 0.95, 0.5), wood: M("std", "woodC", { rough: 0.9, metal: 0 }), woodDark: M("std", "woodDarkC", { rough: 0.95, metal: 0 }),
  lemon: M("std", "lemonC", { rough: 0.55, metal: 0, emissive: "lemonC", ei: 0.15 }), n2mist: glowM("n2mistC", 0.5, 0.3), upw: M("std", "upwC", { rough: 0.35, metal: 0.4, env: 0.4 }), waste: M("std", "wasteC", { rough: 0.6, metal: 0.2, env: 0.3 }),
  dustGlow: glowM("warnC", 0.85, 0.9), sparkle: glowM("cleanC", 0.9, 0.8),
});
const FLUID = ["liqClean", "liqEtch", "liqSlurry"];
const V2 = [0, 0, 0];
const PIPEC = (id, layer, pts, r, mat, o = {}) => PIPE(id, layer, pts, r, mat, o);   // 同 PIPE
/** 裝在管上的管夾：每隔 gap 一個圓環＋立柱底座（避免一根直棒）。pts 同 PIPE */
const CLAMPS = (id, layer, x0, x1, y, z, r, gap, standTo = 0) => {
  const at = []; for (let x = x0; x <= x1 + 1e-6; x += gap) at.push([R2(x), 0, 0]);
  P({ id: `${id}Ring`, layer, shape: "tube", size: [r * 1.55, r * 1.12, 0.22], rot: HX, pos: [0, y, z], at, mat: "dark" });
  P({ id: `${id}Bolt`, layer, shape: "cyl", size: [0.05, 0.3], pos: [0, y + r * 1.5, z], rot: V, at, mat: "steel" });
  if (standTo > 0) { P({ id: `${id}Post`, layer, shape: "box", size: [0.2, y - r * 1.5 - standTo, 0.2], pos: [0, R2(standTo + (y - r * 1.5 - standTo) / 2), z], at, mat: "steel" }); P({ id: `${id}Foot`, layer, shape: "box", size: [0.9, 0.1, 0.9], pos: [0, R2(standTo + 0.05), z], at, mat: "dark" }); }
};
/** 雙層管：內管＋外套管（半透明灰）＋端部環與管夾 */
const DPIPE = (id, layer, pts, r, o = {}) => {
  PIPE(`${id}In`, layer, pts, r, "pfa");
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0, z1 - z0), rot = Math.abs(x1 - x0) > 1e-6 ? HX : Math.abs(y1 - y0) > 1e-6 ? V : [0, 0, 0];
    P({ id: `${id}Out${i}`, layer, shape: "tube", size: [r * 1.75, r * 1.6, R2(L - 0.5)], rot, pos: [R2((x0 + x1) / 2), R2((y0 + y1) / 2), R2((z0 + z1) / 2)], mat: "pfaT" });
  }
};
const pt = (x, y, z) => [x, y, z];
/** 20 公升桶（carboy）：半透明桶身＋液體＋蓋＋把手＋標籤 */
const JUG = (id, layer, x, z, liqMat, labelMat) => {
  P({ id: `${id}Body`, layer, shape: "slab", size: [3.0, 4.2, 2.4], r: 0.4, pos: [x, 0.1 + 2.1, z - 1.2], mat: "hdpeT" });
  P({ id: `${id}Liq`, layer, shape: "slab", size: [2.7, 3.1, 2.1], r: 0.3, pos: [x, 0.25 + 1.55, z - 1.05], mat: liqMat });
  VC(`${id}Neck`, layer, 0.62, 4.2, 4.7, "hdpe", { x, z }); VC(`${id}Cap`, layer, 0.74, 4.7, 5.1, labelMat, { x, z });
  P({ id: `${id}Rib`, layer, shape: "tube", size: [0.78, 0.66, 0.05], rot: V, pos: [x, 4.9, z], at: [[0, 0.1, 0], [0, -0.1, 0]], mat: "dark" });
  BOX(`${id}Handle`, layer, x + 0.9, x + 1.4, 3.4, 4.2, z - 0.35, z + 0.35, "hdpe"); BOX(`${id}Label`, layer, x - 1.1, x + 1.1, 1.0, 2.6, z + 0.0, z + 0.04, labelMat);
  BOX(`${id}LabelTx`, layer, x - 0.8, x + 0.8, 1.5, 1.9, z + 0.04, z + 0.07, "dark"); BOX(`${id}Haz`, layer, x - 0.4, x + 0.4, 2.0, 2.4, z + 0.04, z + 0.07, "warnY");
};
/** 立式儲槽：槽身、底、頂蓋（扁球）、人孔蓋與螺栓圈、液位計視窗、爬梯、氮封呼吸閥、出口閥與手輪、銘牌 */
const TANK = (id, layerBody, layerFit, x, z, R, H, o = {}) => {
  VT(`${id}Wall`, layerBody, R, R - 0.1, 0.5, H, "hdpe", { x, z });
  VT(`${id}Rib`, layerBody, R + 0.06, R - 0.05, 0.5, H, "pfaDark", { x, z, at: [[0, 0, 0]] });
  P({ id: `${id}Hoop`, layer: layerBody, shape: "tube", size: [R + 0.12, R - 0.02, 0.2], rot: V, pos: [x, 0.5, z], at: [2, 5, 8, 11].filter((y) => y < H - 1).map((y) => [0, y, 0]), mat: "steel" });
  VC(`${id}Bot`, layerBody, R, 0.4, 0.6, "dark", { x, z });
  P({ id: `${id}Dome`, layer: layerBody, shape: "sphere", size: [R], scale: [1, 0.24, 1], pos: [x, H, z], mat: "hdpe" });
  VC(`${id}Man`, layerFit, 1.5, H + R * 0.24 - 0.05, H + R * 0.24 + 0.3, "steel2", { x, z });
  P({ id: `${id}ManBolt`, layer: layerFit, shape: "cyl", size: [0.09, 0.14], rot: V, pos: [x, H + R * 0.24 + 0.36, z], at: RING(10, 1.25).map(([a, , b]) => [a, 0, b]), mat: "steel" });
  VC(`${id}ManHand`, layerFit, 0.25, H + R * 0.24 + 0.3, H + R * 0.24 + 0.55, "dark", { x, z });
  PIPE(`${id}Vent`, layerFit, [[x + 2.6, H + R * 0.24 * 0.6, z], [x + 2.6, H + 2.2, z], [x + 3.4, H + 2.2, z]], 0.16, "pfa");
  VC(`${id}Breath`, layerFit, 0.34, H + 2.2, H + 2.7, "steel2", { x: x + 3.4, z });
  // 液位計：側面透明視窗＋刻度＋浮標
  BOX(`${id}Gauge`, layerFit, x + R - 0.05, x + R + 0.35, 2, H - 1.5, z - 0.3, z + 0.3, "window"); BOX(`${id}GaugeLiq`, layerFit, x + R + 0.02, x + R + 0.3, 2, 2 + (H - 3.5) * 0.65, z - 0.18, z + 0.18, "liqClean");
  P({ id: `${id}GaugeTick`, layer: layerFit, shape: "box", size: [0.2, 0.05, 0.05], pos: [x + R + 0.4, 0, z + 0.34], at: Array.from({ length: 9 }, (_, i) => [0, 2.2 + i * ((H - 4) / 8), 0]), mat: "dark" });
  // 爬梯（左側）
  P({ id: `${id}LadRail`, layer: layerFit, shape: "box", size: [0.12, H - 0.6, 0.12], pos: [x - R - 0.55, (H + 0.4) / 2, z], at: [[0, 0, -0.5], [0, 0, 0.5]], mat: "steel" });
  P({ id: `${id}LadRung`, layer: layerFit, shape: "cyl", size: [0.05, 1.0], pos: [x - R - 0.55, 0, z], at: Array.from({ length: Math.floor((H - 1.5) / 0.9) }, (_, i) => [0, 1.0 + i * 0.9, 0]), mat: "steel" });
  BOX(`${id}Plate`, layerFit, x - 1.2, x + 1.2, 6.4, 7.6, z + R - 0.02, z + R + 0.05, "steel2"); BOX(`${id}PlateTx`, layerFit, x - 0.9, x + 0.9, 6.7, 7.0, z + R + 0.05, z + R + 0.08, "dark"); BOX(`${id}PlateTx2`, layerFit, x - 0.9, x + 0.5, 7.1, 7.3, z + R + 0.05, z + R + 0.08, "dark");
  // 出口：短管＋球閥＋手輪
  HXC(`${id}Out`, layerFit, 0.26, x + R - 0.2, x + R + 1.5, 1.6, z, "pfa");
  P({ id: `${id}OutVal`, layer: layerFit, shape: "sphere", size: [0.5], pos: [x + R + 1.0, 1.6, z], mat: "steel2" });
  VC(`${id}OutStem`, layerFit, 0.08, 1.9, 2.5, "steel", { x: x + R + 1.0, z }); BOX(`${id}OutWheel`, layerFit, x + R + 0.4, x + R + 1.6, 2.5, 2.62, z - 0.12, z + 0.12, "estop");
  BOX(`${id}Skid`, layerFit, x - R - 0.3, x + R + 0.3, 0, 0.5, z - R - 0.3, z + R + 0.3, "conc");
};
/** 機櫃外殼（含前門、底座）：回傳常數，細節各站自己加 */
const CAB = (id, x, w, d, h, layerBase, layerWall, layerDoor) => {
  const x0 = x - w / 2, x1 = x + w / 2, z0 = -d / 2, z1 = d / 2, B = 0.6;
  BOX(`${id}Plinth`, layerBase, x0 - 0.2, x1 + 0.2, 0, B, z0 - 0.2, z1 + 0.2, "band");
  P({ id: `${id}Foot`, layer: layerBase, shape: "cyl", size: [0.28, 0.16], rot: V, pos: [x, 0.08, 0], at: [[-w / 2 + 0.4, 0, -d / 2 + 0.4], [w / 2 - 0.4, 0, -d / 2 + 0.4], [-w / 2 + 0.4, 0, d / 2 - 0.4], [w / 2 - 0.4, 0, d / 2 - 0.4]], mat: "dark" });
  BOX(`${id}FloorPl`, layerBase, x0 + 0.1, x1 - 0.1, B, B + 0.1, z0 + 0.1, z1 - 0.1, "cabDark");
  BOX(`${id}Back`, layerWall, x0, x1, B, h, z0, z0 + 0.14, "cab"); BOX(`${id}Left`, layerWall, x0, x0 + 0.14, B, h, z0, z1, "cab"); BOX(`${id}Right`, layerWall, x1 - 0.14, x1, B, h, z0, z1, "cab"); BOX(`${id}Top`, layerWall, x0, x1, h - 0.14, h, z0, z1, "cab");
  P({ id: `${id}Seam`, layer: layerWall, shape: "box", size: [0.04, h - B, 0.04], pos: [x, (h + B) / 2, z0 + 0.15], at: [[-w / 4, 0, 0], [w / 4, 0, 0]], mat: "seam" });
  P({ id: `${id}Screw`, layer: layerWall, shape: "cyl", size: [0.05, 0.03], pos: [x, 0, z0 + 0.16], at: grid(x0 + 0.5 - x, x1 - 0.5 - x, 5, B + 1.0, h - 1.0, 4, 0).map(([a, b]) => [a, b, 0]), mat: "steel" });
  P({ id: `${id}Louver`, layer: layerWall, shape: "box", size: [2.2, 0.06, 0.4], pos: [x1 - 1.6, 0, 0], at: Array.from({ length: 5 }, (_, i) => [0, h - 0.5 - i * 0.28, z0 + 1.4]), mat: "seam" });
  // 前門
  BOX(`${id}Door`, layerDoor, x0, x1, B, h, z1, z1 + 0.16, "cab");
  P({ id: `${id}Win`, layer: layerDoor, shape: "box", size: [w - 2.4, h * 0.38, 0.08], pos: [x, h * 0.62, z1 + 0.18], mat: "window" });
  const wy0 = h * 0.62 - h * 0.19, wy1 = h * 0.62 + h * 0.19;
  BOX(`${id}WinT`, layerDoor, x0 + 1.2, x1 - 1.2, wy1 - 0.08, wy1 + 0.08, z1 + 0.16, z1 + 0.26, "steel2"); BOX(`${id}WinB`, layerDoor, x0 + 1.2, x1 - 1.2, wy0 - 0.08, wy0 + 0.08, z1 + 0.16, z1 + 0.26, "steel2");
  BOX(`${id}WinL`, layerDoor, x0 + 1.12, x0 + 1.28, wy0, wy1, z1 + 0.16, z1 + 0.26, "steel2"); BOX(`${id}WinR`, layerDoor, x1 - 1.28, x1 - 1.12, wy0, wy1, z1 + 0.16, z1 + 0.26, "steel2");
  P({ id: `${id}Handle`, layer: layerDoor, shape: "box", size: [0.22, 1.6, 0.22], pos: [x0 + 0.55, h * 0.45, z1 + 0.3], mat: "steel2" });
  P({ id: `${id}Hinge`, layer: layerDoor, shape: "box", size: [0.3, 0.9, 0.2], pos: [x1 - 0.1, 0, z1 + 0.1], at: [[0, h * 0.2, 0], [0, h * 0.5, 0], [0, h * 0.8, 0]], mat: "dark" });
  BOX(`${id}Warn`, layerDoor, x1 - 4.2, x1 - 0.8, B + 0.7, B + 1.6, z1 + 0.16, z1 + 0.2, "warnY"); BOX(`${id}WarnTx`, layerDoor, x1 - 3.8, x1 - 1.2, B + 0.95, B + 1.3, z1 + 0.2, z1 + 0.22, "dark");
  VC(`${id}Estop`, layerDoor, 0.28, h - 1.5, h - 1.2, "estop", { x: x0 + 1.2, z: z1 + 0.3 }); P({ id: `${id}EstopRim`, layer: layerDoor, shape: "tube", size: [0.42, 0.3, 0.12], rot: V, pos: [x0 + 1.2, h - 1.55, z1 + 0.2], mat: "warnY" });
  P({ id: `${id}Led`, layer: layerDoor, shape: "sphere", size: [0.09], pos: [x0 + 2.6, h - 1.35, z1 + 0.2], at: [[0, 0, 0], [0.55, 0, 0], [1.1, 0, 0]], mat: "lampG" });
  return { x0, x1, z0, z1, B };
};
