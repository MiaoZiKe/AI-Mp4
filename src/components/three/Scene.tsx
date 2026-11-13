// 3D 產品台的模型：一支用基本形狀自己建的示意手機（不是任何特定機型、沒有商標）。
// 五層：背蓋｜電池＋主機板（晶片）｜均熱板｜中框｜螢幕。姿態、層距、透明度、粒子全部讀 engine.ts 的 stateAt()。
// 只用實心材質與三盞燈，沒有陰影貼圖、環境貼圖、後製（軟體渲染下每多一樣都很貴）。
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { THEME_3D as T } from "../../theme";
import { G, HOT, cameraFor, type State3D } from "./engine";

const P = T.part;
/** 圓角矩形（中心在原點） */
const rr = (w: number, h: number, r: number) => {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};
/** 圓角板（厚 t，z 置中；b＝邊緣倒角） */
const slab = (w: number, h: number, r: number, t: number, b = 0.03) => {
  const g = new THREE.ExtrudeGeometry(rr(w - 2 * b, h - 2 * b, Math.max(0.01, r - b)), { depth: Math.max(0.001, t - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -(t - 2 * b) / 2);
  return g;
};
/** 圓角框（邊寬 bw） */
const ring = (w: number, h: number, r: number, bw: number, t: number) => {
  const s = rr(w, h, r);
  s.holes.push(rr(w - 2 * bw, h - 2 * bw, Math.max(0.01, r - bw)));
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -t / 2);
  return g;
};
const flat = (w: number, h: number, r: number) => new THREE.ShapeGeometry(rr(w, h, r), 8);

const STRIPS = 12;
const makeGeo = () => {
  const pl = G.plate;
  return {
    back: slab(G.W, G.H, G.R, 0.14), island: slab(3.1, 3.3, 0.7, 0.16), lens: new THREE.CylinderGeometry(0.62, 0.62, 0.14, 28), lensRing: new THREE.CylinderGeometry(0.78, 0.78, 0.08, 28),
    battery: slab(5.9, 8.2, 0.45, 0.3), band: slab(5.92, 1.1, 0.1, 0.31, 0.01), board: slab(6.3, 4.7, 0.5, 0.14), chip: slab(G.chip.s, G.chip.s, 0.14, 0.26), chipTop: flat(G.chip.s - 0.36, G.chip.s - 0.36, 0.08),
    partA: slab(1.5, 0.8, 0.1, 0.2), partB: slab(0.7, 1.6, 0.1, 0.18), partC: slab(2.2, 0.5, 0.08, 0.16),
    rim: ring(pl.w, pl.h, pl.r, 0.2, pl.t), lid: slab(pl.w, pl.h, pl.r, 0.07, 0.02), strip: new THREE.BoxGeometry(pl.w - 0.3, (pl.h - 0.3) / STRIPS + 0.01, 0.05),
    frame: ring(G.W, G.H, G.R, 0.3, G.TH), screen: slab(G.W - 0.24, G.H - 0.24, G.R - 0.1, 0.12),
    wall: flat(G.W - 0.7, G.H - 0.7, G.R - 0.3), tileA: flat(2.7, 2.7, 0.5), tileB: flat(5.8, 1.5, 0.45), pill: flat(2.4, 0.5, 0.25),
    shadow: flat(G.W * 1.08, G.H * 1.05, G.R), ball: new THREE.SphereGeometry(1, 14, 10),
  };
};

/** 相機跟著狀態走（和標籤投影用同一組數字） */
const CameraRig: React.FC<{ s: State3D }> = ({ s }) => {
  const cam = useThree((x) => x.camera) as THREE.PerspectiveCamera;
  const c = cameraFor(s);
  cam.fov = c.fov; cam.aspect = c.aspect; cam.near = c.near; cam.far = c.far;
  cam.position.copy(c.position); cam.quaternion.copy(c.quaternion);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  return null;
};

const Mat: React.FC<{ color: string; o?: number; rough?: number; metal?: number; emissive?: string; ei?: number }> = ({ color, o = 1, rough = 0.62, metal = 0.05, emissive, ei = 0 }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} transparent={o < 1} opacity={o} depthWrite={o >= 0.99} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
);
const lerpHex = (a: string, b: string, t: number) => `#${new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t))).getHexString()}`;

