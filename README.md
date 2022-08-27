# Remote Control 📺🎛️

## Dependencies

For usage with Linux you need to install `xdotool` and `libxdo-dev`.

On Ubuntu you can install them with:

```
sudo apt install xdotool
sudo apt install libxdo-dev
```

On Arch:

```
pacman -S xdotool
```

## Build

To build the app yourself you need node and npm installed.
`cd` into the project folder and run:

```
npm run build
```

You can then copy the `target/release/remote[.exe]` file to some
place on your machine and create a symlink or link it to you `PATH`.
