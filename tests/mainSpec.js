var expect = require('chai').expect;
var mockData = {
	departure: {
		flights: 
		[
			[{seats: [{class: "c", available: 1}, {class: "y", available: 1}, {class: "L", available: 1} ] } ],
			[{seats: [{class: "c", available: 1}, {class: "y", available: 1}, {class: "L", available: 1} ] } ],
			[{seats: [{class: "c", available: 1}, {class: "y", available: 1}, {class: "L", available: 1} ] } ],
		]
	}
}
describe('Price Generator', function () {
	this.timeout(10000)
	it('should get cache from db', function (next) {
		var priceGenerator = require('../index')('garuda')		
		priceGenerator({ori:'JOG', dst:'CGK'}, mockData, function (res) {
			// console.log(JSON.stringify(res, null, 2));
			next();
		});
	});	
});