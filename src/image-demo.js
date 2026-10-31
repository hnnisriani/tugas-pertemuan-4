
import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar/mindar-image-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

const TARGET_SRC = './targets/target-card.mind';
const TARGET_ASPECT = 372 / 674;

let foundCount = 0;

// Membuat objek hati 3D
function buildHeart() {
  const shape = new THREE.Shape();

  shape.moveTo(0, -0.45);

  shape.bezierCurveTo(
    -0.25, -0.20,
    -0.65, 0.10,
    -0.50, 0.40
  );

  shape.bezierCurveTo(
    -0.35, 0.75,
    -0.05, 0.65,
    0, 0.38
  );

  shape.bezierCurveTo(
    0.05, 0.65,
    0.35, 0.75,
    0.50, 0.40
  );

  shape.bezierCurveTo(
    0.65, 0.10,
    0.25, -0.20,
    0, -0.45
  );

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 2,
    bevelSize: 0.04,
    bevelThickness: 0.04
  });

  const material = new THREE.MeshStandardMaterial({
    color: 0xff1744,
    roughness: 0.2,
    metalness: 0.35
  });

  const heart = new THREE.Mesh(geometry, material);

  heart.scale.set(0.55, 0.55, 0.55);
  heart.position.set(0, 0, 0.2);

  return heart;
}

async function start() {
  const mindarThree = new MindARThree({
    container: document.getElementById('container'),
    imageTargetSrc: TARGET_SRC,
  });

  const { renderer, scene, camera } = mindarThree;

  // Anchor target pertama
  const anchor = mindarThree.addAnchor(0);

  // Bingkai marker tetap dipertahankan
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.PlaneGeometry(1, TARGET_ASPECT)
    ),
    new THREE.LineBasicMaterial({ color: 0x14b8a6 })
  );

  anchor.group.add(frame);

  // Objek LOVE 3D menggantikan rantai emas
  const heart = buildHeart();

  anchor.group.add(heart);

  // Pencahayaan
  scene.add(
    new THREE.HemisphereLight(0xffffff, 0x667788, 1.2)
  );

  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(0.5, 1, 1);
  scene.add(dir);

  // Event deteksi marker
  anchor.onTargetFound = () => {
    foundCount++;

    setStatus('Target terdeteksi', 'found');

    document.getElementById('info').textContent =
      'Target ditemukan ' + foundCount + ' kali.';
  };

  anchor.onTargetLost = () => {
    setStatus('Target hilang - mencari target', 'searching');
  };

  await mindarThree.start();

  setStatus('Mencari target', 'searching');

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();

    // Animasi hati berputar
    heart.rotation.y += delta * 1.5;

    renderer.render(scene, camera);
  });
}

setupStartButton(start);
