# Lithophane Studio — Crea Lithophane da Immagini (Export STL / OBJ)

**Generatore di lithophane online e gratuito.** Trasforma qualsiasi immagine in un modello 3D stampabile ed esporta in **STL**, **OBJ** e come **immagine retroilluminata PNG**. Anteprima 3D in tempo reale, tutto nel browser — nessun upload, nessuna registrazione.

🔗 **[Apri la demo live →](https://metiu1.github.io/lithophane-studio/)**

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![No backend](https://img.shields.io/badge/100%25-client--side-blue)

> Parole chiave: lithophane generator, image to STL, immagine to STL, lithophane online, lithophane maker, convertitore STL, stampa 3D, 3D printing, heightmap to mesh.

## ✨ Funzioni

- 🖼️ **Da immagine a 3D** — carica JPG/PNG/WEBP (drag & drop)
- 🧊 **3 forme** — piana, curva, cilindro (lampada/paralume)
- 🎚️ **Geometria** — larghezza, spessore min/max, bordo, curvatura, risoluzione
- 🌗 **Regolazioni** — luminosità, contrasto, gamma, sfocatura, negativo, specchio
- 👁️ **Anteprima 3D** — orbita, zoom, wireframe, sfondo con glow retroilluminato
- 📦 **Export** — `.stl` binario (watertight, pronto stampa), `.obj`, e **PNG retro** in scala di grigi

## 🚀 Avvio locale

I moduli ES richiedono un server HTTP (non `file://`):

```bash
git clone https://github.com/metiu1/lithophane-studio.git
cd lithophane-studio
python -m http.server 8000
```

Apri **http://localhost:8000**

## 🖨️ Guida alla stampa 3D

| Parametro      | Valore consigliato |
|----------------|--------------------|
| Spessore min   | 0.6 mm             |
| Spessore max   | 3 mm               |
| Altezza layer  | 0.1 mm             |
| Infill         | 100 %              |
| Supporti       | No                 |
| Negativo       | ON (scuro → spesso, per retroilluminazione) |

## 🛠️ Tecnologia

- **Three.js** — rendering e anteprima 3D
- **Canvas API** — elaborazione immagine e heightmap
- Generazione mesh **watertight** (superficie + base + pareti) + esportatori STL/OBJ custom
- Zero dipendenze backend, 100% client-side

## 📄 Licenza

MIT — vedi [LICENSE](LICENSE).
