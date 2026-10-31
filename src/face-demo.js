
import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar/mindar-face-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

const ANCHOR_INDEX = 168;

// Material objek
const black = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.6
});

const pink = new THREE.MeshStandardMaterial({
  color: 0xff80ab,
  roughness: 0.5
});

const white = new THREE.MeshStandardMaterial({
  color: 0xffffff
});

const red = new THREE.MeshStandardMaterial({
  color: 0xff1744,
  roughness: 0.3
});

// Membuat telinga kucing
function createEars(group) {
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();

    const outer = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.42, 4),
      black
    );

    outer.position.y = 0.18;

    const inner = new THREE.Mesh(
      new THREE.ConeGeometry(0.085, 0.29, 4),
      pink
    );

    inner.position.set(0, 0.18, 0.075);

    ear.add(outer, inner);

    ear.position.set(side * 0.28, 0.48, 0);
    ear.rotation.z = -side * 0.15;

    group.add(ear);
  }
}

// Membuat hidung kucing
function createNose(group) {
  const noseShape = new THREE.Shape();

  noseShape.moveTo(-0.09, 0.06);
  noseShape.lineTo(0.09, 0.06);
  noseShape.lineTo(0, -0.08);
  noseShape.closePath();

  const geometry = new THREE.ShapeGeometry(noseShape);
  const nose = new THREE.Mesh(geometry, pink);

  nose.position.set(0, -0.12, 0.12);

  group.add(nose);
}

// Membuat pipi merah muda
function createBlush(group) {
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 24, 24),
      pink
    );

    cheek.scale.set(1.3, 0.55, 0.35);
    cheek.position.set(side * 0.32, -0.18, 0.08);

    group.add(cheek);
  }
}

// Membuat kumis
function createWhiskers(group) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const points = [
        new THREE.Vector3(
          side * 0.14,
          -0.13 - i * 0.07,
          0.1
        ),
        new THREE.Vector3(
          side * 0.43,
          -0.12 - i * 0.09,
          0.1
        )
      ];

      const geometry = new THREE.BufferGeometry()
        .setFromPoints(points);

      const whisker = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: 0x222222
        })
      );

      group.add(whisker);
    }
  }
}

// Membuat hati kecil
function createHeart(group) {
  const shape = new THREE.Shape();

  shape.moveTo(0, -0.08);
  shape.bezierCurveTo(-0.2, 0.05, -0.16, 0.22, 0, 0.12);
  shape.bezierCurveTo(0.16, 0.22, 0.2, 0.05, 0, -0.08);

  const geometry = new THREE.ShapeGeometry(shape);

  const heart = new THREE.Mesh(geometry, red);

  heart.position.set(0, 0.70, 0.12);
  heart.scale.set(0.65, 0.65, 0.65);

  group.add(heart);
}

// Membuat titik putih hiasan
function createSparkles(group) {
  for (const side of [-1, 1]) {
    const sparkle = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      white
    );

    sparkle.position.set(side * 0.48, 0.35, 0.1);
    group.add(sparkle);
  }
}

// Menggabungkan seluruh hiasan wajah
function buildCatFilter() {
  const group = new THREE.Group();

  createEars(group);
  createNose(group);
  createBlush(group);
  createWhiskers(group);
  createHeart(group);
  createSparkles(group);

  return group;
}

// Menjalankan Face Tracking
async function start() {
  const mindarThree = new MindARThree({
    container: document.getElementById('container')
  });

  const { renderer, scene, camera } = mindarThree;

  const anchor = mindarThree.addAnchor(ANCHOR_INDEX);

  anchor.group.add(buildCatFilter());

  // Pencahayaan
  scene.add(
    new THREE.HemisphereLight(0xffffff, 0x667788, 1.5)
  );

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 1, 2);
  scene.add(light);

  await mindarThree.start();

  setStatus('Mencari wajah', 'searching');

  let hadFace = false;
  let lostCount = 0;

  renderer.setAnimationLoop(() => {
    const hasFace =
      mindarThree.getLatestEstimate() !== null;

    if (hasFace !== hadFace) {
      hadFace = hasFace;

      if (hasFace) {
        setStatus('Wajah terdeteksi', 'found');
        document.getElementById('info').textContent =
          'Cute Cat Filter aktif!';
      } else {
        lostCount++;
        setStatus('Mencari wajah', 'searching');
        document.getElementById('info').textContent =
          'Wajah hilang ' + lostCount + ' kali.';
      }
    }

    renderer.render(scene, camera);
  });
}

setupStartButton(start);
