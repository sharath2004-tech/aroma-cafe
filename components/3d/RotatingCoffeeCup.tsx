'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function CoffeeCup() {
  const cupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (cupRef.current) {
      cupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={cupRef}>
      {/* Cup body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.7, 1.5, 32]} />
        <meshPhongMaterial color="#8b4513" shininess={100} />
      </mesh>

      {/* Cup rim */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.82, 0.8, 0.1, 32]} />
        <meshPhongMaterial color="#a0522d" shininess={80} />
      </mesh>

      {/* Handle */}
      <mesh position={[1.1, 0.2, 0]}>
        <torusGeometry args={[0.5, 0.1, 16, 32, Math.PI, Math.PI]} />
        <meshPhongMaterial color="#8b4513" shininess={100} />
      </mesh>

      {/* Coffee inside */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 1.3, 32]} />
        <meshPhongMaterial color="#3d2817" shininess={50} />
      </mesh>

      {/* Foam/cream on top */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshPhongMaterial color="#f5deb3" shininess={120} />
      </mesh>
    </group>
  );
}

function SteamParticles() {
  const steamRef = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    // Create steam particles
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.5,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 1,
        0.8,
        (Math.random() - 0.5) * 1
      );
      steamRef.current?.add(particle);
      particles.current.push(particle);
    }
  }, []);

  useFrame(() => {
    particles.current.forEach((particle, index) => {
      particle.position.y += 0.02;
      particle.position.x += (Math.random() - 0.5) * 0.02;
      particle.position.z += (Math.random() - 0.5) * 0.02;

      const material = particle.material as THREE.MeshPhongMaterial;
      material.opacity = Math.max(0, material.opacity - 0.01);

      if (particle.position.y > 3) {
        particle.position.y = 0.8;
        particle.position.x = (Math.random() - 0.5) * 1;
        particle.position.z = (Math.random() - 0.5) * 1;
        material.opacity = 0.5;
      }
    });
  });

  return <group ref={steamRef} />;
}

export function CoffeeCupScene() {
  return (
    <Canvas className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 3.5]} />
      <OrbitControls autoRotate autoRotateSpeed={0} enableZoom={false} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 5]} intensity={0.5} />

      <CoffeeCup />
      <SteamParticles />
    </Canvas>
  );
}
