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
$(document).ready(function () { setTimeout( function () {

/*
	Helper functions
*/
/*
*/
    if (true){//FileActions !== undefined) { 
	//ajax to get dir's .metaDataOwncloud
	$.ajax({
	    dataType: 'json',
	    url: fileDownloadPath($('#dir').val(), '.metaDataOwncloud'),
	    context: document.body		
	}).
	done(function (a) {console.log(a); continuation(a);}).
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
