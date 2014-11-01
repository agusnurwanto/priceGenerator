var cheerio = require('cheerio');
var citilink = {
	mergeCitilink: mergeCitilink,
	prepareOutputCitilink: prepareOutputCitilink
}

function prepareOutputCitilink (data) {
	var flightList = {};
	data.aggregations.groupFlight.buckets.forEach(function (flight) {
		var classList = {};
		flight.groupClass.buckets.forEach(function (seat) {
			classList[seat.key] = seat.minPrice.value;
		});
		flightList[flight.key] = classList;
	});
	// console.log(flightList);
	return {data: flightList};
}
function mergeCitilink (res, cb) {
	var $ = cheerio.load(_json);
	console.log($('body').text());
	var depFlights = _json.departure.flights;
	var retFlights = _json.return && json.return.flights;
	function looper (depFlights, save) {
		var out = depFlights.map(function (depFlight) {
			return depFlight.map(function (flight) {
				return flight.seats.map(function (seat) {
					seat.price = _res[seat.class];
					if(save && seat.available && (!lowestPrice || seat.price < lowestPrice))
						lowestPrice = seat.price;
					return seat
				});
			});
		});
		return out;
	};
	_json.departure.flights = looper(depFlights, 1);
	if(retFlights)
		_json.departure.return = looper(retFlights)
	cb(_json);
};
module.exports = citilink;