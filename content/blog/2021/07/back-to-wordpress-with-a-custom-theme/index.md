---
title: "Back to WordPress, with a custom theme"
date: "2021-07-11"
tags: 
  - "blog"
  - "coding"
  - "development"
  - "fun"
  - "syntaxhighlighting"
  - "tech"
  - "web"
---

Ages ago, in the era of blogs, I used WordPress for a few years, but at the time I was too convinced that programming was too hard for me to properly learn enough web development to really customize things, and eventually I stopped writing as other interests drew my attention.

Here's the boring story of how I ended up all the way back at WordPress after learning enough programming that nothing really scares me anymore...

Last year I was thinking I'd like to write again, or at least just keep a stash of recipes and programming notes. Over the years I've learned enough JavaScript to be dangerous, and I wanted it to be fast and simple, so I designed a static site built with [webpack](https://webpack.js.org/), and tacked on [Write Freely](https://writefreely.org/) at a subdomain, and called it a day. [I even wrote about it](https://73k.us/blog/new-front-page-internet-home).

But I didn't really like having a separate vehicle for writing, with a different style and feel. So I wanted to integrate the blog and refine the front page. I'd been having fun with Elixir & Phoenix, so I [built my own Phoenix project using markdown blog posts](https://73k.us/blog/blog-incorporated-2021), including [an RSS feed alongside Phoenix LiveView](https://73k.us/blog/rss-feed-when-using-elixir-phoenix-liveview), and I could even [update content by pushing new git commits](https://73k.us/blog/elixir-phoenix-automated-deployment-gitea-systemd-git).

Fantastic! But I kept missing having a convenient interface for writing. After researching the state of things and considering options, I decided it was time to go back home to WordPress, and simply port my site design to a WordPress theme.

Thanks to the great [WP Tailwind](https://github.com/cjkoepke/wp-tailwind) project, I was able to get started. I forked that, updated the npm modules, swapped out Tailwind for Bootstrap 5, etc. Behold [wp-73k](https://github.com/apiontek/wp-73k), the theme for this site. Unlike WP Tailwind, it's not well suited as a starter theme, since I've added functions and filters for my own purposes, but the adept looking for a webpack 5, Bootstrap 5 base could still use it as a starting point.

One thing I was happy to get working is server-side code syntax highlighting, thanks to the great [Syntax-highlighting Code Block](https://github.com/westonruter/syntax-highlighting-code-block) plugin. Unfortunately, it doesn't handle inline code, which my Phoenix project had, and uses [highlight.js](https://highlightjs.org/) styling instead of Pygments/chroma — but, since it _does_ use highlight.js styling, I was able to bring that in to highlight any inline code tagged with a "to-highlight" class, which isn't idea, but is good enough for my purposes.

I'm sure there's still more issues to iron out and things to do. I haven't decided if I want to support comments, pingbacks, etc, and I haven't tested out image/media embeds or decided if I want fancy plugins. Plenty of time for all that, though!

Anyway, here's hoping I get some more writing and recipes done with this new setup… 🙄😅
