<h1 align="center">Lithophane Studio — turn a photo into a 3D print that glows</h1>

<p align="center">
  <strong>Drop in a picture, get a file your 3D printer can print.</strong><br/>
  Hold it up to a light and the photo appears. Free, runs in your browser, nothing is uploaded.
</p>

<p align="center">
  <a href="https://metiu1.github.io/lithophane-studio/"><strong>▶ Try it now — no sign-up, no install</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/100%25-in%20your%20browser-blue?style=flat-square" alt="Client side"/>
  <img src="https://img.shields.io/badge/upload-none-brightgreen?style=flat-square" alt="No upload"/>
  <img src="https://img.shields.io/badge/export-STL%20%7C%20OBJ%20%7C%20PNG-orange?style=flat-square" alt="Export formats"/>
  <img src="https://img.shields.io/badge/price-free-success?style=flat-square" alt="Free"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License"/>
</p>

---

## What a lithophane is

A lithophane is a thin plate printed at varying thickness — thick where the photo is
dark, thin where it is bright. Sitting on a shelf it looks like a blank white slab. Put
a lamp or a window behind it and the picture appears, in surprising detail.

They make very good gifts, night lights and lamp shades, and they print on any ordinary
FDM printer in white PLA. The only hard part is turning the photo into a printable file.

## What this does

That conversion, in your browser. You give it a JPG, PNG or WEBP; it works out the
thickness map and builds a **watertight** mesh — surface, base and side walls, not just
a bumpy plane — then hands you a binary `.stl` your slicer will accept without asking
you to repair it first.

You see the result in 3D before you export, with a backlit preview that shows roughly
what it will look like once it is printed and lit. Adjust brightness, contrast and
thickness until it looks right, then download.

Flat panel, curved panel, or a full cylinder for a lamp shade.

## Who it is for

- **Anyone with a 3D printer** who wants to make a gift out of a photo and does not want
  to learn Blender to do it.
- **People who would rather not upload family photos** to a stranger's website to get
  an STL back.
- **Anyone who tried a free online generator** and got a mesh full of holes that the
  slicer refused, or a paywall at the download step.

## Why this one

The usual lithophane generators upload your photo to a server, ask you to register, cap
the resolution, or hand back a broken mesh. This one runs inside the page: your photo
never leaves your computer, because there is nowhere for it to go — there is no backend
at all. No account, no limit, no watermark, no cost.

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
