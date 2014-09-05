# [Sandboxed Javascript Game Server](http://js13kGames.github.io/js-game-server)
The game server for the [js13kGames Competition](http://js13kgames.com).

[![Build Status][1]][2] [![dependency status][3]][4] [![dev dependency status][5]][6]

## Deploy
```sh
$ git clone git://github.com/js13kGames/js-game-server.git
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

The `config.json` is a JSON file with this structure:

```js
{
  "games_directory": /* where the server can find game dirs to load? */,
  "sanctioned_modules": [ /* external allowed modules for sandbox require */ ],
  "log": { /* this section is optional */
    "withColors": /* (boolean) colors on console output */,
    "silentSTDIO": /* (boolean) stop console log */,
    "toFile": /* (string) a file path, or "STDIO" */
  },
  "domain": /* (string) defaults to localhost */
  "lobbyPort": /* (integer) the main httpd, that list games. */,
  "gamePortStart": /* (integer) Game ports are sequential. */
}
```

Colorful logs are useful for devs, but not for grep in production history.

## Playing

If you don't change the defaults, visit `http://localhost:3000` and you will see the game lobby, listing the example games. Click on any game and you will get it in another port with it's own http server.

## Contributing

[Register an issue](http://github.com/js13kGames/js-game-server/issues),
clone, code, push and request a merge.

[1]: https://travis-ci.org/js13kGames/js-game-server.png
[2]: https://travis-ci.org/js13kGames/js-game-server
[3]: https://david-dm.org/js13kGames/js-game-server.png
[4]: https://david-dm.org/js13kGames/js-game-server
[5]: https://david-dm.org/js13kGames/js-game-server/dev-status.png
[6]: https://david-dm.org/js13kGames/js-game-server#info=devDependencies
