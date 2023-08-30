---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Debugging Python in vim"
pubDate: "2023-08-29"
author: "MimmyJau"
description: "Tools for debugging Python in vim."
tags: ["debugging", "python", "vim"]
---

This is a collection of processes and tools I use to debug Python in vim.

> tl;dr: make navigation as frictionless as possible, whether that be source code, library code, documentation, historical code (using git), etc.

### go to definition

I use the [`dense-analysis/ale`](https://github.com/dense-analysis/ale) plugin with `pyright` as a language server to jump to definitions and references.

The built-in commands are `:ALEGoToDefinition` and `:ALEFindReferences` but I've remapped them to `<C-]>` and `<C-^>` respectively.

```vim
" To remap <C-]> to find definition and <C-^> to find references using Ale 
" Source: https://github.com/dense-analysis/ale/issues/1645#issuecomment-396414319
function ALELSPMappings()
    let l:lsp_found=0
    for l:linter in ale#linter#Get(&filetype) | if !empty(l:linter.lsp) | let l:lsp_found=1 | endif | endfor
    if (l:lsp_found)
        nnoremap <buffer> <C-]> :ALEGoToDefinition<CR>
        nnoremap <buffer> <C-^> :ALEFindReferences<CR>
    else
        silent! unmap <buffer> <C-]>
        silent! unmap <buffer> <C-^>
    endif
endfunction
autocmd BufRead,FileType * call ALELSPMappings()
```
### linter

I use the [`dense-analysis/ale`](https://github.com/dense-analysis/ale) plugin with `pylint` to catch any other small errors.

### tabbing

Related to code navigation, I use `vim-buftabline` to open multiple tabs and jump between them. This feature is provided by most IDEs, but requires a bit of config to get right in vim.

I've re-mapped `<C-p>` and `<C-n>` to jump to the previous and next tabs, respectively, and also `\ [number]` to jump to a tab by its number. Here is my `.vimrc` to make this possible.

``` vim
" Taken from https://github.com/ap/vim-buftabline
set hidden                  
nnoremap <C-N> :bnext<CR>   " For jumping to next buffer
nnoremap <C-P> :bprev<CR>   " For jumping to prev buffer
nnoremap <C-X> :bd<CR>      " For closing buffer

" Taken from :help buftabline
let g:buftabline_numbers = 2    " Show number next to buffer tab
" Type '\ [number]' to jump to buffer
nmap <leader>1 <Plug>BufTabLine.Go(1)
nmap <leader>2 <Plug>BufTabLine.Go(2)
nmap <leader>3 <Plug>BufTabLine.Go(3)
nmap <leader>4 <Plug>BufTabLine.Go(4)
nmap <leader>5 <Plug>BufTabLine.Go(5)
nmap <leader>6 <Plug>BufTabLine.Go(6)
nmap <leader>7 <Plug>BufTabLine.Go(7)
nmap <leader>8 <Plug>BufTabLine.Go(8)
nmap <leader>9 <Plug>BufTabLine.Go(9)
nmap <leader>0 <Plug>BufTabLine.Go(10)
```

### navigating src

In some cases, you want to find a specific file. There are three ways of searching for a file:
1) by filename, 
2) by text in a file, 
3) by navigating the directory structure itself.

To search by filename or text, I use `junegunn/fzf.vim`. The `:Files` command lets me search by filename and the `:Rg` command lets me search the code itself.

Note, that fuzzy finder will recursively search child directories but not any parent directories. Therefore, I'll typically open `vim` in the root directory of my project (to make fuzzy finder more effective) and then use `:Files` to open up whatever file I need.

To navigate the directory structure itself, `vim` comes with the default explorer `:e <directory>` or `:e .`.

However, a common navigation problem I have is I'll jump to a file belonging to a third-party library (using `:ALEGoToDefinition`) and want to look at other files in the vicinity. Running `:e .` will open the explorer in the project root, not the directory of the current file. To solve this problem, use `:Ex`.


### other vim commands

