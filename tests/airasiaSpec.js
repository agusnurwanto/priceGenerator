var expect = require('chai').expect;
var fs = require('fs');
var mockDataEAirasia = JSON.parse(fs.readFileSync('./aa.html', 'utf8'));
// var mockDataEAirasia = {departure: {date: "2014-11-29", depart: "11/29/2014 7:00:00 AM", arrival: "11/29/2014 8:40:00 AM", promo: "Full", normal: "920,000 (0)", flexi: "1,280,000 (3)"}, return: {date: "2014-11-29", depart: "11/29/2014 9:10:00 AM", arrival: "11/29/2014 10:50:00 AM", promo: "Full", normal: "120,000 (2)", flexi: "1,280,000 (3)"} };
describe('Price Generator for EAirasia', function () {
	this.timeout(30000)
	it('should get cache from db and merge with html flight', function (next) {
		var priceGenerator = require('../index')('airasia');
		// console.log(mockDataEAirasia);
		priceGenerator({ori:'PNK', dst:'JOG'}, mockDataEAirasia, function (res) {
			// console.log(JSON.stringify(res, null, 2));
			// fs.writeFileSync('./ct2.html', res);
			next();
		});
	});	
});