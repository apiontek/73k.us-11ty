---
title: "Caddy on OpenWrt with access to LuCI"
date: "2023-01-03"
tags: 
  - "caddy"
  - "luci"
  - "networking"
  - "openwrt"
  - "router"
  - "tech"
  - "webserver"
---

After getting [OpenWrt working on my EdgeRouter 4](https://73k.us/blog/openwrt-on-ubiquiti-edgerouter-4-er-4), since I've grown accustomed to the flexibility & ease of [Caddy](https://caddyserver.com/) in other situations, I wondered if I could use it in this case. Turns out, yes! Especially thanks to [Siger Yang's notes](https://sigeryang.net/2022/02/12/caddy-openwrt-luci/) and this [cgi-ubus script](https://github.com/yurt-page/cgi-ubus). I had to make some adjustments on top of what Yang describes, so here's what worked for me:

Note: I have extra storage mounted at `/mnt/sda1`; adapt as needed.

First, on the ER-4, none of the [MIPS downloads](https://caddyserver.com/download) worked for me, so I had to build it myself:

```
opkg install git-http golang
mkdir /mnt/sda1/caddy-build
cd /mnt/sda1/caddy-build
git clone "https://github.com/caddyserver/caddy.git"
echo 'export GOPATH=/mnt/sda1/go' | tee -a /root/.shinit
echo 'export PATH=$PATH:$GOROOT/bin:$GOPATH/bin' | tee -a /root/.shinit
. /root/.shinit
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
cd /mnt/sda1/caddy-build/caddy
xcaddy build v2.6.2 --with github.com/aksdb/caddy-cgi/v2@v2.2.1=/mnt/sda1/caddy-build/caddy-cgi
cp ./caddy /usr/bin/caddy
caddy version
```

Having built it, and confirmed it runs with that last `caddy version` command, I did the following to stop & disable uhttpd, and set up caddy:

```
service uhttpd stop
service uhttpd disable
mkdir -p /etc/caddy/conf; mkdir /etc/caddy/data
echo 'XDG_CONFIG_HOME=/etc/caddy/conf' | tee -a /etc/caddy/.env
echo 'XDG_DATA_HOME=/etc/caddy/data' | tee -a /etc/caddy/.env
wget https://raw.githubusercontent.com/yurt-page/cgi-ubus/master/ubus.sh -O /etc/caddy/ubus.sh
chmod +x /etc/caddy/ubus.sh
nano /etc/caddy/Caddyfile
```

The Caddyfile contents that worked for me:

```
{
	order cgi before respond
}

localhost, 192.168.1.1, router, router.home {
	tls internal
	root * /www
	file_server

	cgi /cgi-bin/cgi-backup* /www/cgi-bin/cgi-backup {
		script_name /cgi-bin/cgi-backup
	}
	cgi /cgi-bin/cgi-download* /www/cgi-bin/cgi-download {
		script_name /cgi-bin/cgi-download
	}
	cgi /cgi-bin/cgi-exec* /www/cgi-bin/cgi-exec {
		script_name /cgi-bin/cgi-exec
	}
	cgi /cgi-bin/cgi-upload* /www/cgi-bin/cgi-upload {
		script_name /cgi-bin/cgi-upload
	}
	cgi /cgi-bin/luci* /www/cgi-bin/luci {
		script_name /cgi-bin/luci
	}
	cgi /ubus* /etc/caddy/ubus.sh {
		script_name /ubus
	}
}
```

I still wanted to serve a custom index.html from /www so I just made that the root, instead of the `file_server /luci-static* { root /www }` and `redir / /cgi-bin/luci` that Yang did. I also found that I needed the extra cgi script handling for images, downloads, etc. to work in LuCI. (There might be a more concise way to configure this but I think spelling it out for now makes it clearer.)

Finally, an OpenWrt init script at `/etc/init.d/caddy`:

```
#!/bin/sh /etc/rc.common

PROG=/usr/bin/caddy

USE_PROCD=1

# starts after network starts
START=21
# stops before networking stops
STOP=89

start_service() {
  procd_open_instance
  procd_set_param command "$PROG" run --envfile /etc/caddy/.env --config /etc/caddy/Caddyfile --adapter caddyfile
  procd_set_param stdout 1
  procd_set_param stderr 1
  procd_close_instance
}
```

And then to enable the service, test that it works, and examples of updating & reloading the Caddyfile:

```
service caddy enable
service caddy start
netstat -lnpt | grep -e 80 -e 443
/usr/bin/caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
/usr/bin/caddy fmt --overwrite /etc/caddy/Caddyfile
/usr/bin/caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

One of the neat things about this is easy SSL and reverse proxying. Since I also use the [OpenWrt AdGuard Home service](https://openwrt.org/docs/guide-user/services/dns/adguard-home), I'm able to include this in the Caddyfile for easy access:

```
adguard.home {
	tls internal
	reverse_proxy localhost:8081
}
```

And the DNS is working because the AdGuardHome is configured for upstream DNS:

```
[/home/]127.0.0.1:54
[//]127.0.0.1:54
```

...and the OpenWrt dnsmasq `/etc/config/dhcp` contains:

```
config dnsmasq
	option domainneeded '1'
	option local '/home/'
	option domain 'home'
	option expandhosts '1'
	# ...

config domain
	option name 'router.home'
	option ip '192.168.1.1'

config domain
	option name 'adguard.home'
	option ip '192.168.1.1'
```
