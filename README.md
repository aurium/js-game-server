# [Sandboxed Javascript Game Server](http://aurium.github.io/js-game-server)
The proposal game server for the [js13kGames Competition](http://js13kgames.com).

[![Build Status][1]][2] [![dependency status][3]][4] [![dev dependency status][5]][6]

## Deploy
```sh
$ git clone git://github.com/aurium/js-game-server.git
$ cd js-game-server
$ npm install
$ npm test
```

## Running

```sh
$ cd /path/to/js-game-server
$ npm start
```

## Configuring

You can place the configuration in one of this places:
- user local config dir: `$HOME/.config/js-game-server/config.json`
- system config dir: `/etc/js-game-server/config.json`
- in the application root: `<js-game-server-dir>/config.json`
This list is ordered in precedence order.

The `config.json` is a JSON file *(O RLY?)* with this structure:
```javascript
{
  "games_directory": /* where the server can find game dirs to load? */,
  "sanctioned_modules": [ /* external allowed modules for sandbox require */ ],
  "log": { /* this section is optional */
    "withColors": /* (boolean) you want colorful logs? */,
    "toFile": /* (string) a file path, or "STDIO" */
  }
}
```
Colorful logs are useful for devs, but not for grep in production history.

## Contributing

[Register a issue](http://github.com/aurium/js-game-server/issues),
clone, code, push and request a merge.

[1]: https://travis-ci.org/aurium/js-game-server.png
[2]: https://travis-ci.org/aurium/js-game-server
[3]: https://david-dm.org/aurium/js-game-server.png
[4]: https://david-dm.org/aurium/js-game-server
[5]: https://david-dm.org/aurium/js-game-server/dev-status.png
[6]: https://david-dm.org/aurium/js-game-server#info=devDependencies
