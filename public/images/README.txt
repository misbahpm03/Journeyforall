Drop her photographs here, using exactly these names:

  scrapbook/photo-01.jpg   portrait   (first photo in the scrapbook)
  scrapbook/photo-02.jpg   landscape
  scrapbook/photo-03.jpg   square
  scrapbook/photo-04.jpg   portrait
  scrapbook/photo-05.jpg   portrait

  museum/exhibit-01.jpg    portrait   (also the little photo that leads into the museum)
  museum/exhibit-02.jpg    landscape
  museum/exhibit-03.jpg    portrait

Until a file exists, its slot shows a paper placeholder with the filename on it.

Want different names, more photos, or a different shape? Change the
"image" / "aspect" lines in src/content/gift.ts — that's the only place.

Size: ~1600px on the long edge, JPG quality ~80 (or .webp) is plenty.
Not .heic — export from Photos as JPEG first.
Faces are kept in the upper third when cropping.

After adding photos, restart `npm run dev` (or rebuild) so they're picked up.
