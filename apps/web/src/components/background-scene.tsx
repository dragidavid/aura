"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { MathUtils, Mesh, AmbientLight } from "three";
import {
  Icosahedron,
  Environment,
  Preload,
  BakeShadows,
  AdaptiveDpr,
  AdaptiveEvents,
  Float,
  Lightformer,
} from "@react-three/drei";
import { useAtomValue } from "jotai";
import { colorsAtom } from "@/atoms/colors";

// Extend Three.js elements
extend({ AmbientLight });

interface BlobProps {
  colorIndex: number;
  speed: number;
  scale: number;
  initialPosition: [number, number, number];
  uniqueOffset: number;
  intensity?: number;
}

const Blob = ({
  colorIndex,
  speed,
  scale,
  initialPosition,
  uniqueOffset,
  intensity = 1,
}: BlobProps) => {
  const mesh = useRef<Mesh>(null);
  const colors = useAtomValue(colorsAtom);
  const currentColor = colors[Math.floor(colorIndex / 2)]?.hex || "#fff";

  const { color } = useSpring({
    color: currentColor,
    config: {
      mass: 2,
      tension: 120,
      friction: 14,
    },
  });

  useFrame((state) => {
    if (!mesh.current) return;

    const time = state.clock.getElapsedTime();

    const x = initialPosition[0] + Math.sin(time * speed + uniqueOffset) * 0.6;
    const y =
      initialPosition[1] + Math.cos(time * (speed * 0.8) + uniqueOffset) * 0.5;
    const z =
      initialPosition[2] + Math.sin(time * (speed * 0.5) + uniqueOffset) * 0.2;

    mesh.current.position.set(x, y, z);
    mesh.current.rotation.x = Math.sin(time * 0.15 + uniqueOffset) * 0.1;
    mesh.current.rotation.y = Math.cos(time * 0.15 + uniqueOffset) * 0.1;
  });

  return (
    <Float
      speed={1}
      rotationIntensity={0.2}
      floatIntensity={0.4}
      floatingRange={[-0.2, 0.2]}
    >
      <animated.mesh ref={mesh} scale={scale} position={initialPosition}>
        <Icosahedron args={[1, 20]}>
          <animated.meshStandardMaterial
            color={color}
            roughness={0.78}
            metalness={0.22}
          />
        </Icosahedron>
      </animated.mesh>
    </Float>
  );
};

const Scene = () => {
  const colors = useAtomValue(colorsAtom);

  // Create blob configurations for pairs
  const blobConfigs = useMemo(() => {
    const totalBlobs = colors.length * 2; // Two blobs per color
    return Array(totalBlobs)
      .fill(null)
      .map((_, index) => ({
        speed: MathUtils.randFloat(0.15, 0.25),
        scale: MathUtils.randFloat(0.5, 0.9),
        initialPosition: [
          MathUtils.randFloat(-0.8, 0.8),
          MathUtils.randFloat(-0.6, 0.6),
          MathUtils.randFloat(-0.3, 0.3),
        ] as [number, number, number],
        uniqueOffset: Math.random() * Math.PI * 2,
        intensity: index % 2 === 0 ? 1 : 0.7, // Slightly different intensity for pairs
      }));
  }, []); // Empty dependency array means this only runs once

  return (
    <>
      <ambientLight intensity={1} />

      {blobConfigs.map((config, index) => (
        <Blob key={index} colorIndex={index} {...config} />
      ))}

      <BakeShadows />
      <Preload all />
    </>
  );
};

export default function BackgroundScene() {
  return (
    <Canvas
      flat
      shadows
      gl={{
        antialias: false,
      }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 30], fov: 17.5, near: 10, far: 40 }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Scene />

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
  );
}
