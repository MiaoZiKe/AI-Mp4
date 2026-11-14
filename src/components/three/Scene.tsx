// 3D 產品台的畫面：讀 model.json 的零件清單建模（model.ts），姿態、層距、透明度、熱度、粒子全部讀 engine.ts 的 stateAt()。
// 這裡沒有任何產品專屬的尺寸或顏色：換產品只換資料。燈光＝環境貼圖（程式畫的攝影棚）＋主燈（投陰影）＋補燈＋熱點點光＋光掃聚光燈。
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { THEME_3D as T } from "../../theme";
import { cameraFor, mix, type State3D } from "./engine";
import { Ops, partFxAt, partOps } from "./Ops";
import { SHADOW_PAD, buildGeo, col, fxOf, makeMaterial, puff, shadowBlob, studioEnv, type Fx, type PartDef, type ProductModel } from "./model";

/** 相機跟著狀態走（和標籤投影用同一組數字）；霧的遠近也跟著鏡頭距離 */
const Rig: React.FC<{ s: State3D; fx: Fx }> = ({ s, fx }) => {
  const cam = useThree((x) => x.camera) as THREE.PerspectiveCamera, scene = useThree((x) => x.scene), gl = useThree((x) => x.gl);
  const c = cameraFor(s);
  cam.fov = c.fov; cam.aspect = c.aspect; cam.near = c.near; cam.far = c.far;
  cam.position.copy(c.position); cam.quaternion.copy(c.quaternion);
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  // 環境貼圖只做一次（同一個分頁裡每一幀共用）
  // 物理材質（fx.pbr）才需要預先過濾的環境貼圖；預設的 Phong 路線每個材質自己帶一張便宜的環境貼圖
  useMemo(() => {
    if (!fx.env || !fx.pbr) { scene.environment = null; return; }
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromEquirectangular(studioEnv()).texture;
    pm.dispose();
  }, [scene, gl, fx.env, fx.pbr]);
  const fog = useMemo(() => new THREE.Fog(T.fog.color, 1, 100), []);
  if (fx.fog) {
    const F = T.fog, n = mix(mix(F.stand[0], F.explode[0], s.lay), F.focus[0], s.fo), fr = mix(mix(F.stand[1], F.explode[1], s.lay), F.focus[1], s.fo);
    fog.near = s.cam.d + n; fog.far = s.cam.d + fr; scene.fog = fog;
  } else scene.fog = null;
  return null;
};

const IDENT = new THREE.Quaternion();
type Built = { p: PartDef; geo: THREE.BufferGeometry; mat: THREE.Material; base: { opacity: number; color: THREE.Color; ei: number; em: THREE.Color } };

