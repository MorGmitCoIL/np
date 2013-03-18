/**
 * 	Manager singleton - manages the UI and usage of the webdav client
 *  
 */
var manager = new function()  
{ 		 
	//contants
	var FS_OP_NONE = 0;
	var FS_OP_DELETE = 1;
	var FS_OP_COPY = 2;
	var FS_OP_MOVE = 3;
	var FS_OP_UPLOAD = 4;

	var STATE_NOT_CONNECTED = 0;
	var STATE_CONNECTING = 1;
	var STATE_CONNECTED = 2;
	
	var client = null;
	var realHost = "";
	var tree = null;	
	var swfu = null;
	var currentExpanded = null;
	
	var fsOpMode = FS_OP_NONE;	
	var fsSrc = null;
	var fsDst = null;
	
	var connectionStatus = STATE_NOT_CONNECTED;
	
	this.init = function()
	{
		initTree();
		initSwfUpload();
			
		setConnectionStatus(STATE_NOT_CONNECTED);
	};
	
	var initTree = function()
	{
		tree = new MooTreeControl({
			div: 'mytree',
			mode: 'files',
			grid: false
		},{
			text: 'Webdav',
			open: false
		});
		
		tree.root.open = true;
		tree.root.onSelect = onItemSelected;
		tree.root.onExpand = onFolderExpand; 
			
		tree.root.data = {
				relativePath: "",
				isFolder: true
		};
	}
	
	var initSwfUpload = function()
	{
		var settings = {
				flash_url : "swfupload/swfupload.swf",
				post_params: {"PHPSESSID" : ""},
				file_size_limit : "100 MB",
				file_types : "*.*",
				file_types_description : "All Files",
				file_upload_limit : 0,
				file_queue_limit : 1,
				
				debug: false,

				// Button settings
				button_image_url: "swfupload/images/TestImageNoText_65x29.png",
				button_width: "61",
				button_height: "22",
				button_placeholder_id: "uploadBtnSpan",
				buttonDisabled: true,
				
				// The event handler functions are defined in handlers.js
				file_queued_handler : fileQueued,
				file_queue_error_handler : fileQueueError,
				file_dialog_complete_handler : fileDialogComplete,
				upload_start_handler : uploadStart,
				upload_error_handler : uploadError,
				upload_success_handler : uploadSuccess,
				
				swfupload_loaded_handler: flashReady
			};

			swfu = new SWFUpload(settings);
	}
	
	this.connect = function(proxyUrl, realHostUrl, username, password)
	{
		client = new WebdavClient(proxyUrl, username, password);
		
		swfu.setAuthorizationHeader(client.authorizationHeader);
		
		realHost = realHostUrl;
		
		setConnectionStatus(STATE_CONNECTING);
		
		refreshFolder(tree.root, '');
	};
	
	this.disconnect = function()
	{
		tree.root.clear();
		
		setConnectionStatus(STATE_NOT_CONNECTED);
	};
	
	this.getRealHost = function()
	{
		return realHost;
	}
	
	var refreshFolder = function(folderNode, path)
	{			
		currentExpanded = folderNode;
		
		folderNode.clear();
		folderNode.icon = '_closed';
				
		var handler = new RefreshFolderHandler(client.url,path); 
		 
		client.PROPFIND(handler, path, '1');
	};
	
	/*******************************************************/
	//				client callbacks
	/*******************************************************/
	var onFolderExpand = function(node)
	{
		if ((!node.data.isFolder) || (!node.open))
		{
			return;
		}
		
		refreshFolder(node, node.data.relativePath);
	};
	
	var onItemSelected = function(node, state)
	{
		setButtonsView(!state);	
		
		if (typeof(node.data.xmlStr) != 'undefined')
		{
			var xmlElm = document.getElementById("xmlTextAera");
			xmlElm.value = format_xml(node.data.xmlStr);
		}		
        
		var thumbnailElm = document.getElementById('thumbnail');
		
		if ((typeof(node.data.thumbnail) != "undefined") && (node.data.thumbnail != ''))
		{			
			thumbnailElm.src = node.data.thumbnail;
		}
		else 
		{
			thumbnailElm.src = "defaultThumbnail.png";
		}

	};
	
	var setButtonsView = function(forceDisabled)
	{
		var node = tree.selected;
		
		document.actionsForm.openButton.disabled = ((forceDisabled) || (node.data.isFolder));
		document.actionsForm.copyButton.disabled = (forceDisabled);
		document.actionsForm.cutButton.disabled = (forceDisabled);
		document.actionsForm.deleteButton.disabled = (forceDisabled);
		document.actionsForm.pasteButton.disabled = ((forceDisabled) || (!node.data.isFolder) || 
				((fsOpMode != FS_OP_COPY) && (fsOpMode != FS_OP_MOVE)));
		
		if (swfu.flashIsReady)
		{
			var swfuButtonDisabled = (forceDisabled);
			swfu.setButtonDisabled(swfuButtonDisabled);
		}
	}
	
	/*******************************************************/
	//				RefreshFolderHandler callbacks
	/*******************************************************/
	this.itemsDataReceived = function(relativePath, itemsData)
	{	
		tree.disable();
		
		currentExpanded.icon = '';
		
		for(i = 1; i < itemsData.length; i++)
		{	
			var href = itemsData[i].href;
			
			if ((href == relativePath) || ((href + "/") == relativePath) || (href == (relativePath + "/")))
			{
				continue;
			}
			
			var name = itemsData[i].name;						
			
			currentExpanded.insert({text:name, isFolder:itemsData[i].isFolder, data:itemsData[i], onSelect:onItemSelected, onExpand:onFolderExpand});					
		}
		
		tree.enable();
		
		if (connectionStatus == STATE_CONNECTING)
		{
			setConnectionStatus(STATE_CONNECTED);
		}
	};
	
	this.refreshFolderFailed = function(status, content, contentType)
	{
		alert("Failed refreshing folder, error code: " + status + "\n\n" + 
			  "message from server:\n\n" + contentAsFormattedXML(content, contentType));
		
		if (connectionStatus == STATE_CONNECTING)
		{
			setConnectionStatus(STATE_NOT_CONNECTED);
		}
		
		setErrorStrInXmlTextArea(status, content, contentType);
	};
	
	/*******************************************************/
	//				FSOperationHandler callbacks
	/*******************************************************/
	this.fsOpFinished = function()
	{	
		if (fsOpMode === FS_OP_DELETE)
		{
			var parent = fsSrc.parent;
			refreshFolder(parent, parent.data.relativePath);
		}
		else if ((fsOpMode === FS_OP_COPY) || 
				 (fsOpMode === FS_OP_UPLOAD))
		{	
			refreshFolder(fsDst, fsDst.data.relativePath);
		}
		else if (fsOpMode === FS_OP_MOVE)
		{
			var srcParent = fsSrc.parent;			
			refreshFolder(srcParent, srcParent.data.relativePath);						
			refreshFolder(fsDst, fsDst.data.relativePath);
		}
		
		fsOpMode = FS_OP_NONE;
		fsSrc = null;
		fsrDst = null;
		
		setButtonsView(false);
	};
	
	this.fsOpFailed = function(status, content, contentType)
	{
		alert("Operation failed, error code: " + status + "\n\n" + 
			  "message from server:\n\n" + contentAsFormattedXML(content, contentType));
		
		setErrorStrInXmlTextArea(status, content, contentType);
		
		fsOpMode = FS_OP_NONE;
		fsSrc = null;
		fsrDst = null;
		
		setButtonsView(false);
	};	
	
	/*******************************************************/
	//				handle varioud button behavior
	/*******************************************************/
	this.openSelectedOnline = function()
	{	
		client.OpenDrawing(tree.selected.data.relativePath);
	};
	
	this.deleteSelected = function()
	{	
		fsOpMode = FS_OP_DELETE;
		fsSrc = tree.selected;
				
		var handler = new FSOperationHandler();
		
		client.DELETE(handler, fsSrc.data.relativePath);
		
		setButtonsView(true);
	};

	this.copySelected = function()
	{	
		fsOpMode = FS_OP_COPY;
		
		fsSrc = tree.selected;
	};

	this.cutSelected = function()
	{	
		fsOpMode = FS_OP_MOVE;				
	
		fsSrc = tree.selected;				
	};

	this.pasteToSelectedFolder = function()
	{	
		fsDst = tree.selected;
		
		var handler = new FSOperationHandler();
		
		if (fsOpMode === FS_OP_COPY)
		{	
			var dstPath = fsDst.data.relativePath + "/" + fsSrc.data.name;
			client.COPY(handler, fsSrc.data.relativePath, dstPath, true);
		}
		else if (fsOpMode === FS_OP_MOVE)
		{
			var dstPath = fsDst.data.relativePath + "/" + fsSrc.data.name;
			client.MOVE(handler, fsSrc.data.relativePath, dstPath, true);
		}
		
		setButtonsView(true);
	};
	
	/*******************************************************/
	//				swfupload callbacks
	/*******************************************************/
	
	this.fileQueued = function(file) 
	{
		fsOpMode = FS_OP_UPLOAD;
		
		if (tree.selected.isFolder)
		{
			fsDst = tree.selected;
		}
		else
		{
			fsDst = tree.selected.parent;
		}
		
		setButtonsView(true);
		
		swfu.setUploadURL(manager.getRealHost( ) + fsDst.data.relativePath + "/" + file.name);
	};

	this.fileQueueError = function(file, errorCode, message) 
	{	
		if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) 
		{
			alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
			return;
		}

		switch (errorCode) 
		{
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
				alert("File is too big.");
				this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
				alert("Cannot upload Zero Byte files.");
				this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
				alert("Invalid File Type.");
				this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			default:
				if (file !== null) 
				{
					alert("Unhandled Error");
				}
				this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
		}
	};

	this.fileDialogComplete = function(numFilesSelected, numFilesQueued) 
	{			
		/* I want auto start the upload and I can do that here */		
		swfu.startUpload();
	};

	this.uploadStart = function(file) 
	{					
		return true;
	};

	this.uploadSuccess = function(file, serverData) 
	{		
		this.fsOpFinished();
	};

	this.uploadError = function(file, errorCode, message) 
	{
		var msg = '';
		
		switch (errorCode) 
		{
			case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
				msg = message;
				break;
				
			case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
				msg = "Upload Failed.";	
				break;
				
			case SWFUpload.UPLOAD_ERROR.IO_ERROR:
				msg = "Upload Failed: Server (IO) Error";
				break;
				
			case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
				msg = "Upload Failed: Security Error";
				break;
				
			case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
				msg = "Upload Failed: Upload limit exceeded.";
				break;
				
			case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
				msg = "Failed Validation.  Upload skipped.";
				break;
				
			case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
				msg = "Upload Failed: Stopped";
				break;
			default:
				msg = "Upload Failed: Unknown Error " + errorCode;
				break;
		}
		
		this.fsOpFailed(errorCode, msg, 'text');
	};
	
	this.flashReady = function()
	{
		swfu.setButtonDisabled(true);
	};
	
	/*******************************************************/
	//				View modifications methods
	/*******************************************************/
	var setConnectionStatus = function (status)
	{
		connectionStatus = status;
		
		switch(connectionStatus)
		{
			case STATE_NOT_CONNECTED:				
				document.loginForm.usernameInput.disabled = false;
				document.loginForm.passwordInput.disabled = false;
				document.loginForm.connectButton.disabled = false;
				document.loginForm.disconnectButton.disabled = true;
				
				initView();
				
				break;				
			case STATE_CONNECTING:				
				document.loginForm.usernameInput.disabled = true;
				document.loginForm.passwordInput.disabled = true;
				document.loginForm.connectButton.disabled = true;
				document.loginForm.disconnectButton.disabled = true;
				
				break;				
			case STATE_CONNECTED:
				document.loginForm.usernameInput.disabled = true;
				document.loginForm.passwordInput.disabled = true;
				document.loginForm.connectButton.disabled = true;
				document.loginForm.disconnectButton.disabled = false;
				
				break;
		}
	};
	
	var initView = function()
	{
		setButtonsView(true);
		
		var xmlElm = document.getElementById("xmlTextAera");
		xmlElm.value = "Once clicking on a file/folder, the properties xml will be displayed here";
	};
	
	var setErrorStrInXmlTextArea = function(status, content, contentType)
	{		
		var xmlElm = document.getElementById("xmlTextAera");
		var xmlStr = 'Error from server(error code: ' + status + "):\r\n\r\n";
		
		xmlStr += contentAsFormattedXML(content, contentType);
		
		xmlElm.value = xmlStr;
	};
	
	var contentAsFormattedXML = function(content, contentType)
	{
		var str = "";
		
		if (contentType === 'xml')
		{
			str = XMLtoString(content);
		}
		else if (contentType === 'text')
		{
			str = content;
		}
		
		return format_xml(str);
	};
};

