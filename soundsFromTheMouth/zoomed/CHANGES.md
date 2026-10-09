# Updates — May 2026

Fixes for the broken mouth detection and physics behavior on newer hardware.

## 1. Mouth detection didn't work on new MacBook cameras

**Symptom:** Opening the mouth was detected (TRIGG fired in console), but no mouth block dropped.

**Cause:** ml5 facemesh returns keypoints in the webcam's _native_ resolution. On older MacBooks the native stream was close to 640×480, which matched what `video.size(640, 480)` and the rest of the sketch assumed. On newer MacBooks the camera captures at 1920×1080 natively, so keypoint X-values came back at ~1000+ and the `(640 - _w - mouthKeypoints[0])` math in `addBody` produced _negative_ canvas coordinates — the matter body spawned off-screen.

**Fix:** Scale raw keypoints from `video.elt.videoWidth / videoHeight` (whatever the camera actually delivers) back into the logical 640×480 space inside `yawnScore`. Camera-resolution-agnostic.

## 2. Everything ran too fast on high-refresh-rate displays

**Symptom:** Propeller spun about twice as fast, bodies fell quickly out of view, colors faded almost instantly.

**Cause:** `Matter.Runner.run(engine)` is driven by `requestAnimationFrame`, which runs at the monitor refresh rate (120 Hz on ProMotion MacBooks). Per-frame counters in the sketch (`angle -= 0.1`, `colorIntensity -= 5`, `penaltyCounter--`) all assumed 60 fps.

**Fix:** Cap p5 with `frameRate(60)` and drive physics manually with `Matter.Engine.update(engine, 1000/60)` inside `draw()`. Simulation speed is now identical on any display.

## 3. Canvas overflowed smaller screens, making the bottom of the video unreachable

**Symptom:** When you stood near the bottom of the visible video, the dropped mouth landed even further below — sometimes off-screen entirely.

**Cause:** The canvas was hardcoded to 1920×1080. On any sub-4K display the canvas overflowed the viewport, so the bottom portion of the canvas (where physics still placed the body correctly) was outside what you could see.

**Fix:** `createCanvas(windowWidth, windowHeight)` plus a `windowResized()` handler. All hardcoded `1920`/`1080` references replaced with `width`/`height`, and the logical 640×480 world is referenced via `LOGICAL_W`/`LOGICAL_H` constants. Works at any window size and on any camera resolution.

## 4. Spawn position + face tracking model swap

Iterating on the spawn-offset and bbox shape with ml5 still landed the block in the wrong place, so I also replaced the face tracking model.

**Model swap:** ml5.facemesh → MediaPipe FaceMesh (`@mediapipe/face_mesh@0.4.x` loaded from jsdelivr CDN). Same 468-point mesh topology, same keypoint indices, but more stable tracking on high-res webcams and actively maintained. The integration converts MediaPipe's normalized `multiFaceLandmarks` back into the same `predictions[0].scaledMesh` shape the sketch already consumed, so all downstream code (`yawnScore`, `mouthKeypoints`, `addBody`) keeps working unchanged.

**Trigger delay:** The trigger used to fire on the _rising edge_ of `yawnFactor > 0.5` — i.e. the very frame the mouth started cracking open, so the captured bbox was tiny and didn't match the fully-open mouth a moment later. Now it fires when the mouth has been open for 4 frames (~67ms at 60 fps), letting the mouth actually reach its open position before the snapshot is taken.

**Spawn:** Back to the original `mouthKeypoints[1] + mouthKeypoints[3] / 2` (bbox center). Keypoint 18 in this mesh is the chin notch (just under the lower lip), not the chin tip, so the bbox center sits right at the mouth opening with no extra offset needed.

## Files changed

- `sketch.js` — keypoint scaling, dynamic canvas size, fixed-timestep physics, frame-rate cap, body-cleanup uses logical height, MediaPipe FaceMesh integration (`initMediaPipeFaceMesh` / `pumpFaceMesh`) replacing the ml5 setup, trigger fires after 4 frames of open mouth instead of on the rising edge.
- `index.html` — swapped `libraries/ml5.min.js` for the MediaPipe FaceMesh CDN script; cache-buster query string on the `sketch.js` script tag (bump it when iterating).
- `CHANGES.md` — this file (new).

No changes to any sound assets, the local `libraries/` files (ml5 is now unused but left in place), or the `classes/` directory.
