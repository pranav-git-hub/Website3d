import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

import { isMobile } from '../utils/mobileCheck';

type DarkstarModelProps = {
  url: string;
  isLowPower: boolean;
};

type PointerRotationController = {
  update: () => boolean;
  dispose: () => void;
};

type PointerRotationOptions = {
  element: HTMLElement;
  model: THREE.Object3D;
  onInput?: () => void;
  invertHorizontal?: boolean;
  rotateSpeedX?: number;
  rotateSpeedY?: number;
  minRotationX?: number;
  maxRotationX?: number;
  minRotationY?: number;
  maxRotationY?: number;
  enableLean?: boolean;
  maxLeanX?: number;
  maxLeanY?: number;
  leanLerpSpeed?: number;
};

/**
 * Pointer-driven rotation controller, adapted for R3F.
 * Keeps: clamped rotations, smoothing, desktop lean, scroll/wheel recompute, onInput hook.
 */
function createPointerRotationController(opts: PointerRotationOptions): PointerRotationController {
  const {
    element,
    model,
    onInput,
    invertHorizontal = true,
    rotateSpeedX = 0.05,
    rotateSpeedY = 0.05,
    maxRotationX = Math.PI / 3,
    minRotationX = -Math.PI / 4,
    maxRotationY = Math.PI + Math.PI / 4,
    minRotationY = Math.PI - Math.PI / 4,
    enableLean = window.matchMedia?.('(pointer: fine)')?.matches ?? true,
    maxLeanX = 1,
    maxLeanY = 1,
    leanLerpSpeed = 0.1,
  } = opts;

  model.rotation.y = Math.PI;

  let targetRotationX = 0;
  let targetRotationY = Math.PI;

  let targetPosX = 0;
  let targetPosY = 0;

  // Remember last pointer position so we can recompute targets when the page scrolls.
  let lastClientX = window.innerWidth / 2;
  let lastClientY = window.innerHeight / 2;
  let hasPointer = false;

  const ac = new AbortController();

  const calculateRotation = (clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const x = (clientX - rect.left) / w;
    const y = (clientY - rect.top) / h;

    const normalizedX = x * 2 - 1;
    const normalizedY = y * 2 - 1;

    targetRotationY = Math.PI + (invertHorizontal ? -1 : 1) * normalizedX * Math.PI;
    targetRotationX = -normalizedY * Math.PI;

    if (enableLean) {
      targetPosX = normalizedX * maxLeanX;
      targetPosY = -normalizedY * maxLeanY;
    }
  };

  const notifyInput = () => {
    try {
      onInput?.();
    } catch {
      // Intentionally ignore input callback errors to keep the render loop stable.
    }
  };

  element.addEventListener(
    'pointermove',
    (event) => {
      hasPointer = true;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      calculateRotation(event.clientX, event.clientY);
      notifyInput();
    },
    { passive: true, signal: ac.signal }
  );

  window.addEventListener(
    'scroll',
    () => {
      if (!hasPointer) return;
      calculateRotation(lastClientX, lastClientY);
      notifyInput();
    },
    { passive: true, signal: ac.signal }
  );
  window.addEventListener(
    'wheel',
    () => {
      if (!hasPointer) return;
      calculateRotation(lastClientX, lastClientY);
      notifyInput();
    },
    { passive: true, signal: ac.signal }
  );

  const update = () => {
    const nextY = model.rotation.y + (targetRotationY - model.rotation.y) * rotateSpeedY;
    model.rotation.y = THREE.MathUtils.clamp(nextY, minRotationY, maxRotationY);

    const nextX = model.rotation.x + (targetRotationX - model.rotation.x) * rotateSpeedX;
    model.rotation.x = THREE.MathUtils.clamp(nextX, minRotationX, maxRotationX);

    if (enableLean) {
      model.position.x += (targetPosX - model.position.x) * leanLerpSpeed;
      model.position.y += (targetPosY - model.position.y) * leanLerpSpeed;
    }

    const epsRot = 1e-4;
    const epsPos = 1e-4;
    const rotActive =
      Math.abs(targetRotationX - model.rotation.x) > epsRot ||
      Math.abs(targetRotationY - model.rotation.y) > epsRot;
    const posActive = enableLean
      ? Math.abs(targetPosX - model.position.x) > epsPos || Math.abs(targetPosY - model.position.y) > epsPos
      : false;
    return rotActive || posActive;
  };

  const dispose = () => ac.abort();

  return { update, dispose };
}

function DarkstarModel({ url, isLowPower }: DarkstarModelProps) {
  const gltf = useGLTF(url);
  const root = useRef<THREE.Group>(null);

  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const controllerRef = useRef<PointerRotationController | null>(null);

  useEffect(() => {
    const g = root.current;
    if (!g) return;

    const controller = createPointerRotationController({
      element: gl.domElement,
      model: g,
      onInput: () => invalidate(),
      // Match the old behavior: low power reduces antialias/dpr but controls are similar.
      // Keep defaults from Controls.ts; lean is disabled on coarse pointers automatically.
      enableLean: !isLowPower && (window.matchMedia?.('(pointer: fine)')?.matches ?? true),
    });

    controllerRef.current = controller;
    // Render at least one frame after wiring controller + initial model rotation.
    invalidate();

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [gl, invalidate, isLowPower]);

  useFrame((state) => {
    const controller = controllerRef.current;
    if (!controller) return;
    const active = controller.update();
    if (active) state.invalidate();
  });

  return (
    <group ref={root}>
      <primitive object={gltf.scene} scale={0.5} />
    </group>
  );
}

export function DarkstarCanvas() {
  const base = import.meta.env.BASE_URL || '/';
  const lowPower = isMobile();

  const modelUrl = useMemo(() => {
    return `${base}assets/${lowPower ? 'DarkStarSmall.glb' : 'DarkStar.glb'}`;
  }, [base, lowPower]);

  const [shouldLoad, setShouldLoad] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      if (cancelled) return;
      setShouldLoad(true);
    };

    // Start loading on idle (with a timeout) to keep first paint fast.
    const ric = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === 'function') ric(() => load(), { timeout: 1500 });
    else window.setTimeout(() => load(), 0);

    // Also load if the section is near view.
    if (typeof IntersectionObserver !== 'undefined' && hostRef.current) {
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) load();
        },
        { root: null, threshold: 0.01, rootMargin: '400px 0px 400px 0px' }
      );
      io.observe(hostRef.current);
      return () => {
        cancelled = true;
        io.disconnect();
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={hostRef} style={{ width: '100%', height: '100%' }}>
      {shouldLoad ? (
        <Canvas
          dpr={lowPower ? [1, 1.5] : [1, 2]}
          frameloop="demand"
          camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
          gl={{ antialias: !lowPower, alpha: true }}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 6, 4]} intensity={1} />
          <directionalLight position={[-5, 2, -2]} intensity={0.35} />

          <Suspense fallback={null}>
            <DarkstarModel url={modelUrl} isLowPower={lowPower} />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
}
// Note: avoid module-scope `useGLTF.preload(...)` here; it defeats our idle/viewport lazy-load.
