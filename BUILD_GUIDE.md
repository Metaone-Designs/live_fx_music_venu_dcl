# Interactive Venue: Complete Build Guide

This guide provides a complete, step-by-step walkthrough for building the Interactive Venue scene from a blank project. This version includes extra details and verification steps to ensure a smooth development process.

## 1. Project Setup & Dependencies

First, ensure you have the necessary tools installed, then create the project and install the required third-party library.

1.  **Create & Open Your Project Folder**:
    Every great project starts with an organized folder.

    * **On Windows:**
        1.  Navigate to where you keep your projects (e.g., your `Documents` folder).
        2.  Right-click on an empty space, go to **New > Folder**.
        3.  Name the folder something clear, like `MyDCLVenue`.
    * **Open in VS Code:**
        1.  Launch Visual Studio Code.
        2.  From the top menu, go to **File > Open Folder...**.
        3.  Navigate to and select the `MyDCLVenue` folder you just created.
        4.  Click "Select Folder" (or "Open"). Your VS Code window should now be focused on your new project folder.

2.  **Open the VS Code Terminal**:
    For all the following steps, we will use the terminal that is built into VS Code. You can open it by going to the top menu bar and selecting **Terminal > New Terminal**. A new command-line panel will appear at the bottom of your VS Code window.

3.  **Install the Decentraland SDK**:
    *(This only needs to be done once per computer).*
    If you haven't already, install the DCL command-line interface (CLI) globally on your system. In the VS Code terminal, run the following command:
    ```bash
    npm install -g decentraland
    ```
    *What this does: This command installs the `decentraland` toolkit on your computer, allowing you to run commands like `dcl init` and `dcl start` from any folder.*

4.  **Initialize the Scene**:
    Now that you are inside the project folder in your terminal, run the `dcl init` command to create the basic file structure for a Decentraland scene.
    ```bash
    npx @dcl/sdk-commands init 
    ```
    When prompted, select the **scene** project type and then the **blank scene** template.
    *What this does: This command builds the skeleton of your project, including the `scene.json` file (which defines the parcel layout), the `src` folder (where your code lives), and the `package.json` file (which tracks your project's dependencies).*

5.  **Install the M1D Components Library**:
    Our project uses a pre-built library for the video player UI. Install it using `npm`.
    ```bash
    npm install @m1d/dcl-components
    ```
    *What this does: This downloads the `@m1d/dcl-components` package from the internet and places it in a `node_modules` folder, making its code available to your project.*

6.  **Verification Step: Test the Blank Scene**:
    Before we add any custom code, let's make sure everything is working. Run the start command:
    ```bash
    npm run start
    ```
    A new browser tab should open showing a preview of your scene with a spinning cube. This confirms your development environment is set up correctly. Once you see it, you can stop the server by pressing `CTRL + C` in your terminal.

7.  **Create Modules Folder**:
    To keep our code organized, go into the `src` folder and create a new folder named `modules`.

## 2. Module Creation

Now we will create and code the individual TypeScript files that make up our scene.

### Step 1: Build the Venue (`venue.ts`)

This file defines the static physical structure of the scene. Create a new file at `src/modules/venue.ts` and add the following code.

```typescript
// Path: src/modules/venue.ts
import { engine, Transform, MeshRenderer, Material, Entity, MeshCollider } from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'

function setUVs() {
    return [
        // Top, Bottom, Left, Right faces (8 UVs * 4 = 32 values)
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        // Front Face (This is the one we want to texture)
        1, 1, 0, 1, 0, 0, 1, 0,
        // Back Face
        0, 0, 0, 0, 0, 0, 0, 0,
    ]
}

export function createVenue() {
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

### Step 2: Add the Effects (`fx.ts`)

This file creates the dynamic dance floor, moving lights, and the interactive control panel. Create a new file at `src/modules/fx.ts` and add the following code.

```typescript
// Path: src/modules/fx.ts
import { engine, Transform, MeshRenderer, Material, PointerEvents, PointerEventType, InputAction, inputSystem, Entity, MeshCollider, TextShape } from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3, Quaternion } from '@dcl/sdk/math'

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
        parent: controlPanel, position: { x: -0.35, y: 0, z: 0.1 },
        scale: { x: 0.2, y: 0.2, z: 0.1 }, rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    MeshRenderer.create(danceFloorButton, { mesh: { $case: 'cylinder', cylinder: { radiusTop: 1, radiusBottom: 1 } } })
    Material.setPbrMaterial(danceFloorButton, { albedoColor: Color4.Green() })
    PointerEvents.create(danceFloorButton, {
        pointerEvents: [{ eventType: PointerEventType.PET_DOWN, eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Dance Floor' } }]
    })
    
    const danceFloorLabel = engine.addEntity()
    Transform.create(danceFloorLabel, { parent: controlPanel, position: { x: -0.35, y: 0.25, z: 0.1 }, rotation: Quaternion.fromEulerDegrees(0, 180, 0)})
    TextShape.create(danceFloorLabel, { text: 'Floor', fontSize: 2, textColor: Color4.White() })

    const lightsButton = engine.addEntity()
    Transform.create(lightsButton, {
        parent: controlPanel, position: { x: 0.35, y: 0, z: 0.1 },
        scale: { x: 0.2, y: 0.2, z: 0.1 }, rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    MeshRenderer.create(lightsButton, { mesh: { $case: 'cylinder', cylinder: { radiusTop: 1, radiusBottom: 1 } } })
    Material.setPbrMaterial(lightsButton, { albedoColor: Color4.Green() })
    PointerEvents.create(lightsButton, {
        pointerEvents: [{ eventType: PointerEventType.PET_DOWN, eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Lights' } }]
    })

    const lightsLabel = engine.addEntity()
    Transform.create(lightsLabel, { parent: controlPanel, position: { x: 0.35, y: 0.25, z: 0.1 }, rotation: Quaternion.fromEulerDegrees(0, 180, 0)})
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

### Step 3: Tie it All Together (`index.ts`)

This is the main entry point that orchestrates the other modules. Open the existing `src/index.ts` file, delete all of its content, and replace it with the following:

```typescript
// Path: src/index.ts
import { applyVideoMaterial, createVenue } from './modules/venue'
import { createInteractiveFX } from './modules/fx'
import { createVideoGuide } from '@m1d/dcl-components'
import { VideoPlayer, Material } from '@dcl/sdk/ecs'

export async function main() {
  // --- Create the Scene's Foundation ---
  const { screen } = createVenue()

  // --- Add Interactive Elements ---
  createInteractiveFX()

  // --- Set up Video Player using @m1d/dcl-components ---
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
}
```

## 3. Final Test

From your project's root directory, run the preview command again. You should now see your fully interactive venue!

```bash
npm run start
