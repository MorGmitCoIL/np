(function( $ ){

  var methods = {
    init : function( options ) { 
      // THIS 
    },
    columnBelow : function (){
	return this.
		parent("tr").
		parent("thead").
		parent("table").
		find("> tbody > tr > td").
		filter(":nth-child("+ (this.index() + 1) +")");	
    },
    allInColumn : function (options){
	if(options && options.withSelf)
		return this.
			closest("tr").
			siblings().
			addBack().
			contents("td");
	else
		return this.
			closest("tr").
			siblings().
			contents("td");
    }
    
  };

  $.fn.npPlugin = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }    
  
  };

}( jQuery ));