In the default vim explorer (via `:Ex` or `:e .` or `:e <path>`), use `jk` to move up and down, `<enter>` to step into a directory and `-` to step out. You can also search with `/` to quickly jump to the file you want.

In vim proper, besides the basic commands, there is also `{` and `}` to jump between empty lines, `zz`, `zt`, and `zb` to scroll without moving the cursor, and `<C-o>` to jump back to the last location.

`<C-o>` can also be used in the vim explorer and can let you jump between buffers.

The opposite of `<C-o>` is `<C-i>`.


### pdb

Setting a `breakpoint()` in Python is super straightforward. And using the debugger in the terminal has been pretty easy for me so far. The main commands I use are:

- `where` which prints out the call stack  
- `ll` which prints out nearby source code  
- `<expression>` or `p <expression>` which prints the value of any expression, variable, etc.  
- `n` to go to the next line of code  
- `s` to step into the next layer of the call stack  j
- `continue` to run the code until the next `breakpoint()`  

I haven't had to use many other commands (so far).

The trickier issue tends to be knowing where to set the `breakpoint()`, which is why code navigation (discussed above) is so important. I will often jump to library source code and set `breakpoint()`'s to understand how they work. 

### altering library code

Messing around with library code (e.g. adding `breakpoint()`'s) is great for understanding how they work, but Python doesn't give you an easy way of "resetting" library code back to its defaults (especially since library code in `venv` is typically `.gitignore`d).

So far, the easiest way I've found around this is to:
1) make sure your `requirements.txt` file is up to date,  
2) nuke `venv`, and 
3) re-install `venv` from scratch using `pip install -r requirements.txt`. 

It's not the cleanest solution, but it's not really difficult either. 

### git

The more comfortable I get with git, the more comfortable I get messing around with code (and the more comfortable I get messing around with code, the more comfortable I get debugging issues).  

As a vim user, I've found `tpope/vim-fugitive` to be **SUPER** useful for navigating different commits and branches all while staying within vim. It replaces all `git <command>` commands with `:G <command>`. Also by default it splits the screen horizontally (which I don't love), so I use `:vert bo G <command>` instead.

You can also just run `:G` or `:vert bo G` to open up the "homepage" of fugitive. From there you can selectively stage and commit code by highlighting text and pressing `-`.

A few other helpful git commands include (all of these can be done in fugitive replacing `git` with `:G`):
- `git stash` and `git stash pop` for saving current changes before jumping around,
- `git blame` for finding a commit that added a line of code (good for seeing context like the other changes and the commit messages),
- `git log --graph --oneline` or `git log --graph --oneline --all` which I've remapped to `git lol` and `git lola` respectively,
- `git rebase -i` for doing all kinds of things inside a nice UI.

### documentation

Using documentation is often easier said than done. It takes time to ramp up on a library's documentation before it becomes "easy" to use. 

One thing I've found useful (and fun) is if you find a solution to a problem outside the docs (e.g. StackOverflow), try and reverse-search where you would have found that same solution if you knew the documentation really well. 

This will teach you how to navigate any particular documentation, making it easier for when you inevitably come across a bug that requires you to RTFM.

### reading source code

The "last resort" for debugging dependencies is always the source code itself. Reading source code is also much easier said than done.

Like with documentation, a fun exercise to do is if I find a solution to a problem outside the source (e.g. in the docs), I will sometimes reverse-search where I would have found the solution in the source code. 

This takes time and effort, and might not be absolutely critical in the short-term, but in the long-term, having a better working model of your dependencies becomes increasingly useful when you inevitably come across more esoteric and complex bugs. 

### summary

It seems like the key themes for debugging are:
- ease of navigation (e.g. pyright, fzf, `:Ex`, etc.)
- static analysis (e.g. pylint)
- debugger (e.g. pdb)
- revertibility  (e.g. git, nuking `venv`, etc.)
- documentation

In my experience with Python so far, making navigation easier has had the biggest ROI on debugging issues and understanding software. 

I've not used VSCode or other IDEs, so I don't know how elegantly they solve these problems (I would guess they do it pretty well). One day I'll get around to trying them out...
