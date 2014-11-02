var cheerio = require('cheerio');
var express = {
	mergeExpress: mergeExpress,
	prepareOutputExpress: prepareOutputExpress
}

function prepareOutputExpress (data) {
}
function mergeExpress (res, cb) {
	function looper (data, save) {
		var prices = [data.promo, data.normal, data.flexi];
		prices.forEach(function (price) {
			if(price === "Full")
				return false;
			var priceAvailable = price.split(' ').map(function (arg) {
				return parseInt(arg.replace(/\D/g, ''), 10);
			});
			if(!!save && !!priceAvailable[1] && (!lowestPrice || (priceAvailable[0] && priceAvailable[0] < lowestPrice)))
				lowestPrice = priceAvailable[0];
			// console.log(lowestPrice, priceAvailable);
		})
	}
	looper(_json.departure, 1);
	if(_json.return)
		looper(_json.return);
	cb();
};
module.exports = express;