# Lithophane Studio — Create Lithophanes from Images (Export STL / OBJ)

**Free online lithophane generator.** Turn any image into a 3D-printable model and export to **STL**, **OBJ**, and as a **backlit PNG image**. Real-time 3D preview, all in the browser — no upload, no sign-up.

🔗 **[Open the live demo →](https://metiu1.github.io/lithophane-studio/)**

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![No backend](https://img.shields.io/badge/100%25-client--side-blue)

> Keywords: lithophane generator, image to STL, lithophane online, lithophane maker, STL converter, 3D printing, heightmap to mesh.

## ✨ Features

- 🖼️ **Image to 3D** — upload JPG/PNG/WEBP (drag & drop)
- 🧊 **3 shapes** — flat, curved, cylinder (lamp/lampshade)
- 🎚️ **Geometry** — width, min/max thickness, border, curvature, resolution
- 🌗 **Adjustments** — brightness, contrast, gamma, blur, negative, mirror
- 👁️ **3D preview** — orbit, zoom, wireframe, backlit glow background
- 📦 **Export** — binary `.stl` (watertight, print-ready), `.obj`, and **backlit grayscale PNG**

## 🚀 Run locally

ES modules require an HTTP server (not `file://`):

```bash
git clone https://github.com/metiu1/lithophane-studio.git
cd lithophane-studio
python -m http.server 8000
```

Open **http://localhost:8000**

## 🖨️ 3D printing guide

| Parameter      | Recommended value |
|----------------|--------------------|
| Min thickness  | 0.6 mm             |
| Max thickness  | 3 mm               |
| Layer height   | 0.1 mm             |
| Infill         | 100 %              |
| Supports       | No                 |
| Negative       | ON (dark → thick, for backlighting) |

## 🛠️ Technology

- **Three.js** — 3D rendering and preview
- **Canvas API** — image processing and heightmap
- **Watertight** mesh generation (surface + base + walls) + custom STL/OBJ exporters
- Zero backend dependencies, 100% client-side

## 📄 License

MIT — see [LICENSE](LICENSE).
