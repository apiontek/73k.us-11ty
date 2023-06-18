---
title: "RSS Feed When Using Elixir Phoenix LiveView"
date: "2021-04-07"
tags: 
  - "coding"
  - "deprecated"
  - "development"
  - "elixir"
  - "feed"
  - "liveview"
  - "phoenix"
  - "routing"
  - "rss"
  - "tech"
---

While [re-implementing my website in elixir/phoenix](https://73k.us/blog/blog-incorporated-2021), I wanted to include an RSS feed for the blog posts. Luckily I found pretty much everything I needed in Daniel Wachtel’s [Building an RSS Feed with Phoenix](https://danielwachtel.com/phoenix/building-rss-feed-phoenix) post, but since I’m making use of LiveView, I ran into one hiccup — errors about a missing `root.xml` layout!

LiveView changes how Phoenix handles layouts — there’s a `root.html.leex` layout, and then for live views, a `live.html.leex` sub-layout, and for regular controller views, an `app.html.eex` sub-layout.

Without LiveView, Daniel’s controller directive `plug :put_layout, false` would be enough, but with LiveView, Phoenix is still looking for the _root_ layout template, which for my `index.html` would be `root.xml` … what to do?

One option would be to create a whole separate router pipeline to skip the `plug :put_root_layout, {Home73kWeb.LayoutView, :root}` directive. It would work, but is a heavier approach.

But luckily, there’s a new [put\_root\_layout/2](https://hexdocs.pm/phoenix/Phoenix.Controller.html#put_root_layout/2) that we can leverage like so:

```
defmodule YourAppWeb.RSSController do
  use YourAppWeb, :controller
  plug :put_layout, false
  plug :put_root_layout, false

  #...
end
```

With this in place, the rss xml is served plain, just like we want.
