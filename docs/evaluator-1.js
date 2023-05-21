//		evaluator-1.js    2023-05-21    usp

	// Bindings associate variables with elements.
const bindings = { } ;

function inputChangeHandler( evt ) {
		// Set bound variable
	const name = evt.target.getAttribute( "data-set" );
	const value = evt.target.hasAttribute( "data-attrib" ) ? 
		evt.target.getAttribute( evt.target.getAttribute( "data-attrib" )) : 
		evt.target[ evt.target.getAttribute( "data-member" )] ;
	set( name, value );
	console.log ( `${name} = ${value}` );
		// Execute bound function
	const functions = evt.target.getAttribute( "data-exec" ).split( /\s*,\s*/ );
	for ( const fn of functions ) {
		if ( ! fn ) return ;
		try { globalThis[ fn ].call( ); }
			// Errors logged but don't break script execution
		catch( e ){ console.log( e ); }
		}
	}
export function bind ( name, element ) {
		// Binds variable names to HTML DOM elements.
	const binding = bindings[ name ] || ( bindings[ name ] = [ ] );
		// Prevent multiple references to the same element.
	for ( const target of binding ) if ( target === element ) return;
		// Add the element reference to the binding.
	binding.push( element );
	}
export function set ( name, value ) {
		// Sets a variable and updates bound elements.
		// Set the variable
	globalThis[ name ] = value ;
		// Get the variable bindings
	const binding = bindings[ name ] || [ ] ;
		// Update bound elements
	for ( const target of binding ) {
		const attrib = target.getAttribute( "data-attrib" );
		if ( attrib ) target.setAttribute( attrib, value );
		const member = target.getAttribute( "data-member" );
		if ( member ) target[ member ] = value ;
		}
	}
export function initPage ( ) {
		// Bind read-only elements
	document.querySelectorAll( "[data-get]" ).forEach( element => {
		bind( element.getAttribute( "data-get" ), element ) ;
		} ) ;
		// Bind read-write elements and add an input event handler
	document.querySelectorAll( "[data-set]" ).forEach( element => { 
		bind( element.getAttribute( "data-set" ), element ) ;
		element.addEventListener( "change", inputChangeHandler )
		} ) ;  
	}