function FSOperationHandler()
{
}

FSOperationHandler.prototype.onSuccess = function(result)
{
	manager.fsOpFinished();
};

FSOperationHandler.prototype.onError = function(result)
{
	manager.fsOpFailed(result.status, result.content, result.contentType);	
};


/**
 * refreshFolderHandler - used only by the handler
 * 
 */
function RefreshFolderHandler(baseUrl, path)
{
	this.baseUrl = baseUrl;
	this.path = path;		
}

RefreshFolderHandler.prototype.onSuccess = function(result)
{ 
	var itemsData = new Array();
	var items = this.getElementByTagName(result.content, 'd', 'response');
	
	for (i = 0; i < items.length; i++)
	{	
		var href = this.getElementByTagName(items[i], 'd', 'href')[0].childNodes[0].nodeValue;		 					 			
		
		if (this.getElementByTagName(items[i], 'd', 'prop').length === 0)
		{
			continue;
		}
		
		var props = this.getElementByTagName(items[i], 'd', 'prop')[0];			
		
		var thumbnail = '';
		
		if (this.getElementByTagName(props, '', 'WS_PROPERTY_LINK_TO_THUMBNAIL').length > 0)
		{
			thumbnail = this.getElementByTagName(props, '', 'WS_PROPERTY_LINK_TO_THUMBNAIL')[0].childNodes[0].nodeValue; 
		}		 
		
		var name = this.getElementByTagName(props, 'd', 'displayname')[0].childNodes[0].nodeValue;
		var relativePath = href.substr(manager.getRealHost().length);
		
		var isFolder = this.isFolder(props);		
		var xmlStr = XMLtoString(items[i]);
		
		var data = {
			href: href,
			name: name,
			relativePath: relativePath,
			isFolder: isFolder,
			xmlStr:xmlStr,
			thumbnail:thumbnail
		};
		
		itemsData.push(data);						
	}
		
	manager.itemsDataReceived(manager.getRealHost() + this.path, itemsData);
};

