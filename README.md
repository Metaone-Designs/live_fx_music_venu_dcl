# Interactive Nightclub Scene 🎵

Welcome to the **Interactive Nightclub Scene**, a project built with the Decentraland SDK 7. This scene is a practical example demonstrating how to build a dynamic and engaging environment. It features a streaming video screen, an animated dance floor, moving lights, and an interactive control panel to manage the effects.

This repository is designed to be a learning tool for developers, illustrating key SDK 7 concepts with practical code.

---

## ✨ Features

* **Streaming Video Screen**: A large screen at the back of the venue streams video content.
* **Pulsing Dance Floor**: An emissive dance floor that smoothly cycles through a spectrum of colors.
* **Animated Club Lights**: A set of moving lights that circle the room and change color.
* **Interactive Control Panel**: Players can use clickable buttons to toggle the dance floor and the club lights on or off.

---

## 🚀 Try it out

To run this scene, clone the repository, navigate into the directory, and run the following commands:

```bash
# Install project dependencies (only needed for the default video player)
npm install

# Start the local development server
npm run start
```
---

Alternatively, you can open the project folder in VS Code and use the **Run Scene** button in the Decentraland Editor extension.

---

## 🎬 Video Player Options

This scene includes two different methods for playing video, which you can switch between in `src/index.ts`.

### **Option 1: Third-Party Library (Default)**

The scene defaults to using the `@m1d/dcl-components` library.

* **Pros**: Provides a user interface with playback controls and other features.
* **Cons**: Requires installing an external library by running `npm install`.

### **Option 2: Built-in SDK Components**

The project also contains a commented-out block that uses the SDK's native `VideoPlayer` component.

* **Pros**: No external libraries are needed. The scene will run without needing to `npm install`.
* **Cons**: Provides a basic video stream with no built-in UI for playback controls.

**How to enable**: In `src/index.ts`, comment out the "OPTION 1" block and uncomment the "OPTION 2" block.

---

## 🛠️ SDK 7 Concepts in this Scene

Below are the core Decentraland SDK 7 concepts used to build this scene.

### **Entities**

An **Entity** is a unique identifier that groups different components together. It's the foundation for any object in your scene, like the floor, the screen, or the lights.

In `venue.ts`, a new entity for the floor is created and immediately assigned components:

```typescript
// An entity for the floor is created
const floor = engine.addEntity()

// Components are then added to the 'floor' entity to give it properties
Transform.create(floor, {
    position: { x: 8, y: 0, z: 8 },
    scale: { x: 16, y: 0.1, z: 16 }
})
MeshRenderer.setBox(floor)
```

---

> **Note**: It's no longer necessary to separately create an entity and then add it to the engine; this is all done in a single act with `engine.addEntity()`.

### **Components**

A **Component** is a container for data that defines an aspect of an entity. Components have no functions, only data. In this scene, we use several of the SDK's built-in components:

* **Transform**: Defines an entity's position, rotation, and scale.
* **MeshRenderer**: Gives an entity a visible shape (like a box or sphere).
* **MeshCollider**: Gives an entity a physical shape for collisions.
* **Material**: Defines an entity's appearance, such as its color, texture, and whether it glows.
* **PointerEvents**: Makes an entity clickable by the player.
* **TextShape**: Displays 3D text in the scene.

To add a component, you call its `create()` method with the entity ID and its data. For example, in `fx.ts`, the dance floor button is given a `Material` and made clickable with `PointerEvents`:

```typescript
// Give the button a green material
Material.setPbrMaterial(danceFloorButton, { albedoColor: Color4.Green() })

// Make the button interactive
PointerEvents.create(danceFloorButton, {
    pointerEvents: [{
        eventType: PointerEventType.PET_DOWN, // Event triggers on click
        eventInfo: { button: InputAction.IA_POINTER, hoverText: 'Toggle Dance Floor' }
    }]
})
```

---

### **Systems**

A **System** is a function that contains the logic of your scene. Systems run on every frame and are used to create animation, respond to input, and change component data over time.

To add a system, you define a function and pass it to `engine.addSystem()`. The function can optionally include a `dt` parameter, which is the time in seconds since the last frame.

The `clubLightsSystem` in `fx.ts` animates the lights' position and color:

```typescript
// The system function runs on every frame
function clubLightsSystem(dt: number) {
    // ... logic to update the light's position and color ...
}

// Add the system to the engine to make it run
engine.addSystem(clubLightsSystem)
```

---

The system that handles button clicks demonstrates how to check for player input:

```typescript
engine.addSystem(() => {
    // Check if the primary action (click) was triggered on the danceFloorButton entity
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, danceFloorButton)) {
        // ... logic to toggle the dance floor on or off ...
    }
})
```

---

### **Mutability**

By default, when you get a component's data, it's read-only for performance reasons. If you want to change a component's data inside a system, you must request a "**mutable**" version of it.

In the `danceFloorSystem` from `fx.ts`, we need to change the `emissiveColor` of the material on every frame. We do this by getting a mutable reference to the `Material` component.

```typescript
function danceFloorSystem(dt: number) {
    // ...

    // Get a mutable version of the dance floor's material
    const mutableMaterial = Material.getMutable(danceFloor)

    if (mutableMaterial.material?.$case === 'pbr' && mutableMaterial.material.pbr) {
        // Now we can change its properties
        // ...
        mutableMaterial.material.pbr.emissiveColor = Color3.create(r, g, b)
    }
}
```

---

### ✍️ Author

**MrJStickel**
* 🐙 GitHub: [j-stickel](https://github.com/j-stickel)
* 🌐 M1D: [m1d.io](https://m1d.io)
