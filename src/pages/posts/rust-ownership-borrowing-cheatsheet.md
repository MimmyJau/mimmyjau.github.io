---
layout: ../../layouts/BaseLayout.astro
title: "Rust Ownership and Borrowing Cheatsheet"
pubDate: "2023-09-07"
author: "MimmyJau"
description: "Generalizing examples from the Rust Book."
tags: ["rust", "plt", "learning in public"]
---
# Rust Ownership and Borrowing Cheatsheet

The [Brown Revision](https://rust-book.cs.brown.edu) of the [original](https://doc.rust-lang.org/book/) Rust Book has an interesting chapter on [Fixing Ownership Errors](https://rust-book.cs.brown.edu/ch04-03-fixing-ownership-errors.html). 

It includes a number of examples that I attempt to explain here. For each, I've tried to succinctly articulate:
1) the situation, 
2) compiler rules that the program violates, 
3) undefined behaviour the compiler is trying to protect against, and 
4) potential solutions.

### Unsafe Program: Returning a Reference to the Stack

**Situation**: A variable in a function body owns a heap allocation and we return a reference to that variable.

**Code Example**: 
```rust
fn return_a_string() -> &String {
    let s = String::from("Hello world");
    &s
}
```

**Borrow checker violation**: Data must outlive its reference. This is a corollary to the Pointer Safety Principle which states "data should never be aliased and mutated at the same time". In this example, we create an alias to the variable `s`, but then mutate the data by deallocating the memory when the function returns.

**Potential undefined behaviour**: Dangling pointer.

**Solutions**: There are four ways around it:
- Returning the variable itself instead of a reference to the variable (i.e. transfer ownership from the function stack frame to the calling stack frame).
- Return a string literal (i.e. heap allocation never occurs).
- Return a smart pointer (i.e. heap is not deallocated when function returns).
- Have calling function provide a reference to a pre-allocated section of the heap, and then populate it in the function body (i.e. the function never owns the heap allocation).

### Unsafe Program: Not Enough Permissions on Function Parameters

**Situation**: Function receives an immutable reference (as an argument) and then wants to mutate the data.

**Code Example**: 
```rust
fn stringify_name_with_title(name: &Vec<String>) -> String {
    name.push(String::from("Esq."));
    let full = name.join(" ");
    full
}
```

**Borrow checker violation**: The function doesn't have the correct permissions (i.e. write permissions) on the data. 

**Potential undefined behaviour**: It would be unsafe because it might invalidate references in the calling context. For example, in the context calling `stringify_name_with_title` there may be a reference to an element in the vector (not the vector itself). If you push a string onto vector, it might cause Rust to reallocate data to a larger block of memory, thus dangling any references to previous elements.  

**Solutions**: We could change the function type signature to request either ownership or a mutable reference, but this is a less intuitive API. A better solution is to clone the data, mutate the data however we need, and then return the clone. 

### Unsafe Program: Aliasing and Mutating a Data Structure

**Situation**: Function is passed a mutable reference, uses it to create an alias, and then tries to mutate it before the end of the lifetime of the alias. This is similar to the previous example, except that the loss of permissions occurs in the same stack frame.

**Code Example**: 
```rust
fn add_big_strings(dst: &mut Vec<String>, src: &[String]) {
    let largest: &String = dst.iter().max_by_key(|s| s.len()).unwrap();
    for s in src {
        if s.len() > largest.len() {
            dst.push(s.clone());
        }
    }
}
```

**Borrow checker violation**: Either we can have unlimited immutable references, or a single mutable reference. If a variable has write permissions, and then gets borrowed by an alias, it will lose its write permissions because can't have both a mutable and immutable reference at the same time. Like the previous example, we've violated the Pointer Safety Principle. But unlike the previous example, instead of trying to mutate a reference that doesn't have write permission, here we're trying to mutate the owner which has temporarily lost its write permission. 

**Potential undefined behaviour**: Like in the previous example, by pushing data into `dst`, we could deallocate data, thus invalidating the immutable reference `largest.`

**Solutions**: The solution is that if you have to create an alias, shorten its lifetime so that the owner gets back write permissions before mutating the data.

