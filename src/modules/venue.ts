// Path: src/modules/venue.ts

// Import necessary components and libraries from the DCL SDK.
import { engine, Transform, MeshRenderer, Material, Entity, MeshCollider } from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'

/**
 * Defines the UV mapping for a box mesh to correctly display a texture on one face.
 * UV coordinates range from 0 to 1 and define how a 2D texture is wrapped onto a 3D model.
 * Each face of a box has 4 vertices (corners), and each vertex needs a UV coordinate (U, V).
 * The order of vertices for each face is specific. We are only mapping the 'Front Face'.
 * @param rows - The number of rows in the texture atlas (not used in this simple case).
 * @param cols - The number of columns in the texture atlas (not used in this simple case).
 * @returns An array of numbers representing the UV coordinates for all faces of a box.
 */
function setUVs(rows: number, cols: number) {
    return [
        // The DCL SDK expects UV coordinates for all 6 faces of a box.
        // We set the unused faces to (0,0) to avoid rendering any texture on them.

        // --- Top Face --- (Vertices 0, 1, 2, 3)
        0, 0, // Vertex 0
        0, 0, // Vertex 1
        0, 0, // Vertex 2
        0, 0, // Vertex 3

        // --- Bottom Face --- (Vertices 4, 5, 6, 7)
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        // --- Left Face --- (Vertices 8, 9, 10, 11)
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        // --- Right Face --- (Vertices 12, 13, 14, 15)
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        // --- Front Face --- (Vertices 16, 17, 18, 19)
        // This is the face we want our video texture on.
        // We map the four corners of the texture to the four vertices of this face.
        // (1, 1) -> Top-right corner of the texture
        // (0, 1) -> Top-left corner of the texture
        // (0, 0) -> Bottom-left corner of the texture
        // (1, 0) -> Bottom-right corner of the texture
        1, 1, // Vertex 16
        0, 1, // Vertex 17
        0, 0, // Vertex 18
        1, 0, // Vertex 19

        // --- Back Face --- (Vertices 20, 21, 22, 23)
        0, 0,
        0, 0,
        0, 0,
        0, 0,
    ]
}

/**
 * Creates the static physical structure of the venue.
 * An 'Entity' is a general-purpose object in our scene. We add 'Components' to it
 * to give it properties like shape, position, material, and behavior.
 * @returns An object containing a reference to the screen entity, so it can be modified later.
 */
export function createVenue() {
    // --- Floor ---
    // Create a new entity named 'floor'.
    const floor = engine.addEntity()

    // Add a Transform component to define the floor's position, scale, and rotation.
    Transform.create(floor, {
        position: { x: 8, y: 0, z: 8 },    // Center of the 16x16 scene
        scale: { x: 16, y: 0.1, z: 16 }    // Makes the entity a large, flat plane
    })
    // Add a MeshRenderer component to give the floor a visible shape (a box).
    MeshRenderer.setBox(floor)
    // Add a Material component to define the floor's appearance.
    Material.setPbrMaterial(floor, {
        albedoColor: Color4.fromHexString('#222222') // A dark charcoal color
    })
    // Add a MeshCollider component to make the floor solid, so players can walk on it.
    MeshCollider.setBox(floor)

    // --- Video Screen ---
    // Create a new entity named 'screen'.
    const screen = engine.addEntity()

    // Add a Transform component for the screen's position, scale, and rotation.
    Transform.create(screen, {
        position: { x: 8, y: 4.5, z: 15.5 }, // Positioned at the back of the scene, raised up
        scale: { x: 15.8, y: 8.8, z: .1 },  // A large, thin rectangle for the screen
        rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotated 180 degrees to face the center
    })
    // Set the shape to a box and apply the custom UV mapping.
    // This ensures the video texture will be applied correctly to the front face.
    MeshRenderer.setBox(screen, setUVs(0, 0))
    // Add a collider so the screen is a physical object.
    MeshCollider.setBox(screen)

    // Add a basic PBR (Physically Based Rendering) material to the screen.
    // This will be updated later with the actual video texture.
    Material.setPbrMaterial(screen, {
        albedoColor: Color4.Black(), // The base color is black
        emissiveColor: Color4.Black() // The emissive (glow) color is also black, so it's "off"
    })

    // Return a reference to the screen entity so it can be accessed by other modules.
    return { screen }
}

/**
 * Applies the video texture from the VideoGuide to the screen's material.
 * This function is called after the video system is initialized.
 * @param screen The screen entity to apply the material to.
 * @param videoTexture The video texture object provided by the VideoGuide component.
 */
export function applyVideoMaterial(screen: Entity, videoTexture: any) {
    // Update the screen's material to display the video.
    Material.setPbrMaterial(screen, {
        texture: videoTexture,          // Apply the video as the main texture (albedo).
        emissiveTexture: videoTexture,  // Also apply it as the emissive texture to make it glow.
        emissiveColor: Color4.White(),  // Set the glow color to white.
        emissiveIntensity: 1.2,         // Make it glow brightly to enhance visibility.
        roughness: 1.0,                 // A high roughness makes the surface non-reflective, like a matte screen.
        specularIntensity: 0,           // No specular highlights.
        metallic: 0                     // Not a metallic surface.
    });
}