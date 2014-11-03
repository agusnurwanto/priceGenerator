var garuda = {
	mergeGaruda: mergeGaruda,
	prepareOutputGaruda: prepareOutputGaruda
}

function prepareOutputGaruda (data) {
	var flightList = {};
	data.aggregations.groupFlight.buckets.forEach(function (flight) {
		var classList = {};
		flight.groupClass.buckets.forEach(function (seat) {
			classList[seat.key] = seat.minPrice.value;
		});
		flightList[flight.key] = classList;
	});
	console.log(flightList);
	return {data: flightList};
}
function mergeGaruda (res, cb) {
	var _res = {};
	for( var prop in res) {
		for (var _prop in res[prop]) {
			_res[_prop.toUpperCase()] = Math.round(res[prop][_prop]/100) * 100;
		}
	}
	console.log(_res)
	var depFlights = _json.departure.flights;
	var retFlights = _json.return && json.return.flights;
	function looper (depFlights, save) {
		var out = depFlights.map(function (depFlight) {
			return depFlight.map(function (flight) {
				return flight.seats.map(function (seat) {
					console.log(seat.class)
					seat.price = _res[seat.class.toUpperCase()];
					console.log(save, seat.available, seat.price, lowestPrice);
					if(!!save && !!seat.available && (!lowestPrice  || (seat.price && seat.price < lowestPrice)))
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
module.exports = garuda;