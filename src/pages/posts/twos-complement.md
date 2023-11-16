---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Two's Complement in 100 Seconds"
pubDate: "2023-11-16"
author: "MimmyJau"
description: "Key concepts in two's complement."
tags: ["architecture", "memory", "learning in public"]
---

If there's only one thing you need to understand about two's complement, it's the following:

>  Negative numbers should have binary representations such that subtraction can be accomplished using the same algorithm as addition.

In order for this to work, the following is **sufficient**:

> For all $x$, let $\overline{x}$ be the binary value such that $x + \overline{x} = 0$ under binary addition. Then $\overline{x}$ is the binary representation of $-x$.

For example, knowing that
1) $0011_2$ has been defined as $3$, and [^binary]
2) $0011_2 + 1101_2 = 0000_2$,

it follows that $1101_2$ **must** be defined as $-3$. 

Almost everything else about two's complement is a consequence of these ideas. For example, this explains why the common trick for multiply by $-1$ is to flip all the bits and add one.

## Why this works (optional reading)

To prove that this representation of negative numbers satisfies subtraction, we can prove the following two statements. 

> Prove that the binary representation of each negative number is unique.

*Exercise left to the reader.*

> Let $\odot$ represent binary addition via two's complement. Prove that for any arbitrary $x$ and $y$, $x \odot (-y) = x - y$.

If $x >= 0$ and $y <= 0$, then the statement is directly applicable since $\odot \equiv +$ when both operands are non-negative numbers. 

If both $x$ and $y$ are non-negative and $x >= y$, then $(x-y) \odot y = x - y + y = x$, where the first equality is true since binary addition of two positive number is simply addition. Applying $\odot \, (-y)$ to both sides we get $(x-y) \odot y \odot (-y) = x \odot (-y)$, with the left-hand side simplifying to $x - y \odot 0 = x - y$, satisfying the equality.

*The rest is left as an exercise to the reader.*

[^binary]: The subscript $2$ in $0101_2$ means this is a binary number.
