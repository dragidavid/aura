"use client";

import { Suspense, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion as m3 } from "framer-motion-3d";
import { motion } from "motion/react";
import { MathUtils, Mesh } from "three";
import {
  Icosahedron,
  Environment,
  Preload,
  Float,
  Lightformer,
} from "@react-three/drei";

import { useIsMobile } from "@/hooks/use-is-mobile";

import { cn } from "@/lib/cn";

import type { AuraColor } from "@drgd/aura";

const Blob = ({
  colorIndex,
  speed,
  scale,
  initialPosition,
  uniqueOffset,
  colors,
  isMobile,
}: {
  colorIndex: number;
  speed: number;
  scale: number;
  initialPosition: [number, number, number];
  uniqueOffset: number;
  colors: AuraColor[];
  isMobile: boolean;
}) => {
  const mesh = useRef<Mesh>(null);
  const blobColor = colors[Math.floor(colorIndex / 2)]?.hex || "#fff";

  const updatePosition = useCallback(
    (time: number) => {
      if (!mesh.current) return;

      const x =
        initialPosition[0] +
        Math.sin(time * speed + uniqueOffset) * (isMobile ? 0.5 : 0.6);
      const y =
        initialPosition[1] +
        Math.cos(time * (speed * 0.8) + uniqueOffset) * (isMobile ? 0.4 : 0.5);
      const z =
        initialPosition[2] +
        Math.sin(time * (speed * 0.5) + uniqueOffset) * 0.8;

      mesh.current.position.set(x, y, z);
      mesh.current.rotation.x = Math.sin(time * 0.15 + uniqueOffset) * 0.1;
      mesh.current.rotation.y = Math.cos(time * 0.15 + uniqueOffset) * 0.1;
    },
    [speed, initialPosition, uniqueOffset, isMobile],
  );

  useFrame((state) => updatePosition(state.clock.getElapsedTime()));

  return (
    <Float
      speed={1}
      rotationIntensity={0.2}
      floatIntensity={0.4}
      floatingRange={[-0.2, 0.2]}
    >
      <mesh ref={mesh} scale={scale} position={initialPosition}>
        <Icosahedron args={[1, 16]}>
          <m3.meshStandardMaterial
            animate={{
              color: blobColor,
            }}
            roughness={0.63}
            metalness={0.92}
          />
        </Icosahedron>
      </mesh>
    </Float>
  );
};

function Scene({
  colors,
  isMobile,
}: {
  colors: AuraColor[];
  isMobile: boolean;
}) {
  const { viewport } = useThree();

  const blobConfigs = useMemo(() => {
    const totalBlobs = colors.length * 2;

    return Array(totalBlobs)
      .fill(null)
      .map((_, index) => {
        const scaleMultiplier = MathUtils.randFloat(
          isMobile ? 0.7 : 0.9,
          isMobile ? 1.1 : 1.4,
        );

        const relativeInitialX = isMobile
          ? MathUtils.randFloat(-0.5, 0.5)
          : MathUtils.randFloat(-1 / 6, 1 / 6);
        const relativeInitialY = MathUtils.randFloat(-0.4, 0.4);
        const initialZ = MathUtils.randFloat(-1, 1);

        return {
          speed: MathUtils.randFloat(0.1, 0.3),
          scaleMultiplier: scaleMultiplier,
          relativeInitialX: relativeInitialX,
          relativeInitialY: relativeInitialY,
          initialZ: initialZ,
          uniqueOffset: Math.random() * Math.PI * 2,
        };
      });
  }, [colors.length, isMobile]);

  const baseScale = Math.min(viewport.width, viewport.height) * 0.15;

  return (
    <>
      <ambientLight intensity={1} />

      {blobConfigs.map((config, index) => {
        const currentScale = baseScale * config.scaleMultiplier;
        const currentInitialX =
          config.relativeInitialX *
          (isMobile ? viewport.width : viewport.width);
        const currentInitialY = config.relativeInitialY * viewport.height;
        const currentInitialPosition: [number, number, number] = [
          currentInitialX,
          currentInitialY,
          config.initialZ,
        ];

        return (
          <Blob
            key={`blob-${index}`}
            colors={colors}
            colorIndex={index}
            isMobile={isMobile}
            speed={config.speed}
            scale={currentScale}
            initialPosition={currentInitialPosition}
            uniqueOffset={config.uniqueOffset}
          />
        );
      })}

      <EffectComposer>
        <Bloom
          mipmapBlur={true}
          luminanceThreshold={0.1}
          intensity={isMobile ? 1.32 : 1.58}
        />
      </EffectComposer>

      <Preload all />

      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer
            form="circle"
            intensity={100}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={8}
          />
          <Lightformer
            form="ring"
            color="#fff"
            intensity={80}
            position={[10, 10, 0]}
            scale={10}
          />
        </group>
      </Environment>
    </>
  );
}

export function Background({ colors }: { colors: AuraColor[] }) {
  const { isMobile } = useIsMobile();

  return (
    <Suspense fallback={null}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className={cn("fixed inset-0 -z-10", "pointer-events-none")}
      >
        <Canvas
          flat
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            alpha: false,
          }}
          dpr={[1, 1.5]}
          camera={{
            position: [0, 0, isMobile ? 25 : 30],
            fov: isMobile ? 20 : 17.5,
            near: 10,
            far: 40,
          }}
          performance={{ min: 0.5 }}
        >
          <Scene colors={colors} isMobile={isMobile} />
        </Canvas>
      </motion.div>

      <div
        className={cn(
          "fixed inset-0 -z-10",
          "pointer-events-none",
          "backdrop-blur-2xl backdrop-brightness-110 backdrop-saturate-200",
          "sm:backdrop-blur-3xl",
        )}
      />
    </Suspense>
  );
}
