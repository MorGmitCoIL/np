/*
	file metadata js file
	each dir, that have file metadata, has a file .metaDataOwncloud
	that file has a json string:
	{
	    "scheme": [<key>, ...],
	    <fileName>: [<value>, ... ]
            .
            .
            .
	}
*/

/*
	Example for .metaDataOwncloud:
	{
	    "scheme": ["a","b","c"],
	    "np": ["one","two","three"],
            "white_list.txt": ["if it were", ".whiteList", "it would be hidden"]
	}
*/
var FileActions;

//checks if file exists in current directory
function fileExists(fileName){
    return $("#fileList td:first-child .nametext").filter(function() { return $(this).text().trim() === fileName;}).length > 0;
}
function pairArr2obj(pairArr){
    var result = {};
    $(pairArr).each(function () { result[this[0]] = this[1];});
    return result;
}
$.fn.pairArr2obj = function () { return pairArr2obj(this);};
function parseCsv (csvString, keyTranslationTable) {
    return $(csvString.toString().split("\n")).//map(function () {return this.toString().split(",");} );
		map(function () { var row = this.toString().split(","); return [[(keyTranslationTable[row[0]] ? keyTranslationTable[row[0]] : row[0]) ,row.splice(1)]]}).
		pairArr2obj();
}
$(document).ready(function () { setTimeout( function () {

/*
	Helper functions
*/
/*
*/
    var dataType,fileName,done;
    if (true){//FileActions !== undefined) { 
	//ajax to get dir's .metaDataOwncloud

	
	if(fileExists('.metaDataOwncloud')){
		dataType = 'json';
		fileName = '.metaDataOwncloud';
		done = function (a) {console.log(a); continuation(a);};
	} else {
		dataType = 'text';
		fileName = '.metaDataCsv';
		done = function (a) {console.log(a); var tmp = parseCsv(a,{"": "scheme"}); console.log(tmp); continuation(tmp);};
	}

	$.ajax({
	    dataType: dataType,
	    url: fileDownloadPath($('#dir').val(), fileName),
	    context: document.body		
	}).
	done(done).
	fail(function (b) {console.log("could not download file"); console.log(b);});

	function continuation(metaData) {
	    $(metaData.scheme).map(function () {
		return $("<th>").addClass('fileMetadata').html(this.toString())[0];
	    }).
	    insertAfter($("#headerName"));
	    $("#fileList tr").each( function () {
		if(metaData[this.dataset.file]){
	   	    console.log(metaData[this.dataset.file]);
		    $(metaData[this.dataset.file]).
			map(function () { return $("<td>").addClass('fileMetadata').html(this.toString())[0]; }).
	                insertAfter($("td:first-child",this));
	        }else{
		    $(metaData.scheme).
			map(function () {return $("<td>").addClass('fileMetadata')[0]; }).
			insertAfter($("td:first-child", this));
	                console.log("no meta data for file: "+this.dataset.file);	
		}
	   });
	   $('.fileMetadata').css('padding','10px');
	}


    }
}, 1000)
}());
