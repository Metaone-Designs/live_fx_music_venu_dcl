# Interactive Nightclub Scene: Build Guide

This guide provides a complete, step-by-step walkthrough for building the Interactive Nightclub scene from a blank project.

---

## 1. Project Setup & Dependencies

First, create the project, navigate into its directory, and install the required third-party library for the default video player.

1.  Create a folder on your PC for the project.
2.  Open a terminal in that folder and run `dcl init`, selecting the "Blank scene" template.
3.  Install the M1D component library by running:
    ```bash
    npm install @m1d/dcl-components
    ```
4.  Inside the `src` folder, create a new folder named `modules`.

---

## 2. Module Creation

Next, we will create the individual TypeScript files that make up our scene.

### `src/modules/venue.ts`

This file defines the static physical structure of the venue. Create the file `src/modules/venue.ts` and add the following code.

```typescript
// Path: src/modules/venue.ts

import { engine, Transform, MeshRenderer, Material, Entity, MeshCollider } from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'

/**
 * Defines the UV mapping for a box mesh to correctly display a texture on one face.
 */
function setUVs() {
    return [
        // Top Face
        0, 0, 0, 0, 0, 0, 0, 0,
        // Bottom Face
        0, 0, 0, 0, 0, 0, 0, 0,
        // Left Face
        0, 0, 0, 0, 0, 0, 0, 0,
        // Right Face
        0, 0, 0, 0, 0, 0, 0, 0,
        // Front Face (This is the one we want to texture)
        1, 1, 0, 1, 0, 0, 1, 0,
        // Back Face
        0, 0, 0, 0, 0, 0, 0, 0,
    ]
}

/**
 * Creates the static physical structure of the venue.
 * @returns An object containing a reference to the screen entity.
 */
export function createVenue() {
    // --- Floor ---
    const floor = engine.addEntity()
    Transform.create(floor, {
        position: { x: 8, y: 0, z: 8 },
        scale: { x: 16, y: 0.1, z: 16 }
    })
    MeshRenderer.setBox(floor)
    Material.setPbrMaterial(floor, {
        albedoColor: Color4.fromHexString('#222222')
    })
    MeshCollider.setBox(floor)

    // --- Video Screen ---
    const screen = engine.addEntity()
    Transform.create(screen, {
        position: { x: 8, y: 4.5, z: 15.5 },
        scale: { x: 15.8, y: 8.8, z: .1 },
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    })
    MeshRenderer.setBox(screen, { uvs: setUVs() })
    MeshCollider.setBox(screen)
    Material.setPbrMaterial(screen, {
        albedoColor: Color4.Black(),
        emissiveColor: Color4.Black()
    })

    return { screen }
}

/**
 * Applies a video texture to the screen's material.
 * @param screen The screen entity to apply the material to.
 * @param videoTexture The video texture object.
 */
export function applyVideoMaterial(screen: Entity, videoTexture: any) {
    Material.setPbrMaterial(screen, {
        texture: videoTexture,
        emissiveTexture: videoTexture,
        emissiveColor: Color4.White(),
        emissiveIntensity: 1.2,
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0
    });
}
```

### `src/modules/fx.ts`

This file creates all the dynamic and interactive elements. Create src/modules/fx.ts and add this code.

