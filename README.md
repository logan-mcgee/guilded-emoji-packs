# guilded-emoji-packs
creates emoji packs of a specfici guild, abusing the discord overlay websocket

simply clone this repo, `npm i`, then run `node create-packs.js [guildid]`

this will require discord client to be running on the system, as it abuses discords overlay websocket in order to fetch emoji info.

packs will be split into 30 emojis each, so that they can be properly imported into guilded
