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
			classList[seat.key] = Math.round(seat.minPrice.value / 10) * 10;
		});
		flightList[flight.key] = classList;
	});
	// console.log(flightList);
	return {data: flightList};
}
function mergeCitilink (res, cb) {
	var $ = cheerio.load(_json);
	var depFlights = $('#availabilityTable0 > tr');
	var retFlights = $('#availabilityTable1 > tr');
	function looper (depFlights, save) {
		depFlights.each(function (i, _tr) {
			var tr = $(_tr);
			var trclass = tr.attr('class');
			// console.log(trClass);
			if(i !== 0 && (trclass === undefined || trclass == 'altRowItem')) {
				var fareData = tr.find('td').eq(4).html();
				try {
					var fareMatch = fareData.match(/\d+(Fare)\w+/g);
					var fare = fareMatch[0];
				} catch (e) {
					var err = new Error('No flight fare found!');
					throw err;
				}
				var fareData2 = '';
				fareMatch.forEach(function (v, i) {
					var input = $('[id$='+v+']');
					var tr = input.parents('tr');
					var p = input.parents('p');
					var flightCache = tr.find('td:nth-child(3)').html().substr(0,2);
					var classCache = input[0].attribs.value.match(/(~[A-Z]~~)+/g)[0].replace(/~/g, '');
					var availableStr = p.text().trim();
					var available = availableStr[availableStr.length - 3];
					flightCache = flightCache.toLowerCase();
					classCache = classCache.toLowerCase();
					var cache_total_price = (res[flightCache] && res[flightCache][classCache]) || 0;
					// console.log(save, available, lowestPrice, cache_total_price)
					if(!!save && !!available && (!lowestPrice || (cache_total_price && cache_total_price < lowestPrice)))
						lowestPrice = cache_total_price;
					cache_total_price = Math.round(cache_total_price / 100) * 100;
					var fareTr = tr.find('td').eq(4).find('p').eq(i);
					var before = fareTr.html();
					try {
						if (before.match(/(Rp.)(\d+,\d+,\d+)/g)) {
						  after = before.replace(/(Rp.)(\d+,\d+,\d+)/g, 'Rp.'+cache_total_price);
						} else if (before.match(/(Rp.)(\d+,\d+)/g)) {
						  after = before.replace(/(Rp.)(\d+,\d+)/g, 'Rp.'+cache_total_price);
						}
						fareData2 = fareData2 + '<p>'+after+'</p>';
					} catch (e) {
					// do nothing
					}
				  //after = before;
				  //fareTr.html(after);
			  	});
			  	tr.find('td').eq(4).html(fareData2);
			  	// console.log(fareData2)
			}
		});
		// return out;
	};
	looper(depFlights, 1);
	if(retFlights)
		looper(retFlights)
	// console.log(lowestPrice);
	cb($('body').html());
};
module.exports = citilink;