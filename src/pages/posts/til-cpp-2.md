---
layout: ../../layouts/MarkdownPostLayout.astro
title: "TIL: C++ (part 2)"
pubDate: "2023-08-08"
author: "MimmyJau"
description: "More random C++ learnings"
tags: ["c++", "oop", "TIL"]
---

*\[Disclaimer: Much of what I'm saying here is likely to be wrong, partially wrong, or a major oversimplification. If you have any suggestions, please let me know.\]*

### new in c++
The `new` operator in C++ is not a constructor (like in JS), but allocates memory (like `malloc` or `calloc` in C). 

So for example, this code in C++
``` cpp
int *ptr = new int
```
is equivalent to this code in C.
``` c
int *ptr = malloc(sizeof *ptr)
```

And this code in C++
``` cpp
int *arr = new int[10]()
```
is equivalent to this code in C.
``` c
int *ptr = calloc(10, sizeof *ptr)
```

When `new` is called to allocate an array of memory, it is automatically initialized to `0`. 

### smart pointers

There are three types of smart pointers in C++ that help automatically free memory once the last reference goes out of scope.
- `unique_ptr`: Only one pointer can "own" an object. It cannot be copied, but it can be moved with `std::move()`, ensuring unique ownership. 
- `shared_ptr`: Multiple pointers can "own" an object. There is an internal count of all the references, and once all references are out of scope, the object is destroyed and the memory is freed.
- `weak_ptr`: Used in conjunction with `shared_ptr`. Can create a new pointer without increasing internal reference count of `shared_ptr`. When the last `shared_ptr` is destroyed, the object is deleted even with `weak_ptr` still pointing to it. `weak_ptr`'s are mainly used to solve issues for [cyclic data structures](https://stackoverflow.com/a/7473652/).

### templating class

In C++ you can define a template class that uses a placeholder for a type (usually). When you call the class constructor, you first provide the template argument so the class knows which type to give to the placeholder. 

You can also pass non-type arguments like integral values, pointers, references, and other templates. 

A classic example is `std::vector`, which takes a template argument to know the underlying type of the array. For example, we write `std::vector<int>` or `std::vector<std::string>`, before creating the object. 

A simple implementation of `std::vector` that uses a type as a template argument might look like this.
```cpp
template <typename T>
class SimpleVector{
private:
    T* arr;
    std::size_t capacity;
    std::size_t size;
public:
    // constructor, methods, etc.
}
```

A simple implementation of a template class that uses an integral value as a template argument might look like this.
```cpp
template <int Size>
class FixedArray {
    int data[Size];
public:
    FixedArray() {}
};
```

`unique_ptr`'s are a template class, so they require a template argument like `std::unique_ptr<int>`. Once the template has been instantiated into a class, you can then create an object. 

There are only two ways of creating a `unique_ptr`. The old way was
``` cpp
std::unique_ptr<int> p(new int(10));
```
or using more modern syntax, we use `make_unique`
``` cpp
std::unique_ptr<int> p = std::make_unique<int>(10)
```
which is safer. You can read more about it [here](https://stackoverflow.com/q/37514509), but it mainly has to do with atomicity when allocating memory and assigning it to a variable.

The reason the next code example doesn't compile is because we're trying to **assign** a raw pointer to a `unique_ptr`. 
```cpp
// THIS CODE WON'T COMPILE.
std::unique_ptr<int> p = new int(10);
```

### auto
C++ has a placeholder type called `auto` that basically says "deduce my type based on whatever is provided". So using `unique_ptr` as an example, we could do this instead
``` cpp
auto p = std::make_unique<int>(10)
```
which is especially helpful if the type name is long. It also avoids duplication and is generally easier to understand. vErY cOoL.
