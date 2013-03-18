/**
 * Webdav constructor function 	
 */
function WebdavClient(url, username, password) 
{
	this.url = url; 		 	         	       
    
	//use the user credentials to genereate the Autorization header.
	//The Autorization header is sent to the webdav server in each request, 
	//and the server uses this header to authorize the user.
	var tok = username + ':' + password;
	var hash = Base64.encode(tok);	
	this.authorizationHeader = "Basic " + hash;
}

/**
 * opens XMLHttp request and sets its header 'Authorization' in case of this.username is not empty
 * 
 * @private
 */
WebdavClient.prototype.createRequest = function(handler, method, path) 
{
 	var parseResponse = function(request)
 	{
 		// define source of response content
 		if (request.getResponseHeader("content-type") &&
 			request.getResponseHeader("content-type").indexOf("xml") >= 0 )
 		{
 			var content = request.responseXML;
 			var contentType = 'xml';
 		} 
 		else 
 		{
 			var content = request.responseText;
 			var contentType = 'text';
 		}
 	        
 		var result = {
 				status: request.status,
 				content: content,
 				contentType: contentType
 		};
 	        
 		return result;
 	};
	
 	/******************************************************/
 	//begin of createRequest
 	/******************************************************/
 	var request = Utils.getRequest();

	handler.onSuccess = handler.onSuccess || function(){};
    handler.onError = handler.onError || function(){};
    
    request.onreadystatechange = function()
    { 	
    	//readystate 4 means that request finished and response is ready
    	if (request.readyState == 4) 
    	{ 	    			
    		var result = parseResponse(request);
          
    		//status code 2xx means result is successfull
			if ((result.status >= 200) && (result.status < 300)) 
			{
				handler.onSuccess(result);
			}
			else 
			{
				handler.onError(result);
			}
		}
    };
	
    //concatenate the relative path to the server url to receive the full URL.
	var url = encodeURI(this.url + path);
	
   	//open connection to the server using the specifed method.
	request.open(method, url, true);
	
	// set header for authorization
   	request.setRequestHeader('Authorization', this.authorizationHeader);

    return request;
};	

// -------- WebDAV Modifications to HTTP --------

/**
 * performs a GET method - to retrieve the content of a resource
 * 
 * @public
 */
WebdavClient.prototype.GET = function(handler, path) 
{		  
    var request = this.createRequest(handler, 'GET', path);
    
  //no body in the request required
    request.send(''); 	        
};

/**
 * performs a PUT method - to save the content of a resource to the server
 * 
 * @public
 */
WebdavClient.prototype.PUT = function(handler, path, content, contentType, contentLength) 
{
    var request = this.createRequest(handler, 'PUT', path);
    
    request.setRequestHeader("Content-type", contentType || 'text/plain; charset=UTF-8');     
    request.setRequestHeader("Content-length", contentLength);
    
    request.sendAsBinary(content); 	 	        
};

/**
 * performs a DELETE method - to remove a resource or collection.
 * 
 * @public
 */
WebdavClient.prototype.DELETE = function(handler, path) 
{		
    var request = this.createRequest(handler, 'DELETE', path);
   
    //no body in the request required
    request.send('');       
};


/**
 * performs a COPY method - to copy a resource from one URI to another.
 * 
 * @public
 */
WebdavClient.prototype.COPY = function(handler, srcPath, dstPath, overwrite) 
{               
    var request = this.createRequest(handler, 'COPY', srcPath);
    
  //use the Destination header to specify to where the file should be moved
    request.setRequestHeader('Destination', encodeURI(dstPath));
    
    if (overwrite) 
    {
        request.setRequestHeader('Overwrite', 'T');
    } 
    else 
    {
        request.setRequestHeader('Overwrite', 'F');             
    }
    
    //no body in the request required
    request.send('');    
};

/**
 * performs a MOVE method - to move a resource from one URI to another.
 * 
 * @public
 */
WebdavClient.prototype.MOVE = function(handler, srcPath, dstPath, overwrite) 
{                   
    var request = this.createRequest(handler, 'MOVE', srcPath || '');
    
    
    //use the Destination header to specify to where the file should be copied
    request.setRequestHeader('Destination', encodeURI(dstPath));
    
    if (overwrite) 
    {
        request.setRequestHeader('Overwrite', 'T');
    } 
    else 
    {
        request.setRequestHeader('Overwrite', 'F');             
    };
    
    //no body in the request required
    request.send('');       
};

// -------- WebDAV Property Operations --------

/**
 * performs a PROPFIND method - to retrieve properties, stored as XML, from a resource. It is also overloaded to allow one to retrieve the collection structure (a.k.a. directory hierarchy) of a remote system.
 * 
 * @public
 */
WebdavClient.prototype.PROPFIND = function(handler, path, depth) 
{ 			        
	var request = this.createRequest(handler, 'PROPFIND', path);      
 
	//set the Depth header
   	request.setRequestHeader('Depth', depth);
    
   	//Send an XML as the body of the request.
   	//In the body we specify that we want the server to send all the properties of the files.
   	//We coould also ask for specific properties, or only the propreties names.
    request.setRequestHeader('Content-type', 'text/xml; charset=UTF-8');
     	   
    var xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
	xml += '<D:propfind xmlns:D="DAV:">\n';
    xml += '    <D:allprop/>\n';
    xml += '</D:propfind>\n';
    
    request.send(xml);        
};

WebdavClient.prototype.OpenDrawing = function(config, path) 
{
	var request = new Utils.getRequest();
		
	request.open("GET", config.getTokenUrl, false);
	
	request.setRequestHeader('Authorization', this.authorizationHeader);
	request.setRequestHeader('toautocadws', 'true');
	
	request.send('');
	
	//status code 2xx means result is successfull
	if ((request.status >= 200) && (request.status < 300)) 
	{
		var token = request.responseText;
	
		var url = config.openInWsUrl + "?path=" + encodeURIComponent(path) +  "&token=" + token;
		
		window.open(url, '_blank');
	}
	else
	{
		alert("Failed opening file, error code: " + request.status);
	}
};
