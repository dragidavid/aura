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

import { cn } from "@/lib/cn";

import type { AuraColor } from "@drgd/aura";

type BlobProps = {
  colorIndex: number;
  speed: number;
  scale: number;
  initialPosition: [number, number, number];
  uniqueOffset: number;
  colors: AuraColor[];
  isBlackBlob: boolean;
};

const Blob = ({
  colorIndex,
  speed,
  scale,
  initialPosition,
  uniqueOffset,
  colors,
  isBlackBlob,
}: BlobProps) => {
  const mesh = useRef<Mesh>(null);
  const blobColor = isBlackBlob
    ? "#000000"
    : colors[Math.floor(colorIndex / 2)]?.hex || "#ffffff";

  const updatePosition = useCallback(
    (time: number) => {
      if (!mesh.current) return;

      const x =
        initialPosition[0] + Math.sin(time * speed + uniqueOffset) * 0.6;
      const y =
        initialPosition[1] +
        Math.cos(time * (speed * 0.8) + uniqueOffset) * 0.5;
      const z =
        initialPosition[2] +
        Math.sin(time * (speed * 0.5) + uniqueOffset) * 0.8;

      mesh.current.position.set(x, y, z);
      mesh.current.rotation.x = Math.sin(time * 0.15 + uniqueOffset) * 0.1;
      mesh.current.rotation.y = Math.cos(time * 0.15 + uniqueOffset) * 0.1;
    },
    [speed, initialPosition, uniqueOffset],
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

// Ratio of colored blobs to black blobs (e.g., 3 means 3 colored for every 1 black).
const COLORED_TO_BLACK_RATIO = 3;
// Percentage (0.0 to 1.0) of blobs that should spawn in the middle horizontal third.
// Lower value = more spread towards left/right edges.
const MIDDLE_THIRD_PERCENTAGE = 0.58;
// Factor by which black blobs are scaled down relative to colored blobs in the same zone (e.g., 0.5 means half size).
const BLACK_BLOB_SIZE_FACTOR = 0.5;
// Multiplier for the total number of colored blobs (e.g., 1.5 means 50% more blobs than the base count derived from colors.length * 2).
const BLOB_COUNT_MULTIPLIER = 1.5;

function Scene({ colors }: { colors: AuraColor[] }) {
  const { viewport } = useThree();

  const blobConfigs = useMemo(() => {
    const numColoredBase = colors.length * 2;
    const numColoredBlobs = Math.ceil(numColoredBase * BLOB_COUNT_MULTIPLIER);
    const numBlackBlobs = Math.ceil(numColoredBlobs / COLORED_TO_BLACK_RATIO);
    const totalBlobs = numColoredBlobs + numBlackBlobs;

    const configs = [];

    for (let i = 0; i < totalBlobs; i++) {
      const isBlackBlob = i >= numColoredBlobs;
      const colorIndex = isBlackBlob ? -1 : i % numColoredBase;
      const isInMiddleThird = Math.random() < MIDDLE_THIRD_PERCENTAGE;
      let relativeInitialX;
      let scaleRange: [number, number];

      if (isInMiddleThird) {
        relativeInitialX = MathUtils.randFloat(-1 / 6, 1 / 6);
        scaleRange = [0.83, 1.54];
      } else {
        relativeInitialX =
          Math.random() < 0.5
            ? MathUtils.randFloat(-0.5, -1 / 6)
            : MathUtils.randFloat(1 / 6, 0.5);
        scaleRange = [0.43, 0.83];
      }

      let scaleMultiplier = MathUtils.randFloat(scaleRange[0], scaleRange[1]);

      if (isBlackBlob) {
        scaleMultiplier *= BLACK_BLOB_SIZE_FACTOR;
      }

      const relativeInitialY = MathUtils.randFloat(-0.5, 0.5);

      const initialZ = isBlackBlob
        ? MathUtils.randFloat(0, 2)
        : MathUtils.randFloat(-2, 0);

      configs.push({
        key: `blob-${i}`,
        isBlackBlob: isBlackBlob,
        colorIndex: colorIndex,
        speed: MathUtils.randFloat(0.1, 0.3),
        scaleMultiplier: scaleMultiplier,
        relativeInitialX: relativeInitialX,
        relativeInitialY: relativeInitialY,
        initialZ: initialZ,
        uniqueOffset: Math.random() * Math.PI * 2,
      });
    }

    return configs;
  }, [colors.length]);

  // Base scale factor for all blobs, relative to the viewport width.
  // Adjust the multiplier (0.1) to uniformly scale all blobs up or down.
  const baseScale = viewport.width * 0.09;

  return (
    <>
      <ambientLight intensity={1} />

      {blobConfigs.map((config) => {
        const currentScale = baseScale * config.scaleMultiplier;
        const currentInitialX = config.relativeInitialX * viewport.width;
        const currentInitialY = config.relativeInitialY * viewport.height;
        const currentInitialPosition: [number, number, number] = [
          currentInitialX,
          currentInitialY,
          config.initialZ,
        ];

        return (
          <Blob
            key={config.key}
            colors={colors}
            colorIndex={config.colorIndex}
            isBlackBlob={config.isBlackBlob}
            speed={config.speed}
            scale={currentScale}
            initialPosition={currentInitialPosition}
            uniqueOffset={config.uniqueOffset}
          />
        );
      })}

      <EffectComposer>
        <Bloom mipmapBlur={true} luminanceThreshold={0.1} intensity={1.58} />
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
            position: [0, 0, 30],
            fov: 17.5,
            near: 10,
            far: 40,
          }}
          performance={{ min: 0.5 }}
        >
          <Scene colors={colors} />
        </Canvas>
      </motion.div>

      <div
        className={cn(
          "fixed inset-0 -z-10",
          "pointer-events-none",
          "backdrop-blur-2xl backdrop-brightness-125 backdrop-saturate-200",
          "sm:backdrop-blur-[124px]",
        )}
      />

      <div
        className={cn(
          "fixed inset-0 -z-10",
          "pointer-events-none",
          "bg-radial from-black/5 to-black/20",
          "sm:from-transparent sm:to-black/80",
        )}
      />
    </Suspense>
  );
}