RefreshFolderHandler.prototype.onError = function(result)
{
	manager.refreshFolderFailed(result.status, result.content, result.contentType);	
};

RefreshFolderHandler.prototype.isFolder = function (props)
{
	if (this.getElementByTagName(props, 'd', 'resourcetype').length > 0)
	{
		var resourceType = this.getElementByTagName(props, 'd', 'resourcetype')[0];
		
		if (this.getElementByTagName(resourceType, 'd', 'collection').length > 0)
		{			
			return true;
		}
		else
		{
			return false;
		}
	}
	
	return false;
};

RefreshFolderHandler.prototype.getElementByTagName = function(node, namespace, tagName)
{
	if ((typeof(namespace) != 'undefined') && (namespace != ''))
	{
		var result = node.getElementsByTagName(namespace + ":" + tagName);
		
		if ((typeof(result) != 'undefined') && (result.length > 0))
		{
			return result;			
		}
		else
		{
			return node.getElementsByTagName(tagName);
		}			
	}
	else
	{
		return node.getElementsByTagName(tagName);
	}
};

/**
 * swfupload callbacks
 * 
 */
 
function fileQueued(file)
{
	manager.fileQueued(file);
}

function fileQueueError(file, errorCode, message) 
{
	manager.fileQueueError(file, errorCode, message);
}

function fileDialogComplete(numFilesSelected, numFilesQueued) 
{
	manager.fileDialogComplete(numFilesSelected, numFilesQueued);
}

function uploadStart(file)
{
	manager.uploadStart();
}

function uploadSuccess(file, serverData)
{
	manager.uploadSuccess(file, serverData);
}

function uploadError(file, errorCode, message)
{
	manager.uploadError(file, errorCode, message);
}

function flashReady	()
{
	manager.flashReady();
}

/**
 * General methods
 * 
 */
function XMLtoString(node) 
{
    if (typeof node != 'object')
    {
    	return node;
    }
    
    if (typeof XMLSerializer != "undefined")
    {
    	return decodeURI( (new XMLSerializer()).serializeToString(node) );
    }
	else if (node.xml)
	{
		return node.xml;
	}
	else 
	{
		throw "XML.serialize is not supported or can't serialize " + node;
	}
};

function format_xml(str)
{
	var xml = '';
	
	// add newlines
	str = str.replace(/(>)(<)(\/*)/g,"$1\r$2$3");

	// add indents
	var pad = 0;
	var indent;
	var node;
	var spacesStr;
	var spaces;
	
	// split the string
	var strArr = str.split("\r");

	// check the various tag states
	for (var i = 0; i < strArr.length; i++) 
	{
		indent = 0;
		node = strArr[i];
		node = node.replace('\n','');
		
		if(node.match(/.+<\/\w[^>]*>$/)) //open and closing in the same line
		{
			indent = 0;
		} 
		else if(node.match(/^<\/\w/))// closing tag
		{
			if (pad > 0)
			{
				{pad -= 1;}
			}
		} 
		else if (node.match(/^<\w[^>]*[^\/]>.*$/)) //opening tag
		{
			indent = 1;
		} 
		else
		{
			indent = 0;
		}
		
		spacesStr = '';
		spaces = 4 * pad;
		
		for (var j = 0; j < spaces; j++) 
		{
			spacesStr += " ";
		}
		
		xml += spacesStr + node + "\r\n";
		pad += indent;
	}

	return xml;
}