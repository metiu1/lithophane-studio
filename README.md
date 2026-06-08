# Lithophane Studio

Interfaccia web per creare lithophane da immagini. Tutto in locale nel browser, nessun upload.

## Avvio
I moduli ES richiedono un server HTTP (non `file://`):

```powershell
cd C:\Users\Paolo\Downloads\lithopane
python -m http.server 8000
```
Apri http://localhost:8000

## Funzioni
- Carica immagine (drag&drop / click)
- **Forma**: piana, curva, cilindro
- **Geometria**: larghezza, spessore min/max, bordo, curvatura, risoluzione
- **Immagine**: luminosità, contrasto, gamma, sfocatura, negativo, specchio
- Anteprima 3D (orbita/zoom) + vista immagine elaborata
- **Export**: `.stl` (binario, stampabile), `.obj`, e PNG retro (grayscale da retroilluminare)

## Note stampa
- Negativo ON = scuro→spesso (corretto per retroilluminazione)
- Spessore min ~0.6 mm, max ~3 mm, layer 0.1 mm, 100% infill, no supporti
