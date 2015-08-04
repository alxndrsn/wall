Wall = window.Wall = function(placeholderSelecter, repo, columnTags) {
	var ___start_vars___,
	format = function(args) { args = args.length ? args : arguments;
		return args.length === 1 ? args[0] : args[0].format.apply(
				args[0], Array.prototype.slice.call(args, 1)); },
	log = function() { console.log('LOG | ' + format(arguments)); },
	err = function() { console.err('ERR | ' + format(arguments)); },
	github = {
		API: 'https://api.github.com/',
		get: function(path, success, data) {
			$.ajax(github.API + path, {
				data:data, success:success,
				error: function(req, status, error) {
					err('[{0} -> {1}] {2}', path, status, error);
				},
			});
		},
	},
	withIssues = function(success) {
		var path = 'repos/{0}/issues'.format(repo);
		// Do a separate request for each label we are interested in -
		// the github API doesn't seem happy with labels with spaces
		_.forEach(_.flatten(columnTags), function(label) {
			github.get(path, success, {
				state: 'all',
				per_page: 100,
				labels: label,
			});
		});
	},
	Table = function(columnTags) {
		var ___start_vars___,
		self = this,
		cols = {},
		element = $(sanchez.template('table')),
		getPrimaryTag = function(issueOrTagGroup) {
			if(_.isArray(issueOrTagGroup)) return issueOrTagGroup[0];
			var issue = issueOrTagGroup;

			return _.reduce(columnTags, function(acc, tagGroup) {
				if(!acc && _.any(issue.labels, function(label) {
						return _.contains(tagGroup, label.name); })) {
					return tagGroup[0];
				}
				return acc;
			}, null);
		},
		___end_vars = true;

		this.add = function(issue) {
			log('Table.add() :: issue = #{0}', issue.number);
			var tag = getPrimaryTag(issue), count, counter;
			if(!tag) {
				return log('Ignoring issue: #{0} [{1}]', issue.number,
						_.collect(issue.labels, function(it) { return it.name; }));
			}

			// TODO as we haven't implemented pagination, if we get
			// to 100 results in a column then there's a good chance
			// there are more than 100 that should be there
			counter = $(element.find('thead th span.badge')[cols[tag][0].cellIndex]);
			count = Number.parseInt(counter.text(), 10) + 1;
			if(count >= 100) count = '100+';
			counter.text(count);

			cols[tag].append(sanchez.template('issue', {
				url:issue.html_url, title:issue.title,
				body:issue.body.chop(80),
				'user.avatar_url':issue.user.avatar_url } ));
		};
		this.addAll = function(issues) { _.forEach(issues, self.add); };
		this.getElement = function() { return element; };

		(function constructor() {
			columnTags = _.collect(columnTags, function(tagGroup) {
				return (typeof tagGroup === 'string')? [tagGroup]: tagGroup;
			});
			log('Constructing table for tags: ' + JSON.stringify(columnTags));

			// create columns
			var headRow = element.find('thead tr'),
			    bodyRow = element.find('tbody tr');
			_.forEach(columnTags, function(tagGroup) {
				var tag = getPrimaryTag(tagGroup),
				    col = cols[tag] = $('<td class="{0}">'.
						format(tagGroup.join(' ')));
				headRow.append(sanchez.template('column-header', {
						heading: tagGroup.join(', '),
						columns: 12/columnTags.length }));
				bodyRow.append(col);
			});
		}());
	},
	___end_vars___ = true;

	(function constructor() {
		log('Initialising wall in placeholder: ' + placeholderSelecter);
		var table = new Table(columnTags),
		    placeholder = $(placeholderSelecter);
		placeholder.replaceWith(table.getElement());
		withIssues(table.addAll);
	}());
};
