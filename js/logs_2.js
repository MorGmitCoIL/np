$(document).ready(function () {
	var tmp = {},
        plugins = {
			mapText : function () {
				return this.map(
							function (k, v) {
								return $(v).text();
						});
			},
            textToList : function () {
				return this.each( function (k, td) {
								$(td).html(textToList($(td).text()));
							});
			}
        };
	function toListItem (obj) {
		return function (val, key) {
			return obj.hasOwnProperty(key) ? "<dt>" + key + "</dt><dd>"+val+"</dd>" : "";
		};
	}	
	function textToList(text) {
		return toList(
			$.parseJSON(text));
	}
	function toList(obj) { 
			return "<dl>"+ $.map(obj, toListItem(obj)).join("") + "</dl>"; 
	}
	function temporaryPlugins($,plugins){ $.each(plugins, function (k, v) {
																tmp[k] = $.fn[k];
																$.fn[k] = v;
															}
												);
										}
	function deleteTemporaryPlugins($){ $.each(tmp, function (k,v) {
														$.fn[k] = tmp[k];
													}
												);
										tmp = {};
									}
								
	
	temporaryPlugins($,plugins);

	console.log($("#logs td:last-child").textToList());
	deleteTemporaryPlugins($);
});
