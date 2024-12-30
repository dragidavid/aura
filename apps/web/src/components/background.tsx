"use client";

import { Suspense, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useSpring, animated as a3 } from "@react-spring/three";
import { useSpring as useWebSpring, animated } from "@react-spring/web";
import { MathUtils, Mesh, AmbientLight } from "three";
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

extend({ AmbientLight });

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
  const currentColor = colors[Math.floor(colorIndex / 2)]?.hex || "#fff";

  const { color } = useSpring({
    color: currentColor,
    config: { mass: 1.5, tension: 180, friction: 12 },
  });

  const animate = useCallback(
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
        Math.sin(time * (speed * 0.5) + uniqueOffset) * 0.2;

      mesh.current.position.set(x, y, z);
      mesh.current.rotation.x = Math.sin(time * 0.15 + uniqueOffset) * 0.1;
      mesh.current.rotation.y = Math.cos(time * 0.15 + uniqueOffset) * 0.1;
    },
    [speed, initialPosition, uniqueOffset, isMobile],
  );

  useFrame((state) => animate(state.clock.getElapsedTime()));

  return (
    <Float
      speed={1}
      rotationIntensity={0.2}
      floatIntensity={0.4}
      floatingRange={[-0.2, 0.2]}
    >
      {/* @ts-expect-error - types are not fully compatible */}
      <a3.mesh ref={mesh} scale={scale} position={initialPosition}>
        <Icosahedron args={[1, 20]}>
          {/* @ts-expect-error - types are not fully compatible */}
          <a3.meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.2}
          />
        </Icosahedron>
        {/* @ts-expect-error - types are not fully compatible */}
      </a3.mesh>
    </Float>
  );
};

export function Background({ colors }: { colors: AuraColor[] }) {
  const { isMobile } = useIsMobile();

  const blobConfigs = useMemo(() => {
    const totalBlobs = colors.length * 2;
    return Array(totalBlobs)
      .fill(null)
      .map((_, index) => ({
        speed: MathUtils.randFloat(0.15, 0.25),
        scale: MathUtils.randFloat(isMobile ? 1.4 : 0.6, isMobile ? 1.8 : 0.8),
        initialPosition: [
          MathUtils.randFloat(-0.8, 0.8),
          MathUtils.randFloat(isMobile ? -2 : -0.6, isMobile ? -1.7 : 0.6),
          MathUtils.randFloat(-0.3, 0.3),
        ] as [number, number, number],
        uniqueOffset: Math.random() * Math.PI * 2,
        intensity: index % 2 === 0 ? 1 : 0.7,
      }));
  }, [colors.length, isMobile]);

  const fadeIn = useWebSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 4000 },
  });

  return (
    <Suspense fallback={null}>
      <animated.div
        style={fadeIn}
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
          <ambientLight intensity={1} />
          {blobConfigs.map((config, index) => (
            <Blob
              key={`blob-${index}`}
              colors={colors}
              colorIndex={index}
              isMobile={isMobile}
              {...config}
            />
          ))}
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
        </Canvas>
      </animated.div>

      <div
        className={cn(
          "fixed inset-0 -z-10",
          "pointer-events-none",
          "backdrop-blur-3xl backdrop-brightness-150 backdrop-saturate-150",
        )}
      />
    </Suspense>
  );
}