```typescript
// Path: src/modules/fx.ts

import {
    engine,
    Transform,
    MeshRenderer,
    Material,
    PointerEvents,
    PointerEventType,
    InputAction,
    inputSystem,
    Entity,
    MeshCollider,
    TextShape
} from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3, Quaternion } from '@dcl/sdk/math'

/**
 * Creates all the interactive special effects for the venue.
 */
export function createInteractiveFX() {
    // --- Interactive Dance Floor ---
    const danceFloor = engine.addEntity()
    const danceFloorOriginalScale = Vector3.create(10, 0.02, 10)
    Transform.create(danceFloor, {
        position: { x: 8, y: 0.06, z: 8 },
        scale: danceFloorOriginalScale
    })
    MeshRenderer.setBox(danceFloor)
    Material.setPbrMaterial(danceFloor, {
        emissiveColor: Color4.fromHexString('#9932CC'),
        emissiveIntensity: 1
    })

    let totalTime = 0
    engine.addSystem(function danceFloorSystem(dt) {
        totalTime += dt
        const mutableMaterial = Material.getMutable(danceFloor)
        if (mutableMaterial.material?.$case === 'pbr' && mutableMaterial.material.pbr) {
            const r = (Math.sin(totalTime * 2.0) + 1) / 2
            const g = (Math.cos(totalTime * 0.5) + 1) / 2
            const b = (Math.sin(totalTime * 1.0 + Math.PI) + 1) / 2
            mutableMaterial.material.pbr.emissiveColor = Color3.create(r, g, b)
        }
    })

    // --- Club Lighting Effect ---
    const lightCount = 8
    const lightEntities: Entity[] = []
    const lightOriginalScale = Vector3.create(0.2, 0.2, 0.2)
    for (let i = 0; i < lightCount; i++) {
        const light = engine.addEntity()
        Transform.create(light, {
            position: Vector3.create(8, 5, 8),
            scale: lightOriginalScale
        })
        MeshRenderer.setSphere(light)
        Material.setPbrMaterial(light, {
            emissiveColor: Color4.Red(),
            emissiveIntensity: 5
        })
        lightEntities.push(light)
    }

    let lightTime = 0
    engine.addSystem(function clubLightsSystem(dt) {
        lightTime += dt * 0.5;
        for (const light of lightEntities) {
            const transform = Transform.getMutable(light)
            if (Vector3.equals(transform.scale, Vector3.Zero())) continue;
            const angle = (lightTime + (lightEntities.indexOf(light) * (Math.PI * 2 / lightEntities.length)))
            const x = 8 + Math.cos(angle) * 4
            const z = 8 + Math.sin(angle) * 4
            transform.position = Vector3.create(x, 5, z)
            const mutableMaterial = Material.getMutable(light)
            if (mutableMaterial.material?.$case === 'pbr' && mutableMaterial.material.pbr) {
                const r = (Math.sin(angle * 2.0) + 1) / 2
                const g = (Math.cos(angle * 0.8) + 1) / 2
                const b = (Math.sin(angle) + 1) / 2
                mutableMaterial.material.pbr.emissiveColor = Color3.create(r, g, b)
            }
        }
    })

    // --- INTERACTIVE BUTTONS ---
    const controlPanel = engine.addEntity()
    Transform.create(controlPanel, {
        position: { x: 15.5, y: 1, z: 8 },
        rotation: Quaternion.fromEulerDegrees(0, -90, 0)
    })

    const panelBacking = engine.addEntity()
    Transform.create(panelBacking, { parent: controlPanel, scale: { x: 1.5, y: 0.8, z: 0.1 } })
    MeshRenderer.setBox(panelBacking)
    Material.setPbrMaterial(panelBacking, { albedoColor: Color4.fromHexString('#444444') })

    const danceFloorButton = engine.addEntity()
    Transform.create(danceFloorButton, {
        parent: controlPanel,
        position: { x: -0.35, y: 0, z: 0.1 },
        scale: { x: 0.2, y: 0.2, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    MeshRenderer.create(danceFloorButton, { mesh: { $case: 'cylinder', cylinder: { radiusTop: 1, radiusBottom: 1 } } })
    Material.setPbrMaterial(danceFloorButton, { albedoColor: Color4.Green() })
    PointerEvents.create(danceFloorButton, {
        pointerEvents: [{ eventType: PointerEventType.PET_DOWN, eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Dance Floor' } }]
    })

    const danceFloorLabel = engine.addEntity()
    Transform.create(danceFloorLabel, {
        parent: controlPanel,
        position: { x: -0.35, y: 0.25, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })
    TextShape.create(danceFloorLabel, { text: 'Floor', fontSize: 2, textColor: Color4.White() })

    const lightsButton = engine.addEntity()
    Transform.create(lightsButton, {
        parent: controlPanel,
        position: { x: 0.35, y: 0, z: 0.1 },
        scale: { x: 0.2, y: 0.2, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    MeshRenderer.create(lightsButton, { mesh: { $case: 'cylinder', cylinder: { radiusTop: 1, radiusBottom: 1 } } })
    Material.setPbrMaterial(lightsButton, { albedoColor: Color4.Green() })
    PointerEvents.create(lightsButton, {
        pointerEvents: [{ eventType: PointerEventType.PET_DOWN, eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Lights' } }]
    })

    const lightsLabel = engine.addEntity()
    Transform.create(lightsLabel, {
        parent: controlPanel,
        position: { x: 0.35, y: 0.25, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })
    TextShape.create(lightsLabel, { text: 'Lights', fontSize: 2, textColor: Color4.White() })

    engine.addSystem(() => {
        if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, danceFloorButton)) {
            const transform = Transform.getMutable(danceFloor)
            const isVisible = !Vector3.equals(transform.scale, Vector3.Zero())
            transform.scale = isVisible ? Vector3.Zero() : danceFloorOriginalScale
            Material.setPbrMaterial(danceFloorButton, { albedoColor: isVisible ? Color4.Red() : Color4.Green() })
        }
        if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, lightsButton)) {
            const firstLightTransform = Transform.getMutable(lightEntities[0])
            const areVisible = !Vector3.equals(firstLightTransform.scale, Vector3.Zero())
            for (const light of lightEntities) {
                Transform.getMutable(light).scale = areVisible ? Vector3.Zero() : lightOriginalScale
            }
            Material.setPbrMaterial(lightsButton, { albedoColor: areVisible ? Color4.Red() : Color4.Green() })
        }
    })
}
```

### `src/index.ts`

Finally, update your main entry point to orchestrate these modules. Replace the contents of src/index.ts with this:

```typescript
// Path: src/index.ts

import { applyVideoMaterial, createVenue } from './modules/venue'
import { createInteractiveFX } from './modules/fx'
import { createVideoGuide } from '@m1d/dcl-components'
import { VideoPlayer, Material } from '@dcl/sdk/ecs'

/**
 * The main function is the entry point of the scene.
 */
export async function main() {
  // --- Create the Scene's Foundation ---
  const { screen } = createVenue()

  // --- Add Interactive Elements ---
  createInteractiveFX()

  // --- OPTION 1: Set up Video Player using @m1d/dcl-components (Default) ---
  const videoGuide = await createVideoGuide({
    localVideo: {
      id: 'local-video',
      src: '[https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false](https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false)',
      socialsLink: '[https://www.m1d.io](https://www.m1d.io)',
    }
  });

  // --- Connect the Video to the Screen ---
  if (videoGuide && videoGuide.videoTexture) {
    applyVideoMaterial(screen, videoGuide.videoTexture)
  }

  /*
  // --- OPTION 2: Play video with built-in DCL components ---
  // To use this, comment out the "OPTION 1" block above and uncomment this entire block.
  
  VideoPlayer.create(screen, {
    src: '[https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false](https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false)',
    playing: true,
    loop: true,
  })

  const videoTexture = Material.Texture.Video({ videoPlayerEntity: screen })
  applyVideoMaterial(screen, videoTexture)
  */
}
```

## 3. Testing & Building

From your project's root directory:
To run a local preview:

Bash
```bash
npm run start
```

To create a deployment build:

Bash
```bash
npm run deploy
```

