---
layout: ../../layouts/MarkdownPostLayout.astro
title: "TIL: QuerySet.filter()"
pubDate: "2023-07-30"
author: "MimmyJau"
description: "Most QuerySet methods return new QuerySets"
tags: ["python", "django", "documentation", "TIL"]
---

Chaining a `.filter()` to a Django QuerySet will [return a new QuerySet](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#filter). It does not modify in-place the existing query.

For example, I was doing this:
``` python
queryset.filter(user=self.request.user.id)
queryset.filter(book__slug_full=self.kwargs.get("book"))
```

when I should have been doing this:
``` python
queryset = queryset.filter(user=self.request.user.id)
queryset = queryset.filter(book__slug_full=self.kwargs.get("book"))
```

This is not unique. According to the docs, this is [true for most QuerySet methods](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#queryset-api).
