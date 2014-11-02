var expect = require('chai').expect;
var fs = require('fs');
var mockDataLion = fs.readFileSync('./li.html', 'utf8');
describe('Price Generator for Lion', function () {
	this.timeout(10000)
	it('should get cache from db and merge with html flight', function (next) {
		var priceGenerator = require('../index')('lion');
		// console.log(mockDataLion);
		priceGenerator({ori:'jog', dst:'pdg'}, mockDataLion, function (res) {
			// console.log(res);
			// console.log(JSON.stringify(res, null, 2));
			fs.writeFileSync('./li2.html', res);
			next();
		});
	});	
});