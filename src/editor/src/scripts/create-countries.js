const countries = require('./countries.js').countries
const fs = require('fs')

for (let country of countries) {
  fs.writeFile('./countries/' + country.value + '.svg', country.svg, () => { })
}