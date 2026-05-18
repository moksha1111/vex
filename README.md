# Vex — Cyber-gaming wireless mouse landing with scroll-tied canvas video

> Cyber-gaming take on an Apple-flagship landing page. Hero mouse explodes into its components across a sticky scroll-canvas section, anchored by spec cards in 3D space connected to the video by dashed SVG lines. Custom magnetic cursor, mouse-tilt feature cards, animated count-up metrics, dual marquee bands. Built on the same `ImageBitmap` frame-extractor as `aero`/`pulse` — no `video.currentTime` scrubbing.

**[Live demo →](https://vex-hnfs.onrender.com)**

![preview](docs/preview.gif)

## What it does

A wireless-mouse landing page where the centrepiece is a 460 vh sticky scroll section: as the user scrolls, frames of a Hailuo-generated explode video play back from an in-memory ImageBitmap cache while four spec cards (Shell, Switches, Sensor, Power) fade in and out around the video, each connected to a tracked anchor point on the frame by a dashed SVG line. Above and below the explode, the page is heavy on 3D motion — extruded title with cursor parallax, mouse-tilt feature cards with translateZ-layered children, count-up animated metrics, two opposing marquee bands.

## Tech

React 18 · Vite · Tailwind CSS v3 · Canvas 2D · `requestVideoFrameCallback` · CSS 3D transforms

## Highlights

- **Frame extractor** (`src/lib/frameExtractor.js`) — same engine as aero/pulse: downloads the source video as a blob, plays it muted at 4× into a hidden `<video>`, captures each decoded frame via `requestVideoFrameCallback` as an `ImageBitmap`
- **Custom magnetic cursor** (`src/components/Cursor.jsx`) — a dot that snaps to the pointer and a lagging ring damped with rAF; uses `mix-blend-mode: difference` so it stays legible on any background, and swells on interactive elements via a `mouseover` event delegate
- **3D extruded hero title** — pure CSS `text-shadow` stack giving real depth without WebGL; the whole title parallaxes with the cursor (rAF-throttled with linear interpolation so it doesn't fire layout mutations on every raw `mousemove`)
- **Mouse-tilt feature cards** (`src/hooks/useTilt.js`) — `rotateX`/`rotateY` mapped from cursor-relative position, with inner content layered at `translateZ(20–50px)` so it pops out of the card on hover
- **Animated count-up metrics** (`src/hooks/useCountUp.js`) — `IntersectionObserver` + `easeOutCubic` interpolation, numbers count from 0 to target only when the metric enters the viewport
- **Sticky scroll-canvas in a tilted 3D frame** with cards floating around it in 3D space, connected to component-anchor points on the video by dashed SVG lines drawn live as scroll progresses
- **Performance-tuned** for slower hardware — DPR cap at 2, no `--mx`/`--my` CSS variables published to `document.documentElement` (was a global style-recalc trigger on every mousemove), no rotating `conic-gradient + blur-3xl` orbs (was a megapixel-class filter pass per scroll tick), `backdrop-blur-md` everywhere instead of `xl`, iridescent gradient titles are static rather than animated

## Run locally

```bash
npm install
npm run dev    # http://localhost:5200
```
