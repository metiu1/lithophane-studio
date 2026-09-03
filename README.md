<h1 align="center">Lithophane Studio — turn any photo into a 3D-printable lithophane</h1>

<p align="center">
  <strong>Free online lithophane generator. Drop in an image, get a print-ready STL or OBJ.</strong><br/>
  Runs entirely in your browser — nothing is uploaded, nothing is installed, no sign-up.
</p>

<p align="center">
  <a href="https://metiu1.github.io/lithophane-studio/"><strong>▶ Open the live demo</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/100%25-client--side-blue?style=flat-square" alt="Client side"/>
  <img src="https://img.shields.io/badge/upload-none-brightgreen?style=flat-square" alt="No upload"/>
  <img src="https://img.shields.io/badge/export-STL%20%7C%20OBJ%20%7C%20PNG-orange?style=flat-square" alt="Export formats"/>
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License"/>
</p>

---

## What a lithophane is, and what this does

A lithophane is a thin plate printed at varying thickness: thick where the photo is
dark, thin where it is bright. Flat and lit from the front it looks like a blank
white slab — put a light behind it and the picture appears.

Lithophane Studio does the conversion. You give it a JPG, PNG or WEBP; it builds the
heightmap, generates a **watertight** mesh (surface, base and side walls, not just a
displaced plane) and hands you a binary `.stl` your slicer will accept without
repair. You see the result in 3D, with a backlit preview, before you export anything.

**Why this one:** the usual lithophane generators upload your photo to a server, ask
you to register, or hand back a mesh with holes your slicer refuses. This one runs
in the page. Your photo never leaves the machine, because there is nothing to leave
it to — there is no backend.

## Features

- **Image to 3D** — JPG / PNG / WEBP, drag & drop
- **3 shapes** — flat panel, curved panel, cylinder (for lamps and lampshades)
- **Geometry** — width, min/max thickness, border, curvature, resolution
- **Image adjustments** — brightness, contrast, gamma, blur, negative, mirror
- **Live 3D preview** — orbit, zoom, wireframe, backlit glow background
- **Export** — binary `.stl` (watertight, print-ready), `.obj`, and a backlit grayscale PNG

## Run it locally

The live demo needs nothing. To run your own copy, ES modules require an HTTP server
(opening `index.html` as `file://` will not work):

```bash
git clone https://github.com/metiu1/lithophane-studio.git
cd lithophane-studio
python -m http.server 8000
```

Open **http://localhost:8000**

## 3D printing settings

| Parameter | Recommended |
|---|---|
| Min thickness | 0.6 mm |
| Max thickness | 3 mm |
| Layer height | 0.1 mm |
| Infill | 100 % |
| Supports | No |
| Negative | ON (dark → thick, for backlighting) |

Print flat panels standing upright, on the short edge: the layer lines then run
across the image instead of along it, and the detail survives.

## How it works

- **Three.js** — 3D rendering and preview
- **Canvas API** — image processing and heightmap extraction
- Watertight mesh generation (surface + base + walls) with custom STL/OBJ exporters
- Zero backend, zero dependencies to install, 100 % client-side

## License

MIT — see [LICENSE](LICENSE).
