# vscode-rspec-daemon

VSCode extension to run rspec testing quickly with [rspec-daemon](https://github.com/asonas/rspec-daemon).

## Features

vscode-rspec-daemon provides four commands.  Please choice the command you'd like to execute from your command palette.

* "RSpec Daemon: Invoke rspec-daemon" (`rspec-daemon.invokeRSpecDaemon`)
    * Invoke rspec-daemon server
* "RSpec Daemon: Run rspec for current file" (`rspec-daemon.startRSpecForCurrentFile`)
    * Run a new rspec task in the rspec-daemon server for the current file
* "RSpec Daemon: Watch the current file" (`rspec-daemon.watchCurrentFile`)
    * Watch the current file to run rspec on change
* "RSpec Daemon: Stop watching file changes" (`rspec-daemon.stopWatchers`)
    * Stop watching files changes

## Requirements

* Install [rspec-daemon](https://github.com/asonas/rspec-daemon) via bundler

## Release Notes

### 1.0.2

Do not close connection from client side

### 1.0.1

Fix guessing paths of request specs

### 1.0.0

Initial release of vscode-rspec-daemon
