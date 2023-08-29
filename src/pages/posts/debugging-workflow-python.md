---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Debugging Python in vim"
pubDate: "2023-08-29"
author: "MimmyJau"
description: "Tools for debugging Python in vim."
tags: ["debugging", "python", "vim"]
---

This is a collection of processes and tools I use to debug in Python in vim.

### Go to definition:

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
### Linter:

I use the [`dense-analysis/ale`](https://github.com/dense-analysis/ale) plugin with `pylint` to catch any other small errors.

### Tabbing:

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

### Navigating src:

In some cases, you want to find a specific file. In this case, being able to search by filename, search by text in a file, or navigating the file structure is important.

To search by filename or text, I use `junegunn/fzf.vim`. The `:Files` command lets me search by filename and the `:Rg` command lets me search the code itself.

Note, that fuzzy finder will recursively search child directories but not any parent directories. Therefore, I'll typically open `vim` in the root directory of my project to make fuzzy finding more effective.

A common navigation problem is I'll jump to a definition in a library and want to look at other files in the vicinity. To solve this problem, vim gives us the `:Ex` command that opens the default vim explorer in the directory of the current file.

### pdb:

Setting a `breakpoint()` in Python is super straightforward. And using the debugger in the terminal has been pretty easy for me so far. The main commands I use are:

- `where` which prints out the call stack  
- `ll` which prints out nearby source code  
- `<expression>` or `p <expression>` which prints the value of any expression, variable, etc.  
- `n` to go to the next line of code  
- `s` to step into the next layer of the call stack  j
- `continue` to run the code until the next `breakpoint()`  

I haven't had to use many other commands other than these (so far).

The trickier issue tends to be knowing where to set the `breakpoint()`, which is why code navigation (discussed above) is so important. I will often jump to library source code and set `breakpoint()`''s in order to understand how they work. 

### Altering library code

Messing around with library code (e.g. adding `breakpoint()`'s) is great for understanding how they work, but Python doesn't give you an easy way of "resetting" library code back to its defaults (especially since library code in `venv` is typically `.gitignore`d).

So far, the easiest way I've found around this is to :
1) make sure your `requirements.txt` file is up to date,  
2) nuke `venv`, and 
3) re-install `venv` from scratch using `pip install -r requirements.txt`. 

It's not the cleanest solution, but it's not really difficult to do either. 

### git

The more comfortable I get with git, the more comfortable I get messing around with code (and the more comfortable I get messing around with code, the more comfortable I get debugging issues).  

As a vim user, I've found `tpope/vim-fugitive` to be **SUPER** useful for navigating different commits and branches all while staying within vim. It replaces all `git <command>` commands with `:G <command>`. Also by default it splits the screen horizontally which I don't love, so I use `:vert bo G <command>` instead.

A few helpful commands include:
- `git stash` and `git stash pop` for saving current changes before jumping around
- `git blame` for finding a commit that added a line of code (good for seeing context like the surrounding code and commit messages)
- `git log --graph --oneline` or `git log --graph --oneline --all` which I've remapped to `git lol` and `git lola` respectively

### documentation

Using documentation is often easier said than done. It takes time to ramp up on a library's documentation before it becomes "easy" to use. 

One thing I've found useful (and fun) is if you find a solution to a problem outside the docs, try and reverse-search where you would have found that same solution if you knew the documentation really well. You'll get more familiar with the docs so that when you inevitably come across a situation that isn't on StackOverflow or some blog, you can hopefully find the answer in the documentation.

### reading source code

When the abstraction in the documentation doesn't help you solve a problem, the "last resort" is to read the actual source code of whatever library / framework / tool you're using. 

Similarly to with documentation, if I find a solution to a problem outside the source, I will sometimes reverse-search where I would have found the solution in the source code. 

This takes time and effort, and might not be absolutely critical in the short-term, but in the long-term, having a better working model of your programs becomes increasingly useful when you inevitably come across more esooteric and complex bugs. 

