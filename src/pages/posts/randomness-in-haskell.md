---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Randomness in Haskell"
pubDate: "2023-08-23"
author: "MimmyJau"
description: "Reconciling randomness with pure functions."
tags: ["haskell", "fp", "learning in public"]
---

In Haskell, we want functions to be deterministic. On the other hand we also want randomness (which isn't deterministic).

To get determinism in Haskell, `random`-like functions (`random`, `randomR`, `randoms`, etc.) will always generate the same result if called with the same seed (required as a parameter). Calling it once might return a result that looks random, but any subsequent calls with the same seed will return the same result. Thus we have a "pure" function. 

To get actual randomness, Haskell has a non-deterministic function `newStdGen` for generating a random seed. Haskell has confusingly[^stdgen] named the seed type `StdGen` which stands for "standard generator", implying it generates / returns a value. But from the perspective of the API, `StdGen` is a seed you pass into the `random`-like functions. It is these latter functions that return a number.

In other words, instead of a random number generator, we have a **deterministic** number generator and a **random** seed generator.

> Note: We use the adjective "number" in "number generator". But Haskell has a typeclass `Random` that describes any type that could be randomized. This includes `Bool`, `Int`, `Float`, `Char`, etc.

To make this concrete, here's an example:

In many languages, `random(0,10)` will give you a random number between `0` and `10`. A subsequent call will likely give you a different result. Many calls should generate a sequence that looks sufficiently random.

In Haskell, we first create a generator `gen` of type `StdGen` (remember here that `StdGen` is basically a synonym for "seed"), we then pass that generator to any `random`-like function (e.g. `randomR (0,10) gen`). Given the same `gen`, it will **always** produce the same result. 

Does that mean to generate a sequence that looks random, we need to generate a new `gen` for every call? 

Not exactly. Every `random`-like function in Haskell has been designed to return not just the "random" value but a new `StdGen` seed that 1) was generated deterministically, and 2) if used as input to another call, will appear like a completely random call. 

```haskell
let (n, gen') = randomR (0, 10) gen
```

We can then pass the new `gen'` to another `random`-like function to get a different-looking but still deterministic result. In other words, we now have a sequence of calls to a `random`-like function that look random, but is actually very simple to replicate. 

Why all the hassle?[^why] Abstractly, Haskell is separating pseudorandomness that is intended to be difficult to replicate (i.e. cryptographic PRNGs) from pseudorandomness that is very easy to replicate. Alternatively, we can say that Haskell is separating out "randomness" as a concept (in the seed generator) from the calculation involved in using "randomness" to generate a value. In doing so, Haskell has further pushed the limits of what can be done via pure functions, adhering to its functional programming philosophy. 

[^stdgen]: At least, it was confusing for me when I first came across it.

[^why]: Admittedly I'm new to this, so this rationale is just my way of of understanding the design-decision.


