# Cloudflare Gallery Theme for Hugo

A minimal and responsive Hugo theme for creating beautiful image galleries using Cloudflare Images.

## Features

- Cloudflare Images integration
- Responsive grid layout
- Lazy loading
- Lightbox support
- Infinite scroll
- Mobile-friendly design

## Installation

1. Add the theme as a submodule:
```bash
git submodule add https://github.com/kimicla/cloudflare-gallery.git themes/cloudflare-gallery
```

2. Update your site's config.toml:
```toml
theme = "cloudflare-gallery"

[params.cloudflareImages]
accountHash = "your-account-hash"
workerURL = "your-worker-url"
defaultLayout = "grid"
itemsPerPage = 30

# Image variants
variants = [
  { name = "thumbnail", width = 300, height = 300, fit = "cover" },
  { name = "preview", width = 800, height = 600, fit = "contain" },
  { name = "full", width = 2048, height = 0, fit = "contain" }
]
```

## Usage

Create a new gallery page:

```markdown
---
title: "Photo Gallery"
layout: "gallery"
---

{{</* cloudflare-gallery 
    image-prefix="your-prefix"
    layout="grid"
    category="all"
    items-per-page="30"
*/>}}
```

## Configuration

### Required Parameters

- `accountHash`: Your Cloudflare account hash
- `workerURL`: URL to your Cloudflare worker that serves the images

### Optional Parameters

- `defaultLayout`: Gallery layout (default: "grid")
- `itemsPerPage`: Number of images per page (default: 30)
- `variants`: Image variant configurations

## License

MIT License
