var expect = require('chai').expect;
var fs = require('fs');
var mockDataCitilink = fs.readFileSync('./ct.html', 'utf8');
describe('Price Generator for Citilink', function () {
	this.timeout(30000)
	it('should get cache from db and merge with html flight', function (next) {
		var priceGenerator = require('../index')('citilink');
		// console.log(mockDataCitilink);
		priceGenerator({ori:'SUB', dst:'CGK'}, mockDataCitilink, function (res) {
			// console.log(JSON.stringify(res, null, 2));
			fs.writeFileSync('./ct2.html', res);
			next();
		});
	});	
});