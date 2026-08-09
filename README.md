The PARACUDA-NG website and documentation, published at
[https://paracuda-ng.github.io/](https://paracuda-ng.github.io/).

This is an organization GitHub Pages repository, so the site is served from the
repository root. It is a static site with no build step: three files plus three
images.

```text
index.html            the whole site (single page, anchored sections)
.nojekyll             tells GitHub Pages to serve the folder as-is
assets/
  styles.css          layout, colour schemes, print styles
  site.js             theme toggle, search, tabs, code copy, scrollspy
  paracuda-icon.png   favicon and header logo
  screenshot_paracuda.png
  screenshot_data_converter.png
```

It documents all three PARACUDA-NG builds, each of which lives elsewhere:

| Build                               | Where the code lives                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Desktop application, main code base | [https://github.com/sharadgupta27/paracuda-ng](https://github.com/sharadgupta27/paracuda-ng)                                        |
| QGIS plugin                         | [https://github.com/sharadgupta27/paracuda-qgis](https://github.com/sharadgupta27/paracuda-qgis)                                    |
| Python package                      | Published to PyPI and conda-forge as`paracuda-ng`; it has no repository of its own and lists `paracuda-ng` as its project link |

## Publish

1. Create the repository **`paracuda-ng.github.io`** inside the `paracuda-ng`
   organization. The name must match the organization exactly, or Pages will
   serve it from a subpath instead of the root.
2. Push this folder to it.
3. **Settings > Pages > Build and deployment > Deploy from a branch**, branch
   `main`, folder `/ (root)`.

The site is live at [https://paracuda-ng.github.io/](https://paracuda-ng.github.io/) a minute or two later. No
other repository needs Pages enabled.

## Preview locally

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Editing

- Content lives in `index.html` as ordinary HTML sections. Each `<h2>` and `<h3>`
  carries an `id`, and both sidebars link to those ids, so a new section needs an
  entry in the primary nav list and, for a top-level section, in the "On this
  page" list.
- Code blocks are plain `<pre><code class="language-python">` or
  `class="language-bash"`. Highlighting and the copy button are added at runtime.
- Colours are CSS custom properties at the top of `styles.css`. The dark scheme
  overrides only the tokens it changes.
- `assets/screenshot_paracuda.png` and `assets/screenshot_data_converter.png` are
  also the images shown on the PyPI project page, which links to them here. Keep
  the file names stable.
- The site is self-contained apart from the Google Fonts stylesheet and the
  shields.io badges. Remove that `<link>` if it has to work fully offline; the
  font stack falls back to the system sans-serif.
