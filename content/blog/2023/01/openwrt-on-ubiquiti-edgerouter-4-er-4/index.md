---
title: "OpenWrt on Ubiquiti EdgeRouter 4 (ER-4)"
date: "2023-01-03"
tags: 
  - "edgerouter"
  - "networking"
  - "openwrt"
  - "router"
  - "tech"
  - "ubiquiti"
---

Mid-2021 I noticed it seems like Ubiquiti has quietly discontinued their EdgeRouter lines (they're increasingly sold out, there haven't been firmware updates in a while), and since I like to keep my devices' firmware up to date I became a little concerned.

In looking for solutions I eventually found I could extend the life of my EdgeRouter 4, which is otherwise pretty solid hardware, by installing OpenWrt. Luckily I already had a USB-to-serial cable on hand, and with that it was pretty straightforward, following the [OpenWrt project's instructions for EdgeRouter devices](https://openwrt.org/toh/ubiquiti/edgerouter).

I used [KiTTY](https://www.9bis.net/kitty/), with serial speed set to 115200 per the instructions ([and per Ubiquiti](https://help.ui.com/hc/en-us/articles/205202630-EdgeRouter-How-to-Connect-to-Serial-Console)).

I encountered one hiccup: where the OpenWrt instructions suggest you mount the USB device after first booting in RAM, I found I could not access the USB device to mount it.

The solution: at this point, you basically have a full OpenWrt instance running in RAM, so you can have your WAN port connected to your internet access, connect another computer to a LAN port for a 192.168.1.x IP, do `opkg update; opkg install openssh-sftp-server` — and then use `scp` to transfer the sysupgrade file to /tmp/

After that, it's been pretty straightforward using OpenWrt on the EdgeRouter 4, and fun to have more control over this device than I ever had with Ubiquiti's custom OS!
