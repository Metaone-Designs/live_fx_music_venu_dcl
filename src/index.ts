// Path: src/index.ts

// Import the factory functions from our other modules.
import { applyVideoMaterial, createVenue } from './modules/venue'
import { createInteractiveFX } from './modules/fx'
// Import the video player component from a third-party library.
import { createVideoGuide } from '@m1d/dcl-components'
// Imports for the alternative, built-in video player.
import { VideoPlayer, Material } from '@dcl/sdk/ecs'

/**
 * The main function is the entry point of the scene.
 * It's declared as `async` because the createVideoGuide component is asynchronous.
 */
export async function main() {
  // --- Step 1: Create the Scene's Foundation ---
  // Call the createVenue function to build the static parts of the world.
  // We destructure the returned object to get a direct reference to the screen entity.
  const { screen } = createVenue()

  // --- Step 2: Add Interactive Elements ---
  // Call the createInteractiveFX function to add the dance floor, lights, and buttons.
  createInteractiveFX()

  // --- OPTION 1: Set up Video Player using @m1d/dcl-components ---
  // This method provides a UI and other features, but requires installing a library.
  const videoGuide = await createVideoGuide({
    // Configure the component with a video source.
    localVideo: {
      id: 'local-video', // A unique identifier for the video player instance.
      src: 'https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false', // The URL for the video stream.
      socialsLink: 'https://www.m1d.io', // A link for the component's UI.
    }
  });

  // --- Step 4: Connect the Video to the Screen ---
  // Check if the video component initialized successfully and provided a video texture.
  if (videoGuide && videoGuide.videoTexture) {
    // If we have a texture, call our function from venue.ts to apply it to the screen entity.
    applyVideoMaterial(screen, videoGuide.videoTexture)
  }

  /*
  // --- OPTION 2: Play video with built-in DCL components (no external library) ---
  // This alternative method uses the SDK's native VideoPlayer component to play an HLS stream.
  // To use this, comment out the "OPTION 1" block above and uncomment this entire block.
  // This approach is simpler and avoids the need to install any external libraries.

  // --- Step 3 (ALT): Attach the VideoPlayer component directly to the screen ---
  VideoPlayer.create(screen, {
    // The URL of the HLS (.m3u8) video stream.
    src: 'https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false',
    // Set to true to make the video play automatically.
    playing: true,
    // Set to true to loop the video when it ends.
    loop: true,
  })

  // --- Step 4 (ALT): Create a video texture and apply it to the screen ---
  // Create a video texture that is dynamically linked to the entity playing the video.
  const videoTexture = Material.Texture.Video({ videoPlayerEntity: screen })

  // Apply this native video texture to the screen's material using our existing helper function.
  applyVideoMaterial(screen, videoTexture)
  */
}