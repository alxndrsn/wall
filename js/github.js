github = {
	API: 'https://api.github.com/',
	err: function(path) {
		return function(req, status, error) {
			console.log('[{0} -> {1}] {2}'.format(path, status, error));
		}
	},
	get: function(path, success, data) {
		return $.ajax(github.API + path, {
			data:data, success:success,
			error: github.err(path),
		});
	},
	api_usage: function(success) {
		return github.get('rate_limit', success);
	},
	withMilestonesFor: function(repo, success) {
		return github.get('repos/' + repo + '/milestones', success);
	},
};
