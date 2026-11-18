// Path: src/index.ts

// Import the factory functions from our other modules.
import { applyVideoMaterial, createVenue } from './modules/venue'
import { createInteractiveFX } from './modules/fx'
// The SDK's built-in video components: no extra library to install.
import { VideoPlayer, Material } from '@dcl/sdk/ecs'

// A public HLS test stream. Replace it with your own .m3u8 URL.
const STREAM_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

/**
 * The main function is the entry point of the scene.
 */
export function main() {
  // --- Step 1: Create the Scene's Foundation ---
  // Call the createVenue function to build the static parts of the world.
  // We destructure the returned object to get a direct reference to the screen entity.
  const { screen } = createVenue()

  // --- Step 2: Add Interactive Elements ---
  // Call the createInteractiveFX function to add the dance floor, lights, and buttons.
  createInteractiveFX()

  // --- Step 3: Attach the VideoPlayer component directly to the screen ---
  VideoPlayer.create(screen, {
    // The URL of the HLS (.m3u8) video stream.
    src: STREAM_URL,
    // Set to true to make the video play automatically.
    playing: true,
    // Set to true to loop the video when it ends.
    loop: true
  })

  // --- Step 4: Create a video texture and apply it to the screen ---
  // Create a video texture that is dynamically linked to the entity playing the video.
  const videoTexture = Material.Texture.Video({ videoPlayerEntity: screen })

  // Apply this native video texture to the screen's material using our existing helper function.
  applyVideoMaterial(screen, videoTexture)
}
