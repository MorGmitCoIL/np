	var sortSign = {
		group: 1,
		user: 1,
		"log id": 1,
		"log content" : 1
	};
	function getSortSign(key){
		return sortSign[key];
	}
	function rowAtKey (row, key) {
		var index = $(row).
				parent().
				parent().
				find("thead th").
				filter(function () {
					return $(this).text() === key;
				}).
				index();
		
		var result = $(row).
			find("td:nth-child("+ (index + 1) +")")[0]; 
		//console.log($(row).find("td:nth-child(3)")[0]);
		return result;
	}
	function sortTable (table, key) {
		if (key.tagName && key.tagName === "TH") {
			key = $(key).html();
		}
		if(!sortSign[key]){
			sortSign[key] = 1;
		}
		$("tbody tr", table).
				sort(function (aRow, bRow) {
						var a = $(rowAtKey(aRow, key)).html(),
						    b = $(rowAtKey(bRow, key)).html();
						//console.log([ key,aRow,$(rowAtKey(aRow, key))]);
						return  getSortSign(key) * (a > b ? 1 :
								    a === b ? 0 :
								    -1); 
					}
				).
				remove().
				appendTo("tbody",table);
		sortSign[key] = -sortSign[key] ;
	}

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

	$("#logs table thead th").on("click", function (e) { sortTable("#logs table", e.target)});

	$("<select id=\"filterByThisColumn\">").
		insertBefore("#logs").
		append(
			$("#logs table thead th").map(function () {
				return  $("<option value=\""+ $(this).index() +"\">" + 
						$(this).text()
					+ "</option>")[0];
			})
		);
	$("<input>").
		attr("id", "filterByThisText").
		attr("placeholder", "filter by this text").
		insertAfter("#filterByThisColumn");
	$("<button>filter</button>").
		attr("id", "filterTheTable").
		insertAfter("#filterByThisText").
		on("click", function () {
			var text = $("#filterByThisText").val();
			$("#logs table tbody tr").
				css("display", "none").
				filter( function () {
					var columnOption = $("#filterByThisColumn option:selected");
					var columnIndex = columnOption.val();
					var column = $(this).
					               children().
						       eq(columnIndex);
					var findText = $("#filterByThisText").
					           val();
					return (findText === "") ||
					       (column.has("dl").length > 0 && column.filter(':contains("'+findText+'")')).length > 0 ||
					       (column.text() === findText);
					//TODO if column has a definition-list, then if the definition-list contains findText ...
				}).
				css("display", "table-row");
		});
	$("#filterByThisText").keypress( function () {
		setTimeout(
			function () {
				$("#filterTheTable").click();
			},
			10
		);
	});

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
