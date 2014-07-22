# [Sandboxed Javascript Game Server](http://aurium.github.io/js-game-server)
The proposal game server for the [js13kGames Competition](http://js13kgames.com).

## Deploy
```sh
$ git clone git://github.com/aurium/js-game-server.git
$ cd js-game-server
$ npm install
$ npm test
```

## Runing

You must to set the `GAMES_DIR` environment variable to the server.

On BASH-like consoles you have a pretty simple one-line command:
```sh
$ cd /path/to/js-game-server
$ GAMES_DIR=/the/dir/with/games npm start
```

Try it with the game examples:
```sh
$ GAMES_DIR=examples npm start
```

## Contributing

[Register a issue](http://github.com/aurium/js-game-server/issues),
clone, code, push and request a merge.
