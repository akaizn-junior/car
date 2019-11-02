# CAR 🚗 🚗 🚗

## Command Line Arguments Reader

Reads command line arguments and validates them based on a defined list

## Defined List

CAR is a function that takes 3 arguments, two of those are optional.
The first one is a defined list used to match to arguments from the Terminal.

```js
const CAR = require('@verdebydesign/car');

const arguments = CAR({
  '-h': {
    flag: true
  },
  '-v': {
    flag: true // flag
  },
  '-c': {
    var: true,
    default: 'chicken-wolf' // mixed flag
  },
  '-o': {
    var: true, // variable
    help: o_help
  }
});

console.log(arguments);

// { '-c': '<input-value>|<default>', '-o': '<input-value>', '-v': true, '-h': true }
```

## Options

- Flags. ```command -h``` The argument ```-h``` is read and set as true by CAR.
A flag on the defined list will be set to true when it's read from the console.
Flags are always true.

- Vars. ```command -o value``` The argument ```-o``` is defined as a var on the defined list, so CAR will expect the value after it to be its value. After validation CAR generates ```-o``` as ```{'-o': 'value'}```

- Vars with default or Mixed flags. ```command [ -c | -c=true | -c false ]``` Mixed flags can be read as just flags or vars depending if a value is provided or not. Mixed flags use their default value if no input is read. CAR will generate ```{ '-c': '<input-value>|<default>' }```
Mixed flags allow flags to have different values, other than just ```true```.

## Status

[![Build Status](https://travis-ci.org/verdebydesign/car.svg?branch=master)](https://travis-ci.org/verdebydesign/car)

## License

ISC License [ISC](https://opensource.org/licenses/ISC)

## Author

&copy; 2019 Verdexdesign
