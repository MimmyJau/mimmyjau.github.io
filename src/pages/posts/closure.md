---
layout: ../../layouts/MarkdownPostLayout.astro
title: "closure"
pubDate: "2023-07-24"
author: "MimmyJau"
description: "Explaining closures to myself"
tags: ["js", "plt", "learning in public"]
---

This explanation will **definitely not** clear up everyone's misunderstanding of closures, but it did help clear up mine. So for anyone with a similar context and way of thinking as me, hopefully this can help.

> tl;dr: The existence of closures follows directly (and necessarily) from three design decisions around how functions ought to behave.

## Design Decision #1: Free Variables

In most languages (including JS), you'd like for functions to be able to reference variables from outside the function (i.e. in their enclosing scopes). There isn't any inherent reason why this **needs** to be true, but it's a design decision that's often quite useful and pretty common in most programming languages.

So in order for a function to be invoked properly, there are three types of variables it needs access to: 
1) variables declared in the function itself,
2) parameters passed to the function during invocation, and
3) any variables in the enclosing scopes that are referenced in the function.

The first two we call **bound variables**. The third we call **free variables**.

``` javascript
// We want functions like this to work.

const outside = 3; 

function dumbSum(parameter) {
    const inside = 1;
    console.log( 
        inside // bound variable
      + parameter // bound variable
      + outside  // free variable
    ); 
}

dumbSum(2) // 1 + 2 + 3 = 6
```

## Design Decision #2: First-Class Functions

In some languages (including JS), you'd also like for functions to be first-class. In other words, you can:
1) assign functions to variables, 
2) pass them as arguments into other functions, and 
3) return them from other functions just like any other type. 

Again, there isn't any inherent reason why a language **needs** to have first-class functions (in fact many don't) but it's a nice feature that can be pretty useful. 

In a language where functions are first-class, **where you invoke** the function **might not be the same place** as **where you declared** the function. In fact, in a language where functions are first-class, you should expect this to happen a lot.

So suppose we invoke a function somewhere other than the scope in which it's declared. Looking back at the types of variables we discussed earlier, the bound variables don't present any problems since there's no ambiguity around what their values should be—even if the function is invoked somewhere else. The free variables however, do present the following conundrum:

> If a function is called in a place other than where it was declared, which free variables do you want to use: the ones that are in the enclosing scope of where the function was declared? or the ones that are in the enclosing scope of where the function was invoked?

Look at the following two examples. Should it print `"lexical"` or `"dynamical"`?

``` javascript
// Example 1: Inside-Out

function outerFunc() {
    const variable = "lexical";
    
    function innerFunc() {
        console.log(variable)
    }

    return innerFunc;
}

const innerFunc = outerFunc()
const variable = "dynamical"
innerFunc() // Should it print "lexical" or "dynamical"?
```

``` javascript
// Example 2: Outside-In

const variable = "lexical"

function func() {
    console.log(variable)
}

function outerFunc(innerFunc) {
    const variable = "dynamical"
    innerFunc()
}

outerFunc(func) // Should it print "lexical" or "dynamical"?
```

## Design Decision #3: Lexical Scope

In almost all languages (including JS), language designers have collectively decided that they prefer having lexically-scoped functions. In other words, the free variables of a function are determined based on where the function was declared (lexically) instead of where the function is called (dynamically). So looking at the above examples, the console will log `"lexical"` for both.  

Again, there's no reason why it **needs** to be this way—dynamically-scoped languages do exist—but for reasons beyond the "scope" (heh) of this post, dynamically-scoped languages are becoming increasingly rare.

## Conclusion

So putting all these things together, we need to somehow "include" any free variables with a function at the time of its declaration, and make sure these free variables stay with the function as it gets passed around. This is called **closure** and it is a consequence of the three design decisions above.

To reiterate, the three design decisions are:
1) Functions have access to free variables,
2) Functions are first-class,
3) Free variables are lexically-scoped.

To satisfy all three requirements, a programming language **must** have closure. 

## P.S.

One complication illustrated in the first example is that `outerFunc` has returned before `innerFunc` is invoked. But `innerFunc` is still referencing a variable inside `outerFunc`'s scope. Therefore, the memory containing `outerFunc`'s scope cannot be discarded so long as it's being referenced. Thus, some form of **garbage collection** is required to implement closure.

## P.P.S.

> Q: What if free variables were dynamically-scoped?

In this case, we wouldn't need to keep track of the free variables around where the function was declared. If the function is invoked in a different scope, we would just hop down the call stack until we found the variable we were looking for. Thus, closure isn't required since the function doesn't need to "bring" free variables with it as it gets passed around. 

> Q: What if functions weren't first-class?

In this case, functions would never be invoked in a scope other than the one in which they were declared. Thus all the free variables they would ever need at invocation would be readily available to them. Again, this means that they don't need to "bring" any free variables with them (since there wouldn't be anywhere to "bring" them to in the first place).

> Q: What if functions didn't have access to free variables?

In this case, there wouldn't be any ambiguity around what each of the variables represented, even if the function was invoked in a completely different scope. Thus closure wouldn't be necessary. 

> Q: Can you give a bad analogy to help reinforce the concept?

Imagine functions are people who like to brush their teeth, meaning they need their toothbrush and toothpaste (free variables). Of course you could survive without ever brushing your teeth, but that would be pretty uncommon (programming languages where functions don't have access to free variables).

People also like to travel (first-class functions). When people travel to a new location, they'd also like to be able to brush their teeth at their destination (access free variables at scope of invocation).

Finally, people are a bit frugal. So they'd prefer to bring their toothbrush and toothpaste with them while travelling (lexically-scoped) instead of buying new ones at a drug store at their travel destination (dynamically-scoped).

All this is to say that you need a travel pouch (closure) to carry your toothbrush and toothpaste with you. If you don't brush your teeth, you could travel without this pouch. If you brush your teeth but don't travel, you also wouldn't need this pouch. Lastly, if you're willing to buy a toothbrush and toothpaste at your destination, you also wouldn't need this pouch. You only need the travel pouch if you do all three.

In other words, closure is the extra travel pouch containing outside variables that a function takes with it from its home city (where its declared in the code) to its destination city (where it's invoked).