export const PhoneScene: React.FC<{ s: State3D }> = ({ s }) => {
  const g = useMemo(makeGeo, []);
  const Ly = s.layers, pl = G.plate;
  const lidO = 1 - Math.max(0, (s.lid - 0.45) / 0.55);
  const stripH = (pl.h - 0.3) / STRIPS;
  const hotV = pl.h / 2 - 0.15 - HOT.y; // 熱點離板子頂端多遠
  return (
    <>
      <CameraRig s={s} />
      <ambientLight intensity={T.light.ambient} />
      <directionalLight position={[8, 18, 14]} intensity={T.light.key} />
      <directionalLight position={[-12, 6, 8]} intensity={T.light.fill} />
      <group rotation={[0, s.yaw, 0]}>
        <group rotation={[s.pitch, 0, 0]}>
          {/* 地面假陰影（躺下後才出現） */}
          {s.lay > 0.02 ? <mesh geometry={g.shadow} position={[0, 0, Math.min(Ly.back.z, Ly.inner.z) - 1.4]}><meshBasicMaterial color={P.shadow} transparent opacity={T.shadow * s.lay} depthWrite={false} /></mesh> : null}

          {/* 背蓋（鏡頭島在外側） */}
          {Ly.back.opacity > 0.01 ? (
            <group position={[0, 0, Ly.back.z]}>
              <mesh geometry={g.back}><Mat color={P.back} o={Ly.back.opacity} rough={0.5} /></mesh>
              <mesh geometry={g.island} position={[-1.55, 5.15, -0.12]}><Mat color={P.island} o={Ly.back.opacity} /></mesh>
              {[[-2.25, 5.85], [-0.85, 5.85], [-2.25, 4.45]].map(([x, y], i) => (
                <group key={i} position={[x, y, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
                  <mesh geometry={g.lensRing}><Mat color={P.lensRing} o={Ly.back.opacity} metal={0.4} rough={0.35} /></mesh>
                  <mesh geometry={g.lens} position={[0, -0.05, 0]}><Mat color={P.lens} o={Ly.back.opacity} rough={0.2} /></mesh>
                </group>
              ))}
            </group>
          ) : null}

          {/* 電池＋主機板＋晶片 */}
          <group position={[0, 0, Ly.inner.z]}>
            <mesh geometry={g.battery} position={[0, -2.95, 0]}><Mat color={P.battery} /></mesh>
            <mesh geometry={g.band} position={[0, -5.6, 0]}><Mat color={P.batteryBand} /></mesh>
            <mesh geometry={g.board} position={[0, 4.55, -0.08]}><Mat color={P.board} /></mesh>
            <mesh geometry={g.chip} position={[G.chip.x, G.chip.y, 0.1]}><Mat color={lerpHex(P.chip, P.hot, s.heat)} emissive={P.hot} ei={s.heat * 0.9} /></mesh>
            <mesh geometry={g.chipTop} position={[G.chip.x, G.chip.y, 0.235]}><Mat color={lerpHex(P.chipTop, P.warm, s.heat)} metal={0.3} rough={0.4} emissive={P.hot} ei={s.heat * 0.5} /></mesh>
            <mesh geometry={g.partA} position={[1.7, 5.6, 0.06]}><Mat color={P.boardPart} /></mesh>
            <mesh geometry={g.partB} position={[2.3, 3.6, 0.06]}><Mat color={P.boardPart} /></mesh>
            <mesh geometry={g.partC} position={[-0.6, 2.75, 0.06]}><Mat color={P.boardPart} /></mesh>
            <mesh geometry={g.partA} position={[0.9, 3.5, 0.06]}><Mat color={P.chip} /></mesh>
          </group>

          {/* 均熱板：外框＋底板（分成 12 條，各自依熱度變色）＋上蓋（掀開後看得到裡面） */}
          <group position={[0, pl.y, Ly.plate.z]}>
            <mesh geometry={g.rim}><Mat color={P.plateRim} metal={0.35} rough={0.42} /></mesh>
            {Array.from({ length: STRIPS }, (_, i) => {
              const yTop = pl.h / 2 - 0.15 - i * stripH, mid = yTop - stripH / 2;
              const u = Math.abs(pl.h / 2 - 0.15 - mid - hotV) / (pl.h - 0.3 - hotV);
              const h = s.heatAt(Math.min(1, u));
              return <mesh key={i} geometry={g.strip} position={[0, mid, -pl.t / 2 + 0.03]}><Mat color={lerpHex(i % 2 ? P.plateFloor : P.wick, P.hot, h * 0.9)} emissive={P.hot} ei={h * 0.35} rough={0.7} /></mesh>;
            })}
            {lidO > 0.01 ? <mesh geometry={g.lid} position={[-(pl.w + 1.6) * s.lid, 0, pl.t / 2 + 0.03 + 0.5 * Math.sin(Math.PI * Math.min(1, s.lid))]}><Mat color={P.plate} o={lidO} metal={0.45} rough={0.36} /></mesh> : null}
            {/* 水滴／蒸氣 */}
            {s.lid > 0.05 ? s.parts.map((p, i) => (p.scale > 0.01 ? (
              <mesh key={i} geometry={g.ball} position={[p.x, p.y, -pl.t / 2 + 0.06 + p.z]} scale={[p.scale, p.scale, p.scale * p.flat]}>
                <Mat color={lerpHex(P.water, P.vapor, p.gas)} rough={0.25} emissive={lerpHex(P.water, P.vapor, p.gas)} ei={0.25 + 0.35 * p.gas} />
              </mesh>
            ) : null)) : null}
          </group>

          {/* 中框 */}
          {Ly.frame.opacity > 0.01 ? <mesh geometry={g.frame} position={[0, 0, Ly.frame.z]}><Mat color={P.frame} o={Ly.frame.opacity} metal={0.5} rough={0.34} /></mesh> : null}

          {/* 螢幕（上面是自己畫的中性畫面：一塊底色＋幾個色塊） */}
          {Ly.screen.opacity > 0.01 ? (
            <group position={[0, 0, Ly.screen.z]}>
              <mesh geometry={g.screen}><Mat color={P.screen} o={Ly.screen.opacity} rough={0.25} /></mesh>
              {([[g.wall, 0, 0, P.screenUi, 0.065], [g.pill, 0, 6.3, P.screen, 0.07], [g.tileA, -1.55, 3.3, P.screenUi2, 0.07], [g.tileA, 1.55, 3.3, P.screenUi3, 0.07], [g.tileB, 0, 0.7, T.panel, 0.07], [g.tileB, 0, -1.2, P.screenUi2, 0.07], [g.pill, 0, -6.5, T.panel, 0.07]] as [THREE.BufferGeometry, number, number, string, number][]).map(([geo, x, y, c, z], i) => (
                <mesh key={i} geometry={geo} position={[x, y, z]}><meshBasicMaterial color={c} transparent={Ly.screen.opacity < 1} opacity={Ly.screen.opacity} depthWrite={Ly.screen.opacity >= 0.99} /></mesh>
              ))}
            </group>
          ) : null}
        </group>
      </group>
    </>
  );
};
