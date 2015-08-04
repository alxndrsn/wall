github = {
	API: 'https://api.github.com/',
	err: function(path) {
		return function(req, status, error) {
			console.log('[{0} -> {1}] {2}'.format(path, status, error));
		}
	},
	get: function(path, success, data) {
		$.ajax(github.API + path, {
			data:data, success:success,
			error: github.err(path),
		});
	},
	api_usage: function(success) {
		var path = 'rate_limit';
		$.ajax(github.API + path, {
			success: success,
			error: github.err(path),
		});
	},
};
