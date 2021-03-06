var ElasticSearchClient = require('elasticsearchclient');
var moment = require('moment');
var dateFormats = ['DD+MM+YYYY','DD+MMM+YYYY','DD MM YYYY','DD MMM YYYY'];
var airlines = {"airasia": 1, "citilink": 2, "garuda": 3, "lion": 4, "sriwijaya": 5, "xpress": 6};
var db = new ElasticSearchClient({
    host: 'folbek.me',
    port: 9200
});
var _debug = 1;
var debug = function () {
	if (_debug)
		console.log.apply(null, arguments)
}
var garuda = require('./garuda');
var lion = require('./lion');
var citilink = require('./citilink');
var express = require('./express');
var airasia = require('./airasia');
var merge = {
	garuda: garuda.mergeGaruda,
	citilink: citilink.mergeCitilink,
	lion: lion.mergeLion,
	airasia: airasia.mergeAirasia,
	xpress: express.mergeExpress,

}
var prepareOutput = {
	garuda: garuda.prepareOutputGaruda,
	citilink: citilink.prepareOutputCitilink,
	lion: lion.prepareOutputLion,
	airasia: airasia.prepareOutputAirasia,
	xpress: express.prepareOutputExpress,
}
var _next, _added, _prices = [];
function priceGenerator (airline) {
	_kode = airlines[airline] || 0;
	_airline = airline;
	return function (dt, json, cb) {
		this._dt = dt;
		// debug(dt);
		var _realDt = {};
		for (var prop in dt){
			_realDt[prop] = dt[prop];
		}
		this._realDt = _realDt;
		this._json = json;
		getCache(function (res) {
			// debug(res);
			mergePrice(res, cb)();
		});
	};
};
function getCache (cb) {
	if ( ['xpress', 'airasia'].indexOf(_airline) > -1 )
		return cb();
	// if ( ['garuda'].indexOf(_airline) > -1) {
		var ori = _dt.ori.toLowerCase();
		var dst = _dt.dst.toLowerCase();		
	// } else {
	// 	var ori = _dt.ori.toUpperCase();
	// 	var dst = _dt.dst.toUpperCase();
	// }
	var query = {"size":0, "query": {"filtered": {"filter": {"and" : [{ "term": { "origin": ori } }, { "term": { "destination": dst} }, { "term": { "airline": _airline} } ] } } }, "aggs": {"groupFlight": {"terms": {"field": "flight", }, "aggs": {"groupClass": {"terms": {"field": "class", }, "aggs": {"minPrice": {"min": {"field":"price"} } } } } } } };
	// debug(JSON.stringify(query, null, 2));
	db.search('pluto', 'price', query, function (err, res) {
		// debug('res',res, _dt.ori, _dt.dst);
		if (err)
			cb(nu)
		cb(prepareOutput[_airline](JSON.parse(res)).data);
	});
};
function mergePrice(res, cb) {
	var _res = res;
	var _cb = cb;
	return function () {
		this.lowestPrice = 0;
		this._next = _next || [];
		this._added = _added || [_dt.ori.toLowerCase() + _dt.dst.toLowerCase()];
		var _this = this;
		merge[_airline](_res, function (res) {
			_next = _this._next || [];
			_added = _this._added || [];

			// debug(res);
			// debug('lowestPrice',lowestPrice);
			var fn;
			if (lowestPrice){
				insertLowestPrice(lowestPrice);
				_prices.push(lowestPrice);
			}
		 	if (fn = _next.pop()){
		 		// debug('next');
		 		_json = res;
		 		fn(_cb)
		 	} else {
		 		// debug(res);
				_cb(res);
				if(_prices.length > 1 && _prices.length + 1 === _added.length)
					insertLowestPrice(_prices.reduce(function (num, before) {
						return num + before;
					}, 0), 1)
		 	}
		});
	}
}
function insertLowestPrice (price, real) {
	var _price = parseInt(price, 10) + _kode;
	var _date = moment(_dt.dep_date, dateFormats).unix() * 1000;
	var data = {
		date: _date,
		origin: _dt.ori,
		destination: _dt.dst,
		price: _price,
		airline: _airline
	};
	if (real) {
		var _real = _added.shift();
		data.origin = _real.substr(0,3);
		data.destination = _real.substr(3,3);
		// debug('real', data)
	}
	data.id = data.origin + data.destination + data.date / 1000;
	debug('lowest',lowestPrice, JSON.stringify(data, null, 2));
	db.get('pluto', 'calendar', data.id, function (err, res) {
		// debug(res)
		var res = JSON.parse(res);
		var oldPrice = (res._source && res._source.price) || 0;
		// debug(oldPrice, _price)
		if ( oldPrice === _price || (oldPrice !== 0 && _price >= oldPrice && res._source.airline !== _airline)) {
			return false;
		} else {
			data.price = _price;
			db.index('pluto', 'calendar', data, function (err, res) {
				debug('found lower price, inserting to calendar...', res)
			})	
		}
	})
}
module.exports = priceGenerator;