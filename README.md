# vscode-rspec-daemon

VSCode extension to run rspec testing quickly with [rspec-daemon](https://github.com/asonas/rspec-daemon).

![](preview.gif)

## Features

vscode-rspec-daemon provides several commands.  Please choice the command you'd like to execute from your command palette.

* Start and stop rspec-daemon
* Run a new rspec task in the rspec-daemon server for the current file
* Watch the current file (and line) to run rspec on change

## Requirements

* Install [rspec-daemon](https://github.com/asonas/rspec-daemon) via bundler

## Release Notes

### 1.2.0

* Support running test for the current line

### 1.1.0

* Support file watching feature
* Support stopping rspec-daemon feature
* Terminal will be automatically closed on rspec-daemon terminated

### 1.0.2

Do not close connection from client side

### 1.0.1

Fix guessing paths of request specs

### 1.0.0

Initial release of vscode-rspec-daemon
