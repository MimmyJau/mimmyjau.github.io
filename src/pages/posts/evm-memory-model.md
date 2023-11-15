---
layout: ../../layouts/MarkdownPostLayout.astro
title: "EVM memory model"
pubDate: "2023-11-15"
author: "MimmyJau"
description: "Understanding storage and memory in Solidity."
tags: ["solidity", "ethereum", "memory", "learning in public"]
---

One tricky thing about learning Solidity is the EVM memory model, in particular, the distinction between `memory` and `storage` memory.

First, `memory` is what we typically think of when we think of memory in C or C++. In other words,
- data does not persist at the end of the execution of the program,
- values for basic types are pushed onto a stack frame (e.g. function, block, etc.),
- if you need space for an array or struct, you can allocate space for it.

On the other hand, `storage` is memory that will persist after the execution of the program. In other words, `storage` is the equivalent to a database or an external file, except it doesn't require an API call and is built-in directly to Solidity.

When you declare a variable, the compiler needs to know  whether it is a `storage` variable or a `memory` variable. *Where* and *how* you declare the variable determines whether it's one vs. the other (will cover in the last section).

### Storage

The most important things to know about storage are as follows:
- `storage` stores data in a key-value database (as opposed to a relational database).
- Both the key and the value are 32 bytes.
- The data is stored contiguously.
- If possible, the EVM will attempt to pack multiple values into the same slot (i.e. if the types are smaller than 32 bytes).
- When packing multiple items into a slot, the items are stored in lower-order bits first.
- Structs and arrays always occupy a new slot (even if space remains in a previous slot).
- Values after structs and arrays always occupy a new slot (even if space remains in the previous slot).
- For dynamic-sized types (i.e. mappings or dynamic arrays), the main slot is a placeholder that doesn't contain the actual data. Instead the data is at another location that results from hashing the index of the main slot. Because this latter key can be calculated deterministically, you don't need to hold a reference in the style of traditional memory-managed languages like C or C++.

#### Fixed-size types

Example of fixed-size types include `uint256`, `int8`, `bool`,  and `structs`. To illustrate, let's say you had the following contract.

```solidity
contract FixedStorage {
	uint256 x1;
	uint8 y1;
	uint8 y2;
	int8 y3;
	int8 y4;
}
```

Since the first variable `x1` is of type `uint256`, it's size is 32 bytes. Thus the first slot in storage will be entirely occupied by `x1`. On the other hand, each of `y1`, `y2`, `y3`, and `y4` are only a single-byte, thus all four of their values are packed into the next slot (with another 28-bytes of space remaining).

However, suppose you had this contract instead.

```solidity
contract FixedStorage {
	uint8 y1;
	uint256 x1;
	uint8 y2;
	int8 y3;
	int8 y4;
}
```

`y1` will occupy the first slot, leaving 31-bytes of available storage. The next variable, `x1` is 32 bytes, and thus cannot be packed into the remaining space of the first slot. Therefore it will occupy a new second slot. The remaining variables `y2`, `y3`, and `y4` will then be packed into a third slot.

The takeaway here is that when it comes to `storage`, the order in which variables are declared matters.

#### Dynamic-sized types (i.e. mappings and dynamic arrays)

> Note: This does not apply to fixed-sized arrays whose lengths are known at compile time.

When storing dynamic arrays and mappings, we cannot store the data in the same way as for the fixed-sized types, since their size can grow and shrink dynamically. Instead, we reserve the 32-byte slot—for the length if it's an array, empty if it's a mapping—and store the actual data at a different location.

##### Arrays

For example, say a dynamic array ends up in storage slot `15`, then the length of the array is stored in the main slot. The data for the array elements is then stored at location `keccak256(15)`. In other words, the first element in the array is at key `keccak256(15)`, the second element would try to be packed into the previous slot, but if it doesn't fit, would occupy a new slot at `keccack256(15) + 1`, and so on and so forth, continuing contiguously under the same rules as above.

##### Mappings

Say a mapping ends up at storage slot `203`, the slot is reserved and remains empty. When a key-value pair is added to the mapping, the location of the value in `storage` is determined by the following formula: `keccak256(h(k) . p)`, where `p` is the storage slot (i.e. `203` in this example), `k` is the key in the mapping, `.` is the concatenation operator, and `h()` is a function that will do nothing if `k` is of type `bytes` or `string`, or pad `k` to 32 bytes otherwise.

##### Bytes and Strings

If a `bytes` or `string` is less than 31 bytes, the data is stored directly in the slot. The 31 bytes of data are stored in the higher-order bytes (left-aligned or big-endian), while the first, lower-order byte is reserved for the length of the `bytes` or `string`. For reasons explained later, the length is stored as `length * 2`.

If a `bytes` or `string` is greater than 32 bytes, it is stored in the same way as dynamic arrays. The root slot now holds the length of the bytes and is stored as `length * 2 + 1`.

Why `length * 2` and `length * 2 + 1` instead of just `length`? Multiplying by `2` in the former case ensures that the value is always even (i.e. lowest order bit is `0`). Multiplying by `2` then adding `1` in the latter case ensures that the value is always odd (i.e. the lowest order bit is `1`). As a result, by examining the lowest order bit, we can immediately determine if the data is stored in the slot itself or in another location.

Note, we don't have to worry about overflow. If the length is stored in the single byte (as in the former case), the length of the data will always be less than 32 bytes. Thus at most the value will be `31 * 2 = 62` which is well under `256`, or the maximum value that can be stored in a byte. If the entire 32-byte slot stores the length of the string, then similar to what we had with dynamic arrays, the length would have to be greater than 2^255 bytes, which is an extraordinarily large number.

### Memory

If `storage` is a key-value database, `memory` is a byte-array. Each scope (e.g. function, block, etc.) gets its own `memory` with the following rules.
- Memory is stored contiguously
- Elements always occupy their own 32-byte slot (even if they're smaller than 32 bytes)
- The first four 32-byte slots are reserved


### Declaring `storage` vs. `memory`

*WHERE* you declare variables and *HOW* you declare them determines whether or not a value is in `storage` or `memory`. In other words,
- If you declare any type in the outermost scope of a contract, then it is by default `storage` (you don't need to specify).
	- Note that ALL storage variables need to be declared here, they cannot be declared anywhere else.
- If you are declaring a primitive type (e.g. not an array or struct) in a local scope, then it is by default `memory` (you don't need to specify).
- If you are declaring an array or a struct inside a local scope, then you must specify whether it is `memory` or `storage`.
	- If you specify `memory`, it will initialize the object in `memory`.
	- If you specify `storage`, it will declare in `memory` a *reference* to an array or `struct` in `storage`. 
