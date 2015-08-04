if(!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return (typeof args[number] !== 'undefined') ?
				args[number] : match;
		});
	};
}
if(!String.prototype.chop) {
	String.prototype.chop = function(maxLength) {
		if(this.legnth <= maxLength) return this;
		return this.substring(0, maxLength-1) + '…';
	};
}
