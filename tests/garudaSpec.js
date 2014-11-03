var expect = require('chai').expect;
var fs = require('fs');
var mockDataGaruda = {departure: {flights: [[{seats: [{class: "c", available: 1}, {class: "y", available: 1}, {class: "L", available: 1} ] } ], [{seats: [{class: "c", available: 1}, {class: "y", available: 1}, {class: "L", available: 1} ] } ], [{seats: [{class: "c", available: 1}, {class: "y", available: 1}, {class: "L", available: 1} ] } ], ] } }
describe('Price Generator for Garuda', function () {
	this.timeout(10000)
	it('should get cache from db, and merge with json flight', function (next) {
		var priceGenerator = require('../index')('garuda')		
		priceGenerator({ori:'cgk', dst:'sub'}, mockDataGaruda, function (res) {
			// console.log(JSON.stringify(res, null, 2));
			next();
		});
	});	
});