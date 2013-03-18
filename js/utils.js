var Utils = new function ()
{
	//create object according to the browser
	this.getRequest = function()
	{
		try 
		{
			// Firefox, Opera 8.0+, Safari	 	        	 
			return new XMLHttpRequest(); 	        	 	              
		}
		catch (e) 
		{
			//Internet Explorer
			try 
			{
				return new ActiveXObject("Msxml2.XMLHTTP");
			}
			catch (e) 
			{
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
	};
};