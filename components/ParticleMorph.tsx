"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * GPU-accelerated particle morph using Three.js.
 *
 * Two position attributes per particle (A and B). A single uniform `uProgress`
 * interpolates 0→1 between them. During mid-transition, Simplex-noise offset
 * plus horizontal random velocity creates the "wind streak / flowing ball"
 * motion visible in the reference video.
 *
 * Cycle: heart → word[0] → heart → word[1] → heart → word[2] ...
 * On each phase flip, positionB becomes positionA and next target loads into B.
 */

type Props = {
  words: string[];
  width?: number;
  height?: number;
  particleCount?: number;
};

type Pt = { x: number; y: number };

function samplePointsFromDraw(
  w: number,
  h: number,
  step: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): Pt[] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return [];
  draw(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const pts: Pt[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
    }
  }
  return pts;
}

function heartPoints(w: number, h: number): Pt[] {
  return samplePointsFromDraw(w, h, 3, (c) => {
    // Parametric heart: x = 16 sin³(t), y = -(13 cos t - 5 cos 2t - 2 cos 3t - cos 4t)
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w * 0.42, h * 0.52) / 17;
    c.fillStyle = "white";
    c.beginPath();
    const steps = 256;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = cx + 16 * Math.pow(Math.sin(t), 3) * scale;
      const y =
        cy -
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)) *
          scale;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.fill();
  });
}