### Unsafe Program: Copying vs Moving

**Situation**: A reference tries to move ownership (by dereferencing).

**Code Example**: 
```rust
let v: Vec<String> = vec![String::from("Hello world")];
let s_ref: &String = &v[0];
let s: String = *s_ref;
```

**Borrow checker violation**: Only owners can move ownership (and references aren't owners). Because this reference has only borrowed the data, it doesn't have permission to **move** ownership to another variable.[^move]

[^move]: Could there exist a feature that lets references move ownership without permitting multiple owners? For example, the reference could remove permissions of original owner after moving ownership to a new variable.

**Potential undefined behaviour**: In the above case it could lead to a double-free. If you let `s` take ownership of `v[0]`, then now you have two variables that think they own `v[0]`, namely `v` and `s`. At the end of the stack frame, both will try to free the heap allocation, leading to undefined behaviour.

**Solutions**: You can either:
1) Avoid moving the variable (i.e. avoid issue altogether).
2) Take ownership before trying to transfer it (i.e. will only free once since there will now only be one owner),
3) Implement `Copy()` so that we clone it and there are two allocations on the heap (i.e. will still free twice but not free the same block of memory).

### Safe Program: Mutating Different Tuple Fields

**Situation**: Borrowing one element of a tuple and then trying to mutate another element of a tuple. This is only an issue if the compiler loses track of the borrowing path (e.g. through a function) and thus can't tell that the program is trying to access a separate field. 

**Code Example**: 
```rust
fn get_first(name: &(String, String)) -> &String {
    &name.0
}

fn main() {
    let mut name = (
        String::from("Ferris"), 
        String::from("Rustacean")
    );
    let first = get_first(&name);
    name.1.push_str(", Esq.");
    println!("{first} {}", name.1);
}
```

**Borrow checker violation**: If the compiler can't tell which field specifically is borrowed, the entire tuple gets borrowed as a conservative safety measure. `name` loses write permissions, to avoid a situation where there is an alias (via `first`) and a mutation (via `name`). Thus `name.1.push_str()`, which tries to write to a variable that's lost its write permission, is caught by the compiler.

**Potential undefined behaviour**: In this case, since we know for sure we would be mutating a different field in the tuple, there would be no undefined behaviour! Hence why the program is safe. However, if you were to allow aliasing and mutations of the same tuple field, it would violate the Pointer Safety Principle, which could lead to data races, dangling pointers, or other unexpected results.

**Solutions**: The easy solution in this case is to move the code out of the function so the compiler knows which field is being borrowed.

### Safe Program: Mutating Different Array Elements

**Situation**: When *mutably* borrowing an element of an array, the entire array loses read-write permissions (when *immutably* borrowing an element in an array, the entire array keeps read permissions). 

**Code Example**: 
```rust
let mut a = [0, 1, 2, 3];
let x = &mut a[0];
let y = &a[1]; // Immutable reference within lifetime of mutable reference x.
*x += 1;
```

**Borrow checker violation**: Trying to read from an array that has lost its read permission.

**Potential undefined behaviour**: In the example above, we know the program won't cause undefined behaviour since it's reading and mutating two distinct elements. However, the compiler doesn't know that, so it won't compile. If, in another situation, there was both an alias and a mutation of the same element, then potential undefined behaviour includes data races or iterator invalidation.

**Solutions**: Can use a special function called `.split_first_mut()` that is implemented using unsafe rust.

### Summary

 To summarize, we've covered a few rules for ownership and borrowing:
 1) Each value has only one "owner",
 2) At a given time, there can either be many immutable references or one mutable reference (including the owner),
 3) Data must outlive all of its references,
 4) Only owners can move ownership (references cannot).

 In terms of potential undefined behaviour, the common ones include:
 1) Dangling pointers from data being deallocated (data not outliving reference),
 2) Dangling pointers from data being reallocated (mutating data within the lifetime of an alias),
 3) Double free (allowing multiple owners),
 4) Data races (also mutating data within the lifetime of an alias),
 5) Iterator invalidation (mutating arrays within the lifetime of an alias).
