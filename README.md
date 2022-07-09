# @kazhord/node-isofs
IsoFS extracted from [jvilk/BrowserFS](https://github.com/jvilk/BrowserFS) and adapted for NodeJS backend.

## Installation
```sh
$ npm install @kazhord/node-isofs
```

## Features
- Mount ISO file
- Unmount ISO file
- Read directory in ISO file
- Read file in ISO file

## To do
- Add more tests
- Add comments
- Fix and optimize some issues

## API
```js
import { IsoFS } from '@kazhord/node-isofs'
[...]
const isoFS = new IsoFS(filename)
```

### Mount/Unmount ISO
```js
let isoFS: IsoFS | undefined
try {
  isoFS = new IsoFS(filename)
  await isoFS.mountIso()
} finally {
  if (isoFS) {
    await isoFS.unmountIso()
  }
}
```

### Mount/Unmount ISO
```js
let isoFS: IsoFS | undefined
try {
  isoFS = new IsoFS(filename)
  await isoFS.mountIso()
} finally {
  if (isoFS) {
    await isoFS.unmountIso()
  }
}
```

### Get all files in selected directory and nested directories
```js
const fileFlatTree = isoFS.fileFlatTree('/')
/*
[
  {
    type: 'File',
    name: 'LICENSE',
    size: 6211,
    content: [Function: content]
  },
  [...]
  {
    type: 'File',
    name: 'README.md',
    size: 9494,
    content: [Function: content]
  },
  {
    type: 'File',
    name: '.gitignore',
    size: 431,
    content: [Function: content]
  }
]
*/
```

### Read specified directory or file
```js
const fileOrDirectory = isoFS.read('/')
/*
{
  type: 'Directory',
  name: '\x00',
  size: 2048,
  content: [Function: content] => Return a new directory item or a `Readable` if it's a file
}
*/
```
