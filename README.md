# CAR 🚗 🚗 🚗

## Command Line Arguments Reader

Reads command line arguments and validates them based on a defined list

## Defined list

```js
const defined = {
  '-f': {
    flag: true
  },
  '-v': {
    flag: true // flag
  },
  '-m': {
    var: true,
    default: 'chicken-wolf' // mixed flag
  },
  '-o': {
    var: true, // variable
    help: o_help
  }
};
```

## Long form list

```js
const LONG_FROM = {
    '--flag': '-f',
    '--mixed': '-m',
    '--combo': '-c',
    '--flag': '-f',
};
```

## Usage

CAR reads 3 arguments, the defined list is the only required argument.

```js
const CAR = require('@verdebydesign/car');

const validArgs = CAR(defined, longform, err => console.log(err));
```

### Flags

```command -h``` The argument ```-h``` is read and set as true by CAR.
A flag on the defined list will be set to true when it's read from the console.
Flags are always true.

### Vars

```command -o value``` The argument ```-o``` is defined as a var on the defined list, so CAR will expect the value after it to be its value. After validation CAR generates ```-o``` as ```{'-o': 'value'}```

### Mixed flags

```command [ -c | -c=true | -c false ]``` Mixed flags can be read as just flags or vars depending if a value is provided or not. Mixed flags use their default value if no input is read. CAR will generate ```{ '-c': '<input-value>|<default>' }```
Mixed flags allow flags to have different values, other than just ```true```.

### Option help

```command -a help``` More information about an option may be provided with the 'help' setting on the defined list. By default CAR will use the values 'help' | '--help' | '-h' to show help details for an option. However, the ```helpOption``` setting on the defined list may be used to define a specific value to show help. Additionally, CAR provides two ways to show help:

- help callback

```js
...
'-o': {
   help: o_help,
   helpOption: 'h' // this setitng allows 'command -o h' to show help for option '-o'
}
...
```

- package.json's man setting.

If a project already contains man files defined for its options, CAR uses placeholders to access the man files. The '%man' placeholder will access the man file referred by package.json's man. If package.json's man is an array of files, an index may be used to access the correct man file, such as '%man#2'.

```js
...
'-o': {
   help: '%man',
   helpOption: 'h'
}
...
```

```js
...
'-o': {
   help: '%man#2', // will access the man file at index 2 on the package.json's man file array
   helpOption: 'h'
}
...
```

- See [package.json man doc](https://docs.npmjs.com/files/package.json#man)

## Status

[![Build Status](https://travis-ci.org/verdebydesign/car.svg?branch=master)](https://travis-ci.org/verdebydesign/car)

## License

ISC License [ISC](https://opensource.org/licenses/ISC)

## Author

&copy; 2019 Verdexdesign
