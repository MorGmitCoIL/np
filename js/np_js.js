/*jslint browser: true*/
/*global $, jQuery, OC, alert,  open, console, WebdavClient, fileDownloadPath*/
var FileActions;
function showAllFiles(){
	$('#fileList tr').show();
}
function hideHiddenFiles(){
	$("#fileList tr[data-file^=\'.\']").hide();
}
$(document).ready(function () {
    'use strict';
     hideHiddenFiles();
     $("title").text("GMITcloud");
     var gmit_css = false,
	     formats,
         mime,
         that = {
             client: null,
             config: {
	 	 user_name: undefined,
		 password: undefined,
                 davHost: "https://dav.autocadws.com",
                 proxyUrl: OC.filePath('np', 'ajax', 'ajax_proxy.php'),
                 AutocadWSBaseUrl: "https://www.autocadws.com",
                 openInWsUrl: "https://www.autocadws.com/main/open",
                 getTokenUrl: OC.filePath('np', 'ajax', 'ajax_proxy.php/main/auth'),
             },
             links: null
         };
     //ajax call to get username and password
     $.ajax({
                url: OC.filePath('np', 'ajax', 'get_username_password.php'),
	        context: document.body
	}).done(function(a) {
	        var tmp = JSON.parse(a);
		console.log(a);
		that.config.user_name = tmp.username;
		that.config.password = tmp.password;
	});
     function log(){
         return console.log(arguments);
     }
     function module_alert(str) {
         setTimeout(function() {
                        alert(str);
                    },
                    1);
     }
     function document_origin() {
         return document.location.origin ||
                document.location.protocol + "//" + document.location.host;
     };

    XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
        var data = new ArrayBuffer(datastr.length);
        var ui8a = new Uint8Array(data, 0);
        for (var i=0; i<datastr.length; i++) {
                ui8a[i] = (datastr.charCodeAt(i) & 0xff);
        }
        this.send(data);
    };
    
    function PropfindHandler(filename) {
        var new_window;
        this.onSuccess = function (result) {
            //log(arguments);
            var rr = result.content,
                links = rr.querySelectorAll("WS_PROPERTY_LINK_TO_THUMBNAIL");
            links = Array.prototype.map.call(links, function (link) {
                return link.textContent;
            });
            log(links);
            new_window = open();
            new_window.document.head.innerHTML = "<style>" +
                    "#img1{" +
                        "position: absolute;" +
                        "width: 100%;" +
                        "height: 100%;" +
                       " }" +
                 "</style>";
            new_window.document.body.innerHTML = '<p>the src of the img will be changed to ' +
                    filename +
                '</p>' +
                '<img id="img1" src="' +
                    links[1] +
                '">';
        };
        this.onError   = function () {log(arguments); };
    }
    function server2server(remoteServerClient, handler, remoteServerPath, owncloudServerPath) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {  
    	//readystate 4 means that request finished and response is ready
    		if (request.readyState === 4) {
                    (function () {
    		        var contentType = request.getResponseHeader("content-type"),
                            content = request.responseText;
			log(request);
			module_alert("Starting Autoncad WS..\n" + "The file will be opened for viewing purposes only. Changes will not be saved");
    		        //status code 2xx means request is successfull
			if ((request.status >= 200) && (request.status < 300)) {
                                log("here22222222222222222222222222222222222");
				remoteServerClient.PUT(handler, remoteServerPath, content, contentType, content.length);
			}
			else {
				log("here3");		
                                log(content);
				log(contentType);
				throw "could not get file";
			}
                    }());
		}
        };
	request.open("GET", owncloudServerPath, true);
        request.send(null);
	log(request);
	log(remoteServerPath + ' '+ owncloudServerPath);
        return request;
         
    }
    function display_autocad_file(filename) {
        var propfindHandler = new PropfindHandler(filename),
            path = document_origin() + fileDownloadPath($('#dir').val(), filename),
            contentType = "application/dxf",
            content = null,
            putHandler = {
                onSuccess: function (r) {log("upload complete"); log(r); log("here3333333333333333333333333333333333333333"); that.client.OpenDrawing(that.config, '/' + filename);},
                onError: function (r) {log(r); }
            };
        log(path);
        log("this file will later be: " + filename + " " + "from " + path);
	log(path);
        that.client = new WebdavClient(that.config.proxyUrl, that.config.user_name, that.config.password);
        server2server(that.client, putHandler, "/" + filename, path);
        
        //that.client.PROPFIND(propfindHandler, '/2CV.DXF', 'infinity');
        // = OC.Router.generate('np_cadView', params);
        //log(OC.Router);
        //alert("TODO " + document.location + filename);
        //open("/acjs/index.html?file=" + filename + "&params=" + JSON.stringify(params) + url, "_blank", 'width=1000,height=800');
    }
    // takes a dictionary and converts it's keys to lowercase
    function keys_to_lower_case(table) {
        var result = {},
            i;
        for (i in table) {
            if (table.hasOwnProperty(i)) {
                result[i.toLowerCase()] = table[i];
            }
        }
        return result;
    }
    // takes a source mime type , an extension -> mime type conversion table and a boolean to ignore case or not
    // and converts the mime types of all files with the source mime type detected according to the table
    function convert_mimes(src_mime, ext_mime_table, ignore_case) {
        // defaults
        ignore_case = ignore_case === undefined ? true : ignore_case;
        var not_mimes = document.querySelectorAll('[data-mime="' + src_mime + '"]'),
            i,
            extension;
        for (i = 0; i < not_mimes.length; i += 1) {
            //log(rrr = not_mimes[i]);
            extension = not_mimes[i].querySelector(".extension").innerHTML;
            if (ignore_case) {
                ext_mime_table = keys_to_lower_case(ext_mime_table);
                extension = extension.toLowerCase();
            }
            //if(not_mimes[i].dataset.mime === "")log(not_mimes[i]);
            if (ext_mime_table.hasOwnProperty(extension)) {
                not_mimes[i].dataset.mime = ext_mime_table[extension];
            }
        }
    }
    if (FileActions !== undefined) {
        if (gmit_css) {
            $('#owncloud > img')[0].src = OC.filePath('np', 'img', 'logo.png');//'/owncloud/apps2/np/img/logo.png';
	    $("#header")[0].style.backgroundColor = "grey";
        }
        //log(JSON.stringify(FileActions));
        //convert all .dwg mime types that have "" as mime for some reason to application/acad
        convert_mimes("", {".dwg": "application/acad"});
        //convert all text/plain mime types with .dxf extension to application/dxf
        convert_mimes("text/plain", {".dxf": "application/dxf"});
        convert_mimes("", {".dxf": "application/dxf"});
        formats = { "application/acad": "View",
                    "application/dxf": "View",
                    //"text/plain": "View",
                    "": "View"};
        //for (mime in formats) {
            //if (formats.hasOwnProperty(mime)) {
        Object.keys(formats).forEach(function (mime) {
            FileActions.register(mime, formats[mime], OC.PERMISSION_READ, '', display_autocad_file);
            FileActions.setDefault(mime, formats[mime]);
        });

	//fileMetadata();
 
    }

});
