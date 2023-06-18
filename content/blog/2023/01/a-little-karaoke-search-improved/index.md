---
title: "A little karaoke search, improved"
date: "2023-01-10"
tags: 
  - "coding"
  - "development"
  - "portfolio"
  - "projects"
  - "tech"
  - "webdesign"
---

My partner occasionally hosts some karaoke, and lately has been using [software from OpenKJ](https://openkj.org/), which is pretty nifty. The creator of that project released, some time back, a request service you can pay to use — it lets you upload your song library from the main software, and then lets people search and request songs while you're hosting.

They also released a little standalone version of this that you can host yourself, which is right up my alley, so I've done that. However, it hasn't been updated since 2018, and while the API hasn't changed, the interface is a little wonky and not great on mobile. So for a while, I've been meaning to fork it and improve it...

Well, the pieces finally all fell into place and I had a fun little time trying to keep things reasonably simple while implementing what I wanted:

- Search is now active; results update as you type

- Search is available always, even when song requests are closed

- Song requests handled in a modal dialog

- Search queries trim more whitespace

- styles & fonts changed to my preference

- css & js optimized (there's so little, this was a little silly, but it made me happy)

Much of the above was enabled by [new.css](https://newcss.net/) and [htmx](https://htmx.org/), projects I had fun using for the first time.

You can see my version live at [sing.73k.us](https://sing.73k.us/), and [my fork's repository on github](https://github.com/apiontek/StandaloneRequestServer).
