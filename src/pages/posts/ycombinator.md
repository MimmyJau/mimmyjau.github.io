---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Y combinator"
pubDate: "2023-08-06"
author: "MimmyJau"
description: "Explaining Y combinators to myself"
tags: ["plt", "lisp", "lambda calculus", "learning in public"]
---

## Motivation

Can you implement recursion if a function isn't allowed to reference itself? A function might not be able to reference itself for a number of reasons: it could be an anonymous function, a combinator[^combinator], or perhaps as a purely intellectual exercises you'd like to implement recursion without assuming its existence.

Consider a classic example of recursion:
``` scheme
(define (factorial n)
  (if (< n 2)
      1
      (* n (factorial (- n 1)))))
```

The body of `factorial` references itself on the last line, and it can only do that because the function has a name. Regardless of programming language, you'll find this typical of most recursive functions: **they have a name, and that name is used in the body of the function**.

Which brings us back to the original question: can you implement recursion if functions aren't allowed to reference themselves (either because they're anonymous, non-recursive, or combinators)? [^anonymous]

[^combinator]: Functions that don't have access to free variables (i.e. variables that aren't parameters or that aren't defined in the body of the function) are call **combinators**. For example, the definition of `factorial` above is not a combinator, since the reference to `factorial` in the last line is a reference to a free variable. 

[^anonymous]: Anonymous functions by themselves cannot be recursive since they don't have a name to self-reference. For a similar reason, combinators cannot by themselves be recursive. For the purposes of this discussion, anonymous functions, non-recursive functions, and combinators are the same. 
## Explanation

The answer is yes and the solution is called the Y combinator. 

Here's the Y combinator.
```scss
Y = λf.(λx.f (x x)) (λx.f (x x))
```

> In untyped lambda calculus, there are only three notations: 1) variables like `x`, `f`, or `y`, 2) function definitions that use `λ` to denote the start of the function and `.` to separate the arguments (on the left) from the body (on the right), and 3) function invocation where you write a function next to its arguments (e.g. `f x y`).

The `Y` combinator is a function (as denoted by `λ`), that takes a single argument `f`. The body of the function is the two repeating `(λx.f (x x)) (λx.f (x x))`.  It's not recursive since it doesn't reference itself in its body. 

What you'll notice is that the body is itself another function and its corresponding argument. The first instance of `(λx.f (x x))` is the function and the second instance of `(λx.f (x x))` is the argument passed to the first instance. In other words, the second `(λx.f (x x))` becomes the `x`'s in the function body `f (x x)`.

So if you were to substitute the second `(λx.f (x x))` into the first `(λx.f (x x))`, you would get
```scss
Y = λf.(f ((λx.f (x x)) (λx.f (x x))))
```

The only difference is the extra `f`. As a result, you could again pass the second `(λx.f (x x))` as an argument into the first `(λx.f (x x))`. Giving you
```scss
Y = λf.(f (f ((λx.f (x x)) (λx.f (x x)))))
```

which adds another `f`. And of course, you can do this as many times as you want, giving you
```scss
Y = λf.(f (f (f (f (f (f ... ((λx.f (x x)) (λx.f (x x)))))...))))
```

In other words, the `Y` combinator takes a function `f` and returns another function that looks like `f` "applied" to itself an infinite number of times. In other words, `Y`  gives us something that looks a lot like recursion despite not being recursive itself. 

> Note: This infinite "recursion" of `f`'s is still itself a function. We're not yet in the territory of working with primitive types like `Int` for a concrete example like `factorial :: Int -> Int`. All we've done is shown that `Y` is inherently "recursive" despite not referencing itself. 


Looking at this definition of `Y` might raise a couple question.

> Q:  Can we even define `Y` without it leading to a stack overflow? 

This is an implementation detail and involves some form of lazy-evaluation, where the first `f` only calls the second `f` if needed, and the second `f` only calls the third `f` if needed, and so on and so forth. In other words, it doesn't happen all at once.

> Q: Aren't recursive functions only useful if they can stop at some point and return a value? How would this function know when to stop?

The implementation of `f` (not the implementation of `Y`) contains the "knowledge" of when to stop and return a value. We can illustrate this with an example. Suppose we wanted to use `Y` to implement `factorial`. What function would we use as input into `Y` to give us `factorial`? Suppose we defined the following function:

``` scheme
; Credit to Mike Vanier for the tutorial
; Source: https://mvanier.livejournal.com/2897.html

(define (almost-factorial f)
  (lambda (n)
    (if (= n 0)
        1
        (* n (f (- n 1))))))
```

Note that this function is also not recursive despite looking pretty close to the implementation of `factorial` we had above. Instead of referencing itself, it takes as a parameter a function and can either halt (if `n` equals 0) or invoke the parameter. 

If we passed this function `almost-factorial` to `Y`, `Y` would expand it out and give us something like 
`(almost-factorial (almost-factorial (almost-factorial ...)))`, which is exactly the `factorial` function we want.

If it isn't clear why applying `almost-factorial` to itself an infinite number of times would give us exactly the `factorial` function we want, first notice that `almost-factorial` by itself works if `n` is `0`. For example, `(almost-factorial 0)` would give us the correct answer. However, for `n = 1` or higher, it would try and invoke `f` which doesn't exist, and thus the function would fail.

On the other hand,`(almost-factorial almost-factorial)` would work for both `n = 0` and `n = 1`, but not for `n = 2` or higher. Continuing one more time, `(almost-factorial (almost-factorial almost-factorial))` would work for `n <= 2`. By induction, using `Y` to expand `almost-factorial` as many times as necessary, we'll have a functioning `factorial` implementation. 

## Summary

Step 1: We start with a recursive function.
``` scheme
(define (factorial)
  (lambda (n)
    (if (= n 0)
        1
        (* n (factorial (- n 1))))))
```

Step 2: We then remove the self-referential call and instead pass it in as a parameter.
``` scheme
; Credit to Mike Vanier for the tutorial
; Source: https://mvanier.livejournal.com/2897.html

(define (almost-factorial f)
  (lambda (n)
    (if (= n 0)
        1
        (* n (f (- n 1))))))
```
We know the above function would work as intended if we passed it to itself as an argument. 

Step 3: The Y combinator takes care of passing a function to itself as many times as necessary.
``` scheme
; Credit to Mike Vanier for the tutorial
; Source: https://mvanier.livejournal.com/2897.html

(define Y 
  (lambda (f)
    ((lambda (x) (f (lambda (y) ((x x) y))))
     (lambda (x) (f (lambda (y) ((x x) y)))))))
```

This gives us recursion as intended. 

# Further Reading

- [Recursive arrow functions in JS](https://stackoverflow.com/questions/25228394/how-do-i-write-an-arrow-function-in-es6-recursively/25233790#25233790)
- [The Y Combinator (Slight Return)](https://mvanier.livejournal.com/2897.html) (the most detailed explanation I've found)
- [Graham Hutton discussing the Y combinator](https://www.youtube.com/watch?v=9T8A89jgeTI) (nice intuition and motivation)
- [The Y Combinator explained with JavaScript](https://kestas.kuliukas.com/YCombinatorExplained/)
- [Y in Practical Programs](https://blog.klipse.tech/assets/y-in-practical-programs.pdf)
- [That About Wraps it Up: Using FIX to Handle Errors Without Exceptions, and Other Programming Tricks](http://www.lfcs.inf.ed.ac.uk/reports/97/ECS-LFCS-97-375/)
- The Little Schemer (Chapter 9)
