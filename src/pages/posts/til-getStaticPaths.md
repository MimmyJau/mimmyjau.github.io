---
layout: ../../layouts/MarkdownPostLayout.astro
title: "TIL: getStaticPaths() and removing duplicates in arrays"
pubDate: "2023-08-02"
author: "MimmyJau"
description: "Learnings from the Astro tutorials"
tags: ["js", "astro", "TIL"]
---

### `getStaticPaths()`

`getStaticPaths()` is an API provided by both NextJS and Astro for generating routes. In other words, it generates valid urls. 

It returns an array of valid routes, where each valid route is an object containing a `params` field and `props` field. The `params` field is the important one since it describes the valid url path. 

Borrowing directly from [the tutorial](https://docs.astro.build/en/tutorial/5-astro-api/2/#create-pages-dynamically), here's a naive use of it.

``` javascript
// src/pages/tags/[tag].astro

export async function getStaticPaths() {
  return [
    { params: { tag: "astro" } },
    { params: { tag: "successes" } },
    { params: { tag: "community" } },
    { params: { tag: "blogging" } },
    { params: { tag: "setbacks" } },
    { params: { tag: "learning in public" } },
  ];
}
```

This function creates the following routes:
- src/pages/tags/astro
- src/pages/tags/successes
- src/pages/tags/community
- ...

Of course, this doesn't take advantage of the full power of generating valid url routes dynamically. Later in the tutorial we see a [better example](https://docs.astro.build/en/tutorial/5-astro-api/2/#final-code-sample).

``` javascript
export async function getStaticPaths() {
  const allPosts = await Astro.glob('../posts/*.md');

  const uniqueTags = [...new Set(allPosts.map((post) => 
    post.frontmatter.tags).flat()
  )];

  return uniqueTags.map((tag) => {
    const filteredPosts = allPosts.filter((post) =>
      post.frontmatter.tags.includes(tag)
    );
    return {
      params: { tag },
      props: { posts: filteredPosts },
    };
  });
}
```

This function automatically creates a new page for each tag without having to hardcode it like in the first example. Much better.

### `[...new Set()]`

This is a new pattern I also discovered from reading the Astro tutorial. You can see it used in the second example above. 

``` javascript
const uniqueTags = [...new Set(allPosts.map((post) => 
  post.frontmatter.tags).flat()
)];
```

First, there isn't any `Set` literal syntax in JS, so we have to call the constructor with the `new` keyword in order to instantiate a `Set`.

Second, the `...` before `new` just means de-structuring the `Set` back into an array. The `...` spread operator applies to the newly constructed `Set`, not to the `new` keyword. 

This pattern is useful if we want to remove duplicates in an array. We convert it into a `Set` and then immediately back into an array. Voila.[^nested]

[^nested]: The example in the tutorial has an added complication that we're reducing a nested array with duplicates into a flat array without duplicates. So in the `Set()` constructor there is an expression that involves `map` to create the nested array and `.flat()` to flatten it.
