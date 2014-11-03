var cheerio = require('cheerio');
var Airasia = {
	mergeAirasia: mergeAirasia,
	prepareOutputAirasia: prepareOutputAirasia
}

function prepareOutputAirasia (data) {
}
function mergeAirasia (res, cb) {
	function looper (data, save) {
		for (var prop in data) {
			var dataPrices = [data[prop].lowFare, data[prop].hiFlyer];
			for (var i = 0; i < dataPrices.length; i++) {
				var price = +dataPrices[i].match(/n>([\s\S]{2})+?IDR<d/).shift().replace(/\D/g, '');
				if(!!save && (!lowestPrice || (price && price < lowestPrice)))
					lowestPrice = price;
				// console.log(lowestPrice, price);
			};
		}
	}
	looper(_json[0].dep_table, 1);
	// if(_json[0].ret_table)
	// 	looper(_json[0].ret_table);
	cb();
};
module.exports = Airasia;