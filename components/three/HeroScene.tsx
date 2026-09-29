"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

type NodePoint = { position: THREE.Vector3; phase: number };

function SceneCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (window.innerWidth < 768) return;
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }) => {
    const angle = clock.elapsedTime * 0.03;
    const baseX = Math.sin(angle) * 1.2;
    const baseZ = 14 + Math.cos(angle) * 0.8;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, baseX + mouse.current.x * 1.5, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 8 + mouse.current.y * 0.8, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SensorNetwork() {
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const hub = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Mesh[]>([]);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const { nodes, edges } = useMemo(() => {
    const count = isMobile ? 24 : 60;
    const points: NodePoint[] = Array.from({ length: count }, (_, index) => {
      const radius = 3 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      return {
        position: new THREE.Vector3(Math.cos(theta) * radius, Math.sin(index * 0.7) * 0.35, Math.sin(theta) * radius),
        phase: Math.random() * Math.PI * 2
      };
    });
    points.push({ position: new THREE.Vector3(0, 0.4, 0), phase: 0 });

    const links: [number, number][] = [];
    points.forEach((point, index) => {
      const nearest = points
        .map((other, otherIndex) => ({ otherIndex, d: point.position.distanceTo(other.position) }))
        .filter(item => item.otherIndex !== index)
        .sort((a, b) => a.d - b.d)
        .slice(0, index === points.length - 1 ? 18 : 2);
      nearest.forEach(item => {
        const pair: [number, number] = index < item.otherIndex ? [index, item.otherIndex] : [item.otherIndex, index];
        if (!links.some(([a, b]) => a === pair[0] && b === pair[1])) links.push(pair);
      });
    });
    return { nodes: points, edges: links };
  }, [isMobile]);

  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    edges.forEach(([a, b]) => {
      positions.push(...nodes[a].position.toArray(), ...nodes[b].position.toArray());
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [edges, nodes]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    nodeRefs.current.forEach((mesh, index) => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.7 + Math.sin(t * 1.7 + nodes[index].phase) * 0.35;
      mesh.scale.setScalar(1 + Math.sin(t * 1.8 + nodes[index].phase) * 0.12);
    });
    if (hub.current) {
      const material = hub.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.5 + Math.sin(t * 3.2) * 0.45;
    }
    packets.current.forEach((packet, index) => {
      const edge = edges[index % edges.length];
      const from = nodes[edge[0]].position;
      const to = nodes[edge[1]].position;
      const progress = (t * (0.18 + (index % 5) * 0.045) + index * 0.09) % 1;
      packet.position.lerpVectors(from, to, progress);
    });
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
        <planeGeometry args={[40, 40, 32, 32]} />
        <meshStandardMaterial color="#0d1f10" roughness={0.95} />
      </mesh>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#4ade80" transparent opacity={0.15} />
      </lineSegments>
      {nodes.slice(0, -1).map((node, index) => (
        <mesh key={index} ref={el => { if (el) nodeRefs.current[index] = el; }} position={node.position}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.8} />
        </mesh>
      ))}
      <mesh ref={hub} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#b9ffd0" emissive="#4ade80" emissiveIntensity={1.5} />
      </mesh>
      {Array.from({ length: isMobile ? 12 : 30 }).map((_, index) => (
        <mesh key={`packet-${index}`} ref={el => { if (el) packets.current[index] = el; }}>
          <sphereGeometry args={[0.026, 10, 10]} />
          <meshStandardMaterial color="#ecfff3" emissive="#ecfff3" emissiveIntensity={1.8} />
        </mesh>
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas className="!absolute inset-0 z-0" camera={{ position: [0, 8, 14], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <fog attach="fog" args={["#0a0f0d", 8, 30]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 6, 0]} color="#4ade80" intensity={0.8} decay={2} />
      <SensorNetwork />
      <SceneCamera />
    </Canvas>
  );
}
