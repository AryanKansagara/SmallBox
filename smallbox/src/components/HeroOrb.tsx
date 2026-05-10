"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.7}>
      <Sphere ref={meshRef} args={[1.5, 80, 80]}>
        <MeshDistortMaterial
          color="#7b2fff"
          emissive="#3a006e"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.1}
          distort={0.42}
          speed={2.8}
          transparent
          opacity={0.92}
        />
      </Sphere>
    </Float>
  );
}

export default function HeroOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={2.5} color="#bf9fff" />
      <pointLight position={[-6, -4, -4]} intensity={1.2} color="#ff4dab" />
      <directionalLight position={[2, 4, 2]} intensity={1.5} color="#ffffff" />
      <AnimatedSphere />
    </Canvas>
  );
}
