var garuda = {
	mergeGaruda: mergeGaruda,
	prepareOutputGaruda: prepareOutputGaruda
}

function prepareOutputGaruda (data) {
	var flightList = {};
	data.aggregations.groupFlight.buckets.forEach(function (flight) {
		var classList = {};
		flight.groupClass.buckets.forEach(function (seat) {
			classList[seat.key] = Math.round(seat.minPrice.value / 10) * 10;
		});
		flightList[flight.key] = classList;
	});
	// console.log(flightList);
	return {data: flightList};
}
function mergeGaruda (res, cb) {
	lowestPrice = 0;
	var fn;
	var _ori = _dt.ori.toLowerCase();
	var _dst = _dt.dst.toLowerCase();
	var _realOri = _realDt.ori.toLowerCase();
	var _realDst = _realDt.dst.toLowerCase();
	var _res = {};
	for( var prop in res) {
		for (var _prop in res[prop]) {
			_res[_prop.toUpperCase()] = Math.round(res[prop][_prop]/100) * 100;
		}
	}
	// console.log(_res)
	var depFlights = _json.departure.flights;
	var retFlights = _json.return && json.return.flights;
	function looper (depFlights, save) {
		var out = depFlights.map(function (depFlight) {
			//row
			return depFlight.map(function (flight) {
		        var ori = flight.origin.toLowerCase();
		        var dst = flight.destination.toLowerCase();
				if(ori === _ori && dst === _dst){
					flight.seats = flight.seats.map(function (seat) {
						// console.log(seat.class)
						seat.price = _res[seat.class.toUpperCase()];
						// console.log(save, seat.available, seat.price, lowestPrice);
						if(!!save && !!seat.available && (!lowestPrice  || (seat.price && seat.price < lowestPrice)))
							lowestPrice = seat.price;
						return seat;
					});
				} else {
					// console.log(ori, dst, _ori, _dst, _realOri, _realDst);
					var priceGenerator = require('./index')('garuda');
					var nextFn = function (cb) {
			        	var newDt = {};
			        	for (var prop in _dt){
			        		newDt[prop] = _dt[prop]
			        	}
			        	newDt.ori = ori;
			        	newDt.dst = dst;
		        		priceGenerator(newDt, _json, function (res) {
			        		this._next = _next;
			        		this._added = _added;
		        			_json = res;
		        			cb(res)
		        		});
		        	};
		        	var added = 0;
		        	_added.forEach(function (name) {
		        		if (ori+dst === name)
		        			added = 1;
		        	})
		        	if(!added){
		        		_next.push(nextFn);_added.push(ori+dst);
		        	}
				}
				return flight;
			});
		});
		return out;
	};
	_json.departure.flights = looper(depFlights, 1);
	if(retFlights)
		_json.departure.return = looper(retFlights)
	
 	// console.log(_next);
 	// console.log(_added);
	cb(_json);
};
module.exports = garuda;