#!/bin/bash
patch -u -b node_modules/openid-client/lib/client.js -i patches/client.js.patch
patch -u -b node_modules/openid-client/lib/passport_strategy.js -i patches/passport_strategy.js.patch