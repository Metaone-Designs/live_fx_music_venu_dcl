// Path: src/modules/fx.ts

// Import necessary components and libraries from the DCL SDK.
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
    TextShape // Import TextShape for creating 3D text labels.
} from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3, Quaternion } from '@dcl/sdk/math'

/**
 * Creates all the interactive special effects for the venue.
 */
export function createInteractiveFX() {
    // --- Interactive Dance Floor ---
    const danceFloor = engine.addEntity()
    // Store the original scale to easily toggle the floor on and off.
    const danceFloorOriginalScale = Vector3.create(10, 0.02, 10)

    Transform.create(danceFloor, {
        position: { x: 8, y: 0.06, z: 8 }, // Slightly above the main floor
        scale: danceFloorOriginalScale
    })
    MeshRenderer.setBox(danceFloor)
    MeshCollider.setBox(danceFloor) // Collider for interaction (though not used for walking here)
    Material.setPbrMaterial(danceFloor, {
        albedoColor: Color4.fromHexString('#9932CC'), // A base purple color
        emissiveColor: Color4.fromHexString('#9932CC'), // Make it glow with the same color
        emissiveIntensity: 1
    })

    // A 'system' is a function that runs on every frame of the scene.
    // This system will continuously update the dance floor's color.
    let totalTime = 0 // A counter to track elapsed time.
    engine.addSystem(function danceFloorSystem(dt) {
        // `dt` is 'delta time', the time in seconds since the last frame.
        totalTime += dt

        // Get a mutable reference to the material to change its properties.
        const mutableMaterial = Material.getMutable(danceFloor)
        // Check if the material is a PBR material before trying to change its PBR properties.
        if (mutableMaterial.material?.$case === 'pbr' && mutableMaterial.material.pbr) {
            // Use sine and cosine waves based on time to create a smooth, pulsing color change.
            const r = (Math.sin(totalTime * 2.0) + 1) / 2 // Fast red channel pulse
            const g = (Math.cos(totalTime * 0.5) + 1) / 2 // Slow green channel pulse
            const b = (Math.sin(totalTime * 1.0 + Math.PI) + 1) / 2 // Medium blue channel pulse (offset)
            // Apply the new color to the emissive property.
            mutableMaterial.material.pbr.emissiveColor = Color3.create(r, g, b)
        }
    })

    // --- Club Lighting Effect ---
    const lightCount = 8 // The number of lights to create.
    const lightEntities: Entity[] = [] // An array to store references to the light entities.
    const lightOriginalScale = Vector3.create(0.2, 0.2, 0.2) // Store original scale for toggling.

    // Create the specified number of lights in a loop.
    for (let i = 0; i < lightCount; i++) {
        const light = engine.addEntity()
        Transform.create(light, {
            position: Vector3.create(8, 5, 8), // All lights start at the center.
            scale: lightOriginalScale
        })
        MeshRenderer.setSphere(light) // The lights are simple spheres.
        Material.setPbrMaterial(light, {
            emissiveColor: Color4.Red(), // Start with a red glow.
            emissiveIntensity: 5 // Make them very bright.
        })
        lightEntities.push(light) // Add the new light to our array.
    }

    // System to animate the club lights' position and color.
    let lightTime = 0
    engine.addSystem(function clubLightsSystem(dt) {
        lightTime += dt * 0.5; // Increment time, slowed down a bit.

        for (const light of lightEntities) {
            const transform = Transform.getMutable(light)
            // If the light is toggled off (scale is zero), skip updating it.
            if (Vector3.equals(transform.scale, Vector3.Zero())) continue;

            // Calculate the angle for this specific light to move it in a circle.
            // Each light gets an offset to be evenly spaced around the circle.
            const angle = (lightTime + (lightEntities.indexOf(light) * (Math.PI * 2 / lightEntities.length)))
            // Use cosine for x and sine for z to calculate a point on a circle.
            const x = 8 + Math.cos(angle) * 4 // 4 is the radius of the circle.
            const z = 8 + Math.sin(angle) * 4
            transform.position = Vector3.create(x, 5, z) // Update the light's position.

            // Also animate the color of each light.
            const mutableMaterial = Material.getMutable(light)
            if (mutableMaterial.material?.$case === 'pbr' && mutableMaterial.material.pbr) {
                // Use the same angle to drive the color change, creating a swirling rainbow effect.
                const r = (Math.sin(angle * 2.0) + 1) / 2
                const g = (Math.cos(angle * 0.8) + 1) / 2
                const b = (Math.sin(angle) + 1) / 2
                mutableMaterial.material.pbr.emissiveColor = Color3.create(r, g, b)
            }
        }
    })

    // --- INTERACTIVE BUTTONS ---

    // Create a parent entity for the control panel to easily move/rotate all buttons and labels together.
    const controlPanel = engine.addEntity()
    Transform.create(controlPanel, {
        position: { x: 15.5, y: 1, z: 8 }, // Position the panel on the right wall.
        rotation: Quaternion.fromEulerDegrees(0, -90, 0) // Rotate it to face the center.
    })

    // Create a backing for the panel.
    const panelBacking = engine.addEntity()
    Transform.create(panelBacking, {
        parent: controlPanel, // Attach to the control panel.
        scale: { x: 1.5, y: 0.8, z: 0.1 }
    })
    MeshRenderer.setBox(panelBacking)
    MeshCollider.setBox(panelBacking) // Collider so it feels solid.
    Material.setPbrMaterial(panelBacking, { albedoColor: Color4.fromHexString('#444444') })

    // Button to toggle the Dance Floor
    const danceFloorButton = engine.addEntity()
    Transform.create(danceFloorButton, {
        parent: controlPanel, // Attach to the panel.
        position: { x: -0.35, y: 0, z: 0.1 }, // Position on the left side of the panel.
        scale: { x: 0.2, y: 0.2, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(90, 0, 0) // Rotate cylinder to be a flat button.
    })
    // Use a cylinder mesh for a round button shape.
    MeshRenderer.create(danceFloorButton, { mesh: { $case: 'cylinder', cylinder: { radiusTop: 1, radiusBottom: 1 } } })
    MeshCollider.setCylinder(danceFloorButton) // Use a cylinder collider.
    Material.setPbrMaterial(danceFloorButton, { albedoColor: Color4.Green() }) // Start green ("on").
    // The PointerEvents component makes an entity clickable.
    PointerEvents.create(danceFloorButton, {
        pointerEvents: [{
            eventType: PointerEventType.PET_DOWN, // Trigger on click down.
            eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Dance Floor' }
        }]
    })

    // Create a text label for the dance floor button.
    const danceFloorLabel = engine.addEntity()
    Transform.create(danceFloorLabel, {
        parent: controlPanel,
        position: { x: -0.35, y: 0.25, z: 0.1 }, // Position above the button.
        rotation: Quaternion.fromEulerDegrees(0, 180, 0) // Text is created facing backward, so rotate it.
    })
    TextShape.create(danceFloorLabel, { text: 'Floor', fontSize: 2, textColor: Color4.White() })

    // Button to toggle the Lights
    const lightsButton = engine.addEntity()
    Transform.create(lightsButton, {
        parent: controlPanel,
        position: { x: 0.35, y: 0, z: 0.1 }, // Position on the right side of the panel.
        scale: { x: 0.2, y: 0.2, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    MeshRenderer.create(lightsButton, { mesh: { $case: 'cylinder', cylinder: { radiusTop: 1, radiusBottom: 1 } } })
    MeshCollider.setCylinder(lightsButton)
    Material.setPbrMaterial(lightsButton, { albedoColor: Color4.Green() }) // Start green ("on").
    PointerEvents.create(lightsButton, {
        pointerEvents: [{
            eventType: PointerEventType.PET_DOWN,
            eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Lights' }
        }]
    })

    // Create a text label for the lights button.
    const lightsLabel = engine.addEntity()
    Transform.create(lightsLabel, {
        parent: controlPanel,
        position: { x: 0.35, y: 0.25, z: 0.1 },
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })
    TextShape.create(lightsLabel, { text: 'Lights', fontSize: 2, textColor: Color4.White() })

    // System to handle button clicks. This system checks for player input on every frame.
    engine.addSystem(() => {
        // Check if the dance floor button was clicked in this frame.
        if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, danceFloorButton)) {
            const transform = Transform.getMutable(danceFloor)
            // Check if the floor is currently visible by checking its scale.
            const isVisible = !Vector3.equals(transform.scale, Vector3.Zero())
            // Toggle visibility by setting scale to zero (to hide) or back to original (to show).
            transform.scale = isVisible ? Vector3.Zero() : danceFloorOriginalScale
            // Update the button color for visual feedback: Red for "off", Green for "on".
            Material.setPbrMaterial(danceFloorButton, { albedoColor: isVisible ? Color4.Red() : Color4.Green() })
        }

        // Check if the lights button was clicked in this frame.
        if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, lightsButton)) {
            // We only need to check the state of the first light to know if they are all on or off.
            const firstLightTransform = Transform.getMutable(lightEntities[0])
            const areVisible = !Vector3.equals(firstLightTransform.scale, Vector3.Zero())
            // Loop through all light entities and update their scale.
            for (const light of lightEntities) {
                Transform.getMutable(light).scale = areVisible ? Vector3.Zero() : lightOriginalScale
            }
            // Update the button color for visual feedback.
            Material.setPbrMaterial(lightsButton, { albedoColor: areVisible ? Color4.Red() : Color4.Green() })
        }
    })
}