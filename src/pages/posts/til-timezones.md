---
layout: ../../layouts/MarkdownPostLayout.astro
title: "TIL: Timezone conundrum"
pubDate: "2023-08-03"
author: "MimmyJau"
description: "What time of day maximizes the number of people around the world experiencing the same date?"
tags: ["geography", "js", "TIL"]
---
`+14:00` is the earliest timezone in the world—they are the first to celebrate New Year. `-12:00` is the latest—they are the last to celebrate. This means there are 26 time zones in total (not including half time zones). 

In other words, **there is no time of day during which everyone on Earth is experiencing the same date**. 

Why is this relevant? For each of my blog posts I need to provide a date. But since dates are tz-aware in JS, people reading in different time zones may see different dates. For some reason, I don't want that.

In order to have my blog display the same date to as many people as possible, I've chosen to suffix each of my dates with `T23:59:59+13:00`, which means 11:59pm and 59 seconds in TZ [`+13:00`](https://en.wikipedia.org/wiki/List_of_UTC_offsets#UTC+13:00,_M%E2%80%A0), the second-to-earliest time-zone in the world.

Why `+13:00`? In my rough approximation, this creates the largest coverage of people who would see the same date as me, covering almost all of Oceania, Asia, Europe, North America and even [Hawaii](https://www.timeanddate.com/worldclock/converter.html?iso=20230804T105900&p1=4679&p2=tz_hast).

The only three time zones that are not covered are [`-11:00`](https://en.wikipedia.org/wiki/List_of_UTC_offsets#UTC%E2%88%9211:00,_X),  [`-12:00`](https://en.wikipedia.org/wiki/List_of_UTC_offsets#UTC%E2%88%9212:00,_Y), and [`+14:00`](https://en.wikipedia.org/wiki/List_of_UTC_offsets#UTC+14:00,_M%E2%80%A0), which include:
- America Samoa (2023 population estimate: 44,620), 
- Niue, a small, self-governing island in a free association with New Zealand (2021 population estimate: 1,937), 
- Some mostly-uninhabited, [US-affiliated islands](https://en.wikipedia.org/wiki/United_States_Minor_Outlying_Islands) in the Pacific, and 
- The Line Islands, the easternmost islands of Kiribati, which make up less than 10% of Kiribati's total population.[^Kiribati] 

[^Kiribati]: Kiribati has a population of 121,388 (2021 population estimate), meaning the Line Islands has a population below 12,139.
