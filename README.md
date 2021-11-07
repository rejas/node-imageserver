# node-imageserver

[![npm version](https://badge.fury.io/js/node-imageserver.svg)](https://badge.fury.io/js/node-imageserver)

Simple node-imageserver 

Pull Requests welcome!

## Installation

```
npm install node-imageserver
```

or 
```
yarn add node-imageserver
```

## Config

see ```config.js```

## Usage

```
http://<server>:<port>/image/<imagename>/<extension>/<width>/<height>
```

## Example

```
http://localhost:3000/image/example/jpg/300/200
```

Supported extensions:
- jpg
- png
- webp
- tiff
