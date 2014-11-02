
function getCache (cb, db) {
	var query = {"size":0, "query": {"filtered": {"filter": {"and" : [{ "term": { "origin": _dt.ori } }, { "term": { "destination": _dt.dst} }, { "term": { "airline": _airline} } ] } } }, "aggs": {"groupFlight": {"terms": {"field": "flight", }, "aggs": {"groupClass": {"terms": {"field": "class", }, "aggs": {"minPrice": {"min": {"field":"price"} } } } } } } };
	// console.log(JSON.stringify(query, null, 2));
	db.search('pluto', 'price', query, function (err, res) {
		// console.log('res',res);
		cb(prepareOutput[_airline](JSON.parse(res)).data);
	});
};

module.exports = getCache;