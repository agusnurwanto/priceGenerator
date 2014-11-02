var cheerio = require('cheerio');
var lion = {
	mergeLion: mergeLion,
	prepareOutputLion: prepareOutputLion
}

function prepareOutputLion (data) {
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
function mergeLion (res, cb) {
	lowestPrice = 0;
	var fn;
	var _ori = _dt.ori.toLowerCase();
	var _dst = _dt.dst.toLowerCase();
	var _realOri = _realDt.ori.toLowerCase();
	var _realDst = _realDt.dst.toLowerCase();
	var $ = cheerio.load(_json);
	var save = 1;
	var rms = $('td[id^=RM]').html();
    if (rms) {
      $('tr[id]').each(function(j, tr){
        var rm = $('td[id^=RM]', tr).html();
        if(!rm) return true;
        var arr = rm.match(/[A-Z]{6}/)[0].match(/.../g);
        var ori = arr[0].toLowerCase();
        var dst = arr[1].toLowerCase();
        // if(ori === _realOri && dst === _realDst)
        // 	save = 1;
        if(ori === _ori && dst === _dst){
	        $('td[id] input[type=radio][id]', tr).each(function(i, input){
	        	var parent = $(input).parent();
	        	var available = $('label', parent).text();
	            var cacheFlight = $(input).parents('tr').find('td:first-child').text().substr(0,2).toLowerCase();
	            var cacheClass = parent.attr('title').substr(0,1).toLowerCase();
	            var cache_total_price = (res[cacheFlight] && res[cacheFlight][cacheClass]) || 0;
	            if(!!save && !!available && (!lowestPrice || (cache_total_price && cache_total_price < lowestPrice))) {
	            	lowestPrice = cache_total_price;
	            	// console.log(lowestPrice, cacheFlight, cacheClass);
	            }
	            cache_total_price = Math.round(cache_total_price / 100) * 100;
	            if(!!cache_total_price && !$('.rp', parent).length)
	            	parent.append('<span class="rp">rplion'+cache_total_price+'rplion</span>');
	        });        	
        } else {
        	// console.log(ori, dst, _ori, _dst, _realOri, _realDst);
        	var priceGenerator = require('./index')('lion');
        	var nextFn = function (cb) {
	        	var newDt = {};
	        	for (var prop in _dt){
	        		newDt[prop] = _dt[prop]
	        	}
	        	newDt.ori = ori;
	        	newDt.dst = dst;
        		// this._dt = {ori: ori, dst: dst}
        		// getCache(function (res) {
        		// 	mergePrice(res, cb)
        		// });
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
      });
 	}
 	// console.log(_next);
 	// console.log(_added);
 	// if (fn = _next.pop())
 	// 	return fn(cb)
	cb('<body>' + $('body').html() + '</body>');
};
module.exports = lion;