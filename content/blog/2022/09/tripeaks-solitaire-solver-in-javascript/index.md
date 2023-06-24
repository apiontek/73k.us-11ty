---
title: "Tripeaks Solitaire Solver in JavaScript"
date: "2022-09-14"
tags: 
  - "coding"
  - "development"
  - "game"
  - "solitaire"
  - "solver"
coverImage: "tripeaks-preview.png"
---

{% image "./tripeaks-preview.png", "A preview of a tripeaks card game layout." %}


I've created an online [Tripeaks Solver](https://tripeaks.73k.us/).

This is based on the excellent work done by [IgniparousTempest on Github](https://github.com/IgniparousTempest/javascript-tri-peaks-solitaire-solver) — see [his demo here](https://igniparoustempest.github.io/tri-peaks-solitaire-solver/).

I made some changes to support new features and built a new web interface. This solver can help you along with incomplete games and provide a "best solution" for unsolvable games. It also shouldn't lock up on unsolvable or difficult games, providing progress feedback while waiting, since it can still take several minutes to do its work if the game isn't easy.

I hope this helps some people. [Source is available at Github](https://github.com/apiontek/tripeaks-solitaire-solver-js-73k), as well as [my Gitea host](https://git.73k.us/adam/tripeaks-solitaire-solver-js-73k).