export const ProductScene: React.FC<{ model: ProductModel; s: State3D }> = ({ model, s }) => {
  const fx = useMemo(() => fxOf(model), [model]);
  const th = model.thermal;
  // 每個零件一份幾何；材質依「層／材質名／角色」共用（淡出、變熱是整組一起變）
  // 運作動畫會作用到的零件（vibrate／rotate／pulse）；會發光的零件要有自己的材質
  const pops = useMemo(() => partOps(model), [model]);
  const built = useMemo(() => {
    const mats = new Map<string, THREE.Material>();
    return model.parts.map((p): Built => {
      const key = `${p.layer}/${p.mat}/${p.role ?? ""}${p.id && pops.get(p.id)?.some(([, d]) => d.type === "pulse") ? `/${p.id}` : ""}`;
      let mat = mats.get(key);
      if (!mat) { mat = makeMaterial(model, p.mat, fx, p.role === "heatFloor"); mats.set(key, mat); }
      const sm = mat as THREE.MeshPhongMaterial;
      return { p, geo: buildGeo(p), mat, base: { opacity: model.materials[p.mat]?.opacity ?? 1, color: sm.color.clone(), ei: sm.emissiveIntensity ?? 0, em: sm.emissive ? sm.emissive.clone() : new THREE.Color(0) } };
    });
  }, [model, fx, pops]);
  const fxm = useMemo(() => {
    if (!th) return null;
    const wc = new THREE.Color(col(model, th.water));
    const water: THREE.Material = fx.pbr || fx.transmission
      ? new THREE.MeshPhysicalMaterial({ color: wc, roughness: 0.08, metalness: 0, clearcoat: fx.clearcoat ? 1 : 0, clearcoatRoughness: 0.04, emissive: wc, emissiveIntensity: 0.3, envMapIntensity: 1.4, ...(fx.transmission ? { transmission: 0.85, thickness: 0.4, ior: 1.33 } : {}) })
      : new THREE.MeshPhongMaterial({ color: wc, shininess: 120, specular: new THREE.Color(T.panel), emissive: wc, emissiveIntensity: 0.35, ...(fx.env ? { envMap: studioEnv(), combine: THREE.AddOperation, reflectivity: 0.35 } : {}) });
    const sprite = (c: string, blend: THREE.Blending) => new THREE.SpriteMaterial({ map: puff(), color: col(model, c), transparent: true, depthWrite: false, blending: blend, fog: false });
    const ramp = th.ramp.map((c) => new THREE.Color(col(model, c)));
    return {
      water, ball: new THREE.SphereGeometry(1, 18, 12), ramp,
      puffs: Array.from({ length: th.particles }, () => sprite(th.vapor, THREE.NormalBlending)),
      shimmer: Array.from({ length: th.shimmer }, () => sprite(th.shimmerColor, THREE.AdditiveBlending)),
      hot: new THREE.Color(col(model, th.sourceHot)), warm: new THREE.Color(col(model, th.sourceWarm)),
    };
  }, [model, fx, th]);
  // 光掃用的聚光燈（目標要自己加進場景）
  const spot = useMemo(() => { const l = new THREE.SpotLight(T.panel, 0, 0, T.sweepLight.angle, 0.9, 0); l.castShadow = false; return l; }, []);

  const flatGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const lidO = 1 - Math.max(0, (s.lid - 0.45) / 0.55);
  const tmp = useMemo(() => new THREE.Color(), []);
  // ── 這一幀：更新材質（淡出、變熱、透視）與底板的逐點顏色 ──
  const seen = new Set<THREE.Material>();
  for (const b of built) {
    if (seen.has(b.mat)) continue;
    seen.add(b.mat);
    const m = b.mat as THREE.MeshPhongMaterial, L = s.layers[b.p.layer];
    let o = b.base.opacity * (L?.opacity ?? 1);
    if (b.p.role === "lid") o *= lidO;
    if (b.p.role === "xray" || b.p.role === "heatFloor") o *= 1 - T.xray * s.xray;
    // 有運作動畫的模型：不透明 ↔ 半透明切換時要重編著色器（three 把「不透明」編進著色器裡；連續渲染時同一個分頁會沿用舊的，零件就不會變透明）。
    // 沒有 actions 的舊片維持原本的行為，畫面不變。
    if (model.actions && m.transparent !== o < 0.995) m.needsUpdate = true;
    m.opacity = o; m.transparent = o < 0.995; m.depthWrite = o >= 0.995;
    // 運作動畫 pulse：零件往指定顏色靠並自發光，跟著節拍一亮一暗
    const pf = b.p.id ? partFxAt(pops.get(b.p.id), s) : null;
    if (pf && m.emissive) {
      // 每一幀都從原色算起（同一個分頁不一定照順序渲）
      m.color.copy(b.base.color); m.emissive.copy(b.base.em); m.emissiveIntensity = b.base.ei;
      if (pf.color && pf.glow > 0) { tmp.set(col(model, pf.color)); m.color.lerp(tmp, pf.glow * (1 - T.ops.keep)); m.emissive.copy(tmp); m.emissiveIntensity = b.base.ei + pf.glow; }
    }
    if (b.p.role === "heatSource" && fxm) {
      m.color.copy(b.base.color).lerp(fxm.warm, s.heat * 0.75);
      m.emissive.copy(fxm.hot); m.emissiveIntensity = s.heat * 0.9;
    }
    if (b.p.role === "heatFloor" && fxm && th) {
      // 色溫漸變：離熱點愈近愈熱（銅色 → 琥珀 → 橘 → 紅），熱的前緣隨「整片」往外推
      const pos = b.geo.attributes.position, colr = b.geo.attributes.color as THREE.BufferAttribute, R = fxm.ramp;
      const far = Math.hypot(th.size[0] / 2 + Math.abs(th.hot[0]), th.size[1] / 2 + Math.abs(th.hot[1]));
      for (let i = 0; i < pos.count; i++) {
        const h = s.heatAt(Math.min(1, Math.hypot(pos.getX(i) - th.hot[0], pos.getY(i) - th.hot[1]) / far));
        const t = h * (R.length - 1), k = Math.min(R.length - 2, Math.floor(t));
        // 頂點色是乘在材質顏色上的：沒熱時＝1（原色），熱了換成色階除以底色
        tmp.copy(R[k]).lerp(R[k + 1], t - k);
        colr.setXYZ(i, mix(1, tmp.r / Math.max(0.05, b.base.color.r), Math.min(1, h * 3)), mix(1, tmp.g / Math.max(0.05, b.base.color.g), Math.min(1, h * 3)), mix(1, tmp.b / Math.max(0.05, b.base.color.b), Math.min(1, h * 3)));
      }
      colr.needsUpdate = true;
      m.emissive.copy(fxm.hot); m.emissiveIntensity = s.heat * 0.12;
    }
  }
  const thL = th ? s.layers[th.layer] : null;
  // 光掃：聚光燈從主角零件的左邊掃到右邊
  const sw = fx.sweep && th ? s.sweep : { p: 0, on: 0 };
  spot.intensity = T.sweepLight.intensity * sw.on;
  if (th) { spot.position.set(mix(-th.size[0] * 0.9, th.size[0] * 0.9, sw.p), th.center[1] + mix(-2, 2, sw.p), (thL?.z ?? 0) + T.sweepLight.height); spot.target.position.set(mix(-th.size[0] * 0.75, th.size[0] * 0.75, sw.p), th.center[1] + mix(-2.5, 2.5, sw.p), thL?.z ?? 0); }
  const lidOff: [number, number, number] = th ? [-th.lidTravel * s.lid - 0.9 * s.lidLift, 0, 0.5 * Math.sin(Math.PI * Math.min(1, s.lid)) + 1.6 * s.lidLift] : [0, 0, 0];

  return (
    <>
      <Rig s={s} fx={fx} />
      <ambientLight intensity={T.light.ambient} />
      <directionalLight position={T.light.keyPos as unknown as [number, number, number]} intensity={T.light.key * (1 - ((fx as any).layDip ?? 0) * Math.sin(Math.PI * s.lay))} castShadow={fx.shadows >= 2} shadow-mapSize={[fx.shadowSize, fx.shadowSize]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={13} shadow-camera-bottom={-13} shadow-camera-near={1} shadow-camera-far={70} shadow-bias={-0.0006} shadow-normalBias={0.04} />
      <directionalLight position={[-12, 6, 8]} intensity={T.light.fill} />
      {/* 地面只接陰影（透明），背景的棚是 HTML */}
      {fx.shadows >= 2 ? <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, s.groundY, -4]} receiveShadow><planeGeometry args={[T.ground.size, T.ground.size]} /><shadowMaterial transparent opacity={T.ground.shadow} fog={false} /></mesh> : null}
      {/* 便宜的地面陰影（fx.shadows＝1）：每一層的外形沿主燈方向壓扁到地面上，一層一張邊緣模糊的貼圖，不用陰影貼圖 */}
      {fx.shadows === 1 ? model.layers.map((d) => {
        const q = s.layers[d.id];
        if (!q || q.opacity < 0.05) return null;
        const [w, h, cx, cy] = d.outline ?? [model.size.w, model.size.h, 0, 0], k = 1 / (1 - 2 * SHADOW_PAD);
        const lp = T.light.keyPos, g = s.groundY + 0.01;
        const P = new THREE.Matrix4().set(1, -lp[0] / lp[1], 0, (lp[0] / lp[1]) * g, 0, 0, 0, g, 0, -lp[2] / lp[1], 1, (lp[2] / lp[1]) * g, 0, 0, 0, 1);
        const M = new THREE.Matrix4().makeRotationY(s.yaw).multiply(new THREE.Matrix4().makeRotationX(s.pitch)).multiply(new THREE.Matrix4().makeTranslation(cx + q.x, cy + q.y, q.z)).multiply(new THREE.Matrix4().makeScale(w * k, h * k, 1));
        return <mesh key={`sh-${d.id}`} geometry={flatGeo} matrixAutoUpdate={false} matrix={P.multiply(M)} frustumCulled={false} renderOrder={1}><meshBasicMaterial color={T.part.shadow} map={shadowBlob()} transparent opacity={T.ground.blob * q.opacity} depthWrite={false} side={THREE.DoubleSide} fog={false} toneMapped={false} /></mesh>;
      }) : null}
      <group rotation={[0, s.yaw, 0]}>
        <group rotation={[s.pitch, 0, 0]}>
          {built.map((b, i) => {
            const L = s.layers[b.p.layer];
            if (!L) return null;
            const m = b.mat as THREE.MeshPhongMaterial;
            if (m.opacity <= 0.01) return null;
            const q = b.p.pos ?? [0, 0, 0], off = b.p.role === "lid" ? lidOff : [0, 0, 0];
            const solid = m.opacity > 0.6 && b.p.shadow !== false;
            // 運作動畫：vibrate 加位移；rotate 繞轉軸轉（轉軸預設是零件自己的位置）
            const pf = b.p.id ? partFxAt(pops.get(b.p.id), s) : null;
            let px = q[0] + off[0] + L.x + (pf?.off[0] ?? 0), py = q[1] + off[1] + L.y + (pf?.off[1] ?? 0);
            const pz = (q[2] ?? 0) + L.z + off[2] + (pf?.off[2] ?? 0);
            if (pf?.quat && pf.pivot) { const r = new THREE.Vector3(q[0] - pf.pivot[0], q[1] - pf.pivot[1], 0).applyQuaternion(pf.quat); px += r.x - (q[0] - pf.pivot[0]); py += r.y - (q[1] - pf.pivot[1]); }
            return <mesh key={b.p.id ?? i} geometry={b.geo} material={b.mat} position={[px, py, pz]} quaternion={pf?.quat ?? IDENT} castShadow={solid && b.p.shape !== "plane"} receiveShadow={solid && fx.shadows >= 3} renderOrder={m.transparent ? 2 : 0} />;
          })}
          {sw.on > 0.001 ? <><primitive object={spot} /><primitive object={spot.target} /></> : null}
          {model.actions ? <Ops model={model} s={s} /> : null}
          {/* 熱循環：熱點的點光、水滴（亮面小球）、蒸氣團與熱浪（柔邊貼圖） */}
          {th && fxm && thL ? (
            <group position={[th.center[0], th.center[1], thL.z + th.floorZ]}>
              {fx.glow && s.heat > 0.01 ? <pointLight color={fxm.hot} intensity={T.glow * s.heat} distance={7} decay={1.2} position={[th.hot[0], th.hot[1], 0.9]} /> : null}
              {s.lid > 0.05 ? s.parts.map((p, i) => (p.drop > 0.012 ? <mesh key={`d${i}`} geometry={fxm.ball} material={fxm.water} position={[p.x, p.y, p.z + p.drop * p.flat * 0.6]} scale={[p.drop, p.drop * p.stretch, p.drop * p.flat]} castShadow /> : null)) : null}
              {s.lid > 0.05 ? s.parts.map((p, i) => {
                if (p.puff <= 0.02) return null;
                const sm = fxm.puffs[i]; sm.opacity = T.puff * Math.min(1, p.gas * 1.4);
                if (!fx.vaporSprites) return <mesh key={`v${i}`} geometry={fxm.ball} position={[p.x, p.y, p.z + 0.3]} scale={p.puff * 0.2}><meshBasicMaterial color={col(model, th.vapor)} transparent opacity={0.8} /></mesh>;
                return <sprite key={`v${i}`} material={sm} position={[p.x, p.y, p.z + 0.3]} scale={[p.puff, p.puff, 1]} renderOrder={5} />;
              }) : null}
              {fx.shimmer ? s.shimmer.map((q, i) => {
                if (q.o <= 0.01) return null;
                const sm = fxm.shimmer[i]; sm.opacity = q.o;
                return <sprite key={`h${i}`} material={sm} position={[q.x, q.y, q.z]} scale={[q.s, q.s * 1.6, 1]} renderOrder={6} />;
              }) : null}
            </group>
          ) : null}
        </group>
      </group>
    </>
  );
};
