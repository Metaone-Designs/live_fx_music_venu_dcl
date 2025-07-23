// Path: src/index.ts

// Import the factory functions from our other modules.
import { applyVideoMaterial, createVenue } from './modules/venue'
import { createInteractiveFX } from './modules/fx'
// Import the video player component from a third-party library.
import { createVideoGuide } from '@m1d/dcl-components'

/**
 * The main function is the entry point of the scene.
 * It's declared as `async` because we need to wait for the video component to initialize.
 */
export async function main() {
  // --- Step 1: Create the Scene's Foundation ---
  // Call the createVenue function to build the static parts of the world.
  // We destructure the returned object to get a direct reference to the screen entity.
  const { screen } = createVenue()

  // --- Step 2: Add Interactive Elements ---
  // Call the createInteractiveFX function to add the dance floor, lights, and buttons.
  createInteractiveFX()

  // --- Step 3: Set up the Video Player ---
  // Initialize the M1D VideoGuide component. `await` pauses the function here until
  // the component is ready and has loaded the video stream metadata.
  const videoGuide = await createVideoGuide({
    // Configure the component with a video source.
    localVideo: {
      id: 'local-video', // A unique identifier for the video player instance.
      src: 'https://player.vimeo.com/external/902624555.m3u8?s=b2b78debfef94d115dd5c00a76d633e863786372&logging=false', // The URL for the video stream.
      socialsLink: 'https://www.m1d.io', // A link for the component's UI.
    }
  });

  // --- Step 4: Connect the Video to the Screen ---
  // It's good practice to check if the video component initialized successfully
  // and that it has provided a video texture.
  if (videoGuide && videoGuide.videoTexture) {
    // If we have a texture, call our function from venue.ts to apply it to the screen entity.
    // This connects the output of the video player to the screen mesh we created in Step 1.
    applyVideoMaterial(screen, videoGuide.videoTexture)
  }
}