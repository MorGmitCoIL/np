$(document).ready(function () {
	function user_logs_to_rows(logs){
		return $.map(logs['user'], function (val, key) {
				return "<tr><td>"+key+"</td><td>" + JSON.stringify(val) + "</td></tr>";
			}).join("");
	}
	function user_logs_to_table(logs){
		if(!logs['user'])
			return null;
		return "<table><thead>"+ "<th>key</th>" + "<th>data</th>" +"</thead><tbody>"+user_logs_to_rows(logs)+"</tbody></table>";
	}
	function group_logs_to_rows(logs){
		return $.map(logs['group'], function (user, user_name) {
				return "<tr><td>"+user_name+"</td><td>" + user_logs_to_table(user) + "</td></tr>";
			}).join("");
	}
	function group_logs_to_table(logs){
		if(!logs['group'])
			return null;
		return "<table><thead>"+ "<th>user name</th>" + "<th>logs</th>" +"</thead><tbody>"+group_logs_to_rows(logs)+"</tbody></table>";
	}

	function all_logs_to_rows(logs){
		return $.map(logs['all'], function (group, group_name) {
				return "<tr><td>"+group_name+"</td><td>" + group_logs_to_table(group) + "</td></tr>";
			}).join("");
	}
	function all_logs_to_table(logs){
		if(!logs['all'])
			return null;
		return "<table><thead>"+ "<th>group name</th>" + "<th>logs</th>" +"</thead><tbody>"+all_logs_to_rows(logs)+"</tbody></table>";
	}
	
	function logs_to_table(logs){
		return all_logs_to_table(logs_obj) || group_logs_to_table(logs_obj) || user_logs_to_table(logs_obj);
	}

	Array.prototype.flatten = function(levels){
		var result = this;
		while(levels > 0){
			result = result.reduce(function (r,b) { return r.concat(b)}, []);
			levels --;
		}
		return result;
	}
	function logs_to_rows(logs){
		function tmp(logs,prefix_arr){
			prefix_arr = prefix_arr || [];
			if(logs['all']){
				return $.map(logs['all'], function (group, group_name) {
					return [tmp(group, [group_name])];
				}).flatten(1);
			}else if(logs['group']){
				return $.map(logs['group'], function (user, user_name) {
					return [tmp(user, prefix_arr.concat(user_name))];
				}).flatten(1);
			}else if(logs['user']){
				return $.map(logs['user'], function (log_value, log_key) {
					return [prefix_arr.concat([log_key, JSON.stringify(log_value)])];
				});
			}else {
				return false;
			}
		}
		var result = tmp(logs);
		//return result;
		
		return ([logs['all'] && ["group","user","log id","log content"] ||
			logs['group'] && ["user","log id","log content"] ||
			logs['user'] && ["log id","log content"] ]).concat(result);
		
		
	}
	function first_row_as_header(row){
		return '<tr>'+ $.map(row, function (v, i) {
				return '<th>' + v + '</th>';
			}).join("") +'</tr>';
	}
	function row_to_html(row){
		return '<tr>' + 
				$.map(row, function (v, i){
					return '<td>' + v + '</td>';
				}).join("") +
			'</tr>';
	}
	function array_to_rows(arr){
		return $.map(arr, function (v, i) {
			return row_to_html(v);
		}).join("");
	}
	var logs_obj = $.parseJSON($("#logs_json").text()),
	    tmp, first_row, rest_of_rows;
	tmp = logs_to_rows(logs_obj);
	first_row = tmp[0];
	rest_of_rows = tmp.slice(1);
	$("#logs_json")[0].hidden = true; //
	$("#logs").
		append('<table>'+
				'<thead>'+
						first_row_as_header(first_row)+
				'</thead>'+
				'<tbody>'+
					array_to_rows(rest_of_rows)+
				'</tbody>'+
			'</table>'
		);//logs_to_table(logs));
	$('#logs td, #logs th').
		css("padding", "10px");
	
});
