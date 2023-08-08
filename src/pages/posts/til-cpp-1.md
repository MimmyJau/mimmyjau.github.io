---
layout: ../../layouts/MarkdownPostLayout.astro
title: "TIL: C++ (part 1)"
pubDate: "2023-08-07"
author: "MimmyJau"
description: "Random C++ learnings"
tags: ["c++", "oop", "TIL"]
---

Random C++ stuff.

### compiler

Use `g++` or `clang++` to compile `.cpp` code, not `gcc` or `clang`.

### printing to standard out

`printf` is non-idiomatic. Instead of using `<cstdio>`, use `<iostream>` and `std::cout << x`.

### static

`static` keyword has a few different meanings, including:
- If used for a global variable, the variable is only accessible within current file (internal linkage).
- If used on a member variable, that variable is shared among all instances of a class (rather than each instance having its own copy).
- If used on a member function, that function can be called directly by the class (instead of needing to be called by an instance).
- It used on a variable declared in a function, that variable's value is retained between function calls.

### virtual

`virtual` keyword means the member function can be overridden by a derived class via **true polymorphism**. This is only relevant when assigning the address of a derived class to a pointer or reference of the base class. Then when calling the method, a `virtual` will always call the overriden class correctly. For example:
``` cpp
#include <iostream>

class Base {
public:
    void show() {
        std:: cout << "Base's show()\n";
    }
    virtual void vshow() {
        std:: cout << "Base's vshow()\n";
    }
};

class Derived : public Base {
public:
    void show() {
        std:: cout << "Derived's show()\n";
    }
    void vshow() {
        std:: cout << "Derived's vshow()\n";
    }
};

int main() {
    Derived d;

    Base *bp = &d;
    bp->show(); // "Base's show"
    bp->vshow(); // "Derived's vshow"

    Base& br = d;
    br.show(); // "Base's show"
    br.vshow(); // "Derived's vshow"


    // Neither of these work in C++
    // Derived *dp = &b;
    // Derived& dr = b;

    return 0;
};

```

### destructor

`~` in front of a method that has the same name as the class name declares the destructor. For example:
``` cpp
class Base {
public:
	virtual ~Base() = default;
}
```
A destructor is called to destroy the object and presumably free whatever memory was allocated to it. 

We often want destructors to be virtual so that calling a destructor on a derived class will always properly free the memory. Otherwise, as illustrated above we might only call the base class' destructor, which could lead to information leakage or undefined behaviour.

### pointer vs reference
These are two distinct languages feature in C++ (unlike C which only had pointers). Pointers in C++ work similar to how they do in C. References in C++ are like pointers except for the following:

- References need to be initialized when declared, unlike pointers which can be declared first.
- References are non-nullable. Pointers can be set to `null` or `nullptr`.
- Reference cannot be re-assigned. Pointers of course can be re-assigned.
- References are implicitly de-referenced (e.g. `ref = 42`). Pointers must be explicitly de-referenced (e.g. `*ptr = 42`).
- References cannot do pointer-arithmetic.
- References are generally safer, since they're implemented with pointers under-the-hood.
- References are useful for passing as arguments to functions without having to copy all the data. Pointers are used to point to objects dynamically (e.g. linked list). 

### public vs protected vs private members
`public`: accessible outside class, accessible by derived classes  
`protected`: not accessible outside class, accessible by derived classes  
`private`: not accessible outside class, not accessible by derived classes  

### public vs protected vs private inheritance
`public`: public and protected members in base class stay public and protected in derived class  
`protected`: public and protected members in base class become protected in derived class  
`private`: public and protected members in base class become private in derived class  

Using public inheritance, we're saying the derived class and the base class are interchangeable, thus adhering to Liskov's Substitution Principle.

Using private inheritance, we're using the parent class to implement the child class, but that the interface of the child class is different.

Using protected inheritance, we're sitting somewhere in-between. Apparently it's [rarely used](https://stackoverflow.com/a/1374362).

### Liskov's substitution principle

Functions that use base classes pointers should be able to use derived classes pointers. In other words, objects of child classes must behave the same ways as objects of parent classes.

### constructor and initializer list

In C++, a constructor is just a method with the same name as the name of the class (instead of a keyword `constructor` like in js or `__init__` in Python). It contains an initializer list and a body. The initializer list is specific to C++.

The initializer list is a comma-separated list of values for initializing any member variables. It is also used to pass parameters to the base class constructor.

The initializer list is not optional for `const`, references, or for passing parameters to the base class constructor. For the first two, we must initialize the variables with a value. For the latter, the base class' constructor is implicitly called when calling the derived class' constructor.
