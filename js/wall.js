Wall = window.Wall = function(containerSelecter, repo, columnTags) {
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
	}
	withIssues = function(success) {
		var path = 'repos/{0}/issues'.format(repo);
		github.get(path, success, {
			// TODO restrict to labels that we care about:
			//labels: _.flatten(columnTags).join(','),
			state: 'all',
		});
	},
	Table = function(columnTags) {
		var ___start_vars___,
		issues = [],
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
			issues.push(issue);
		};
		this.addAll = function(issues) { _.forEach(issues, this.add); };
		this.getElement = function() {
			var e = $('<table><thead><tr/></thead><tbody><tr/></tbody></table>'),
			    headRow = e.find('thead tr'),
			    bodyRow = e.find('tbody tr'),
			    cols = {};

			// create columns
			_.forEach(columnTags, function(tagGroup) {
				var tag = getPrimaryTag(tagGroup),
				    col = cols[tag] = $('<td class="{0}">'.
						format(tagGroup.join(' ')));
				headRow.append('<td>{0}</td>'.format(tagGroup.join(', ')));
				bodyRow.append(col);
			});

			// add issues
			_.forEach(issues, function(issue) {
				var tag = getPrimaryTag(issue);
				if(!tag) {
					return log('Ignoring issue: #{0} [{1}]', issue.number,
							_.collect(issue.labels, function(it) { return it.name; }));
				}
				cols[tag].append(
					'<div><a href="{0}">{1}</a></div>'.format(
						issue.html_url, issue.title));
			});

			return e;
		};

		(function constructor() {
			columnTags = _.collect(columnTags, function(tagGroup) {
				return (typeof tagGroup === 'string')? [tagGroup]: tagGroup;
			});
			log('Constructing table for tags: ' + JSON.stringify(columnTags));
		}());
	},
	___end_vars___ = true;

	(function constructor() {
		log('Initialising wall in container: ' + containerSelecter);
		withIssues(function(issues) {
			var table = new Table(columnTags),
			    container = $(containerSelecter);
			table.addAll(issues);
			container.empty();
			container.append(table.getElement());
		});
	}());
};
