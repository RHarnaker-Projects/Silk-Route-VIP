# Media included in this runtime handover

The current `index.html` selects these two local hero videos:

- `assets/video/hero-silk-route-premium-v7-web.mp4` for desktop.
- `assets/video/hero-silk-route-premium-mobile-v13-portrait-web.mp4` for screens at or below 700px.

The package also contains all eight WebP vehicle images imported by `site.js`, all four SVG brand assets (including the mark required by `npm run check`), and the public social-preview images. All current frontend asset references are present. Media files were copied byte-for-byte and appear in the SHA-256 manifest.

The existing README describes earlier film work and retains generation IDs. It is historical provenance, not an authoritative description of the currently selected encodes. Desktop v7 and mobile v13 have separate production histories and durations; no videos were regenerated for this handover.

## Source and licensing notes

These existing notes are included unchanged:

- [Client photography sources](../assets/source/client-photography/SOURCES.md)
- [Location-plate sources](../assets/source/location-plates/SOURCES.md)
- [Hotel-plate sources](../assets/source/hotel-plates/SOURCES.md)
- [Public media credits](../media-credits.html)

Source notes identify photographer originals, Pexels plates and hotel photographs with their source/license links. Those provenance documents describe original media that is deliberately outside this runtime package. Retain the supplied attribution and license obligations when reusing the media. No new legal or licensing assessment was made.

## Excluded originals and historical production assets

This package is scoped to the website source and current runtime assets. Raw photographer JPEGs, source plates, generation intermediates, alternate film encodes, historical masters, contact sheets, storyboards, social draft packs and temporary assemblies are therefore excluded. They remain untouched in the original local project. They are not missing from the current website runtime.

The local inventory found the source photography and production media, including all 41 explicitly declared inputs across the retained video-editing scripts. Those inputs are not transferred in this narrowed package. The PowerShell media-editing scripts require FFmpeg and their original inputs to rerender; the scripts themselves are retained as source. The alternate Seedance preview config refers to excluded historical films and targets old homepage filenames, so it should not be treated as the current production film workflow.

No runtime media needs to be downloaded from Drive to build the packaged website. No full generation-account job exports or additional photographer originals beyond the local inventory were verified. Use [hosting and access](HOSTING_AND_ACCESS.md) to arrange original-media access separately if necessary.