function textPoints(w: number, h: number, text: string): Pt[] {
  return samplePointsFromDraw(w, h, 3, (c) => {
    c.fillStyle = "white";
    c.strokeStyle = "white";
    c.lineWidth = 7;
    c.lineJoin = "round";
    const fontSize = Math.min(w / (text.length * 0.58), h * 0.82);
    c.font = `900 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.strokeText(text, w / 2, h / 2);
    c.fillText(text, w / 2, h / 2);
  });
}

function resampleTo(pts: Pt[], n: number): Pt[] {
  if (pts.length === 0) return new Array(n).fill({ x: 0, y: 0 });
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = pts[Math.floor((i / n) * pts.length)];
  // Shuffle so neighboring particles don't share clustered targets
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const vertexShader = /* glsl */ `
  attribute vec3 positionA;
  attribute vec3 positionB;
  attribute float aRandom;
  attribute float aRandom2;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vMid;

  // Simplex noise (Ashima Arts, MIT license)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
      i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // Stagger particle timing so they don't all morph in lock-step
    float stagger = aRandom * 0.35;
    float t = clamp((uProgress - stagger) / (1.0 - stagger), 0.0, 1.0);
    // Ease-in-out cubic
    float progress = t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;

    vec3 pos = mix(positionA, positionB, progress);

    // Mid-transition bump: 0 at endpoints, 1 at middle — drives flow and streak
    float mid = 4.0 * progress * (1.0 - progress);

    // Curl noise for organic turbulent flow
    float noiseScale = 0.008;
    float noiseSpeed = uTime * 0.5;
    vec3 noise = vec3(
      snoise(vec3(pos.xy * noiseScale, noiseSpeed)),
      snoise(vec3(pos.xy * noiseScale + 100.0, noiseSpeed)),
      0.0
    );
    pos += noise * mid * 40.0;

    // Tiny horizontal jitter so streaks overlap rather than perfectly stack
    pos.x += (aRandom2 - 0.5) * 40.0 * mid;

    vMid = mid;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Inflate point size during transition — this becomes the streak length
    gl_PointSize = uSize * uPixelRatio * (1.0 + mid * 8.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vMid;

  void main() {
    // uv is 0..1 in point sprite; center on zero
    vec2 uv = gl_PointCoord - 0.5;

    // --- Round dot at rest ---
    float distR = length(uv);
    float dot = smoothstep(0.5, 0.05, distR);

    // --- Horizontal streak during transition ---
    // Thin vertical band (stays centered vertically)
    float vertThick = 0.09;
    float streakVert = smoothstep(vertThick, vertThick * 0.2, abs(uv.y));
    // Soft falloff at left/right tips so streak fades out, not hard-edges
    float streakHoriz = smoothstep(0.5, 0.32, abs(uv.x));
    // Extra brightness in the center of the streak (like a highlight along the stroke)
    float core = smoothstep(0.04, 0.0, abs(uv.y)) * 0.4;
    float streak = streakVert * streakHoriz + core * streakHoriz;

    // Blend between dot and streak based on motion
    float alpha = mix(dot, streak, smoothstep(0.1, 0.55, vMid));

    // Pink → hot magenta, brightens during motion
    vec3 cBase = vec3(1.0, 0.18, 0.46);
    vec3 cFast = vec3(1.0, 0.55, 0.82);
    vec3 color = mix(cBase, cFast, vMid);

    gl_FragColor = vec4(color, alpha * (0.85 + vMid * 0.15));
  }
`;

export default function ParticleMorph({
  words,
  width = 560,
  height = 200,
  particleCount = 2500,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Sample every target shape
    const N = particleCount;
    const heart = resampleTo(heartPoints(width, height), N);
    const wordTargets = words.map((w) => resampleTo(textPoints(width, height, w), N));

    // Build "sequence" — alternate heart ↔ word
    const sequence: Pt[][] = [];
    for (let i = 0; i < words.length; i++) {
      sequence.push(heart);
      sequence.push(wordTargets[i]);
    }

    // --- Three.js setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      100
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // Geometry with dual position attributes
    const geometry = new THREE.BufferGeometry();
    const posA = new Float32Array(N * 3);
    const posB = new Float32Array(N * 3);
    const rand = new Float32Array(N);
    const rand2 = new Float32Array(N);

    const writePos = (arr: Float32Array, pts: Pt[]) => {
      for (let i = 0; i < N; i++) {
        arr[i * 3] = pts[i].x - width / 2;
        arr[i * 3 + 1] = height / 2 - pts[i].y;
        arr[i * 3 + 2] = 0;
      }
    };

    writePos(posA, sequence[0]);
    writePos(posB, sequence[1]);
    for (let i = 0; i < N; i++) {
      rand[i] = Math.random();
      rand2[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(posA.slice(), 3));
    geometry.setAttribute("positionA", new THREE.BufferAttribute(posA, 3));
    geometry.setAttribute("positionB", new THREE.BufferAttribute(posB, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(rand, 1));
    geometry.setAttribute("aRandom2", new THREE.BufferAttribute(rand2, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 5.0 },
        uPixelRatio: { value: dpr },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- State machine ---
    const HOLD_MS = 1600;
    const MORPH_MS = 1400;
    let lastSwitch = performance.now();
    let seqIdx = 0; // index of A in sequence; B is next
    const start = performance.now();

    const swapAndAdvance = () => {
      // positionB becomes positionA
      const aAttr = geometry.attributes.positionA as THREE.BufferAttribute;
      const bAttr = geometry.attributes.positionB as THREE.BufferAttribute;
      (aAttr.array as Float32Array).set(bAttr.array as Float32Array);
      aAttr.needsUpdate = true;

      // Load next target into positionB
      seqIdx = (seqIdx + 1) % sequence.length;
      const nextTarget = sequence[(seqIdx + 1) % sequence.length];
      writePos(bAttr.array as Float32Array, nextTarget);
      bAttr.needsUpdate = true;
    };

    let rafId = 0;
    const loop = () => {
      const now = performance.now();
      const elapsed = now - lastSwitch;

      if (elapsed < HOLD_MS) {
        material.uniforms.uProgress.value = 0;
      } else if (elapsed < HOLD_MS + MORPH_MS) {
        material.uniforms.uProgress.value = (elapsed - HOLD_MS) / MORPH_MS;
      } else {
        swapAndAdvance();
        material.uniforms.uProgress.value = 0;
        lastSwitch = now;
      }

      material.uniforms.uTime.value = (now - start) / 1000;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [words, width, height, particleCount]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "100%",
      }}
    />
  );
}
