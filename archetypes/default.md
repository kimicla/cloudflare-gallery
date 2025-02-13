---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
description: ""
tags: []
categories: []
featured_image: ""
layout: "gallery"
---

{{< cloudflare-gallery 
    image-prefix=""
    layout="grid"
    category="all"
    items-per-page="30"
>}} 