//		evaluator-1.js    2023-05-22    usp

	// Bindings associate variables with elements.
export const updateBindings = { } ;
export const functionBindings = { } ;

export function set ( name, value ) {
	//// Sets a variable and updates bound properties.
		// Bail out if nothing to do.
	if ( globalThis[ name ] === value ) return ;
		// Set the variable
	globalThis[ name ] = value ;
		// Update bound properties
	let bindings = updateBindings[ name ] || [ ] ;
	for ( let binding of bindings ) binding.object [ binding.property ] = value ;
		// Call bound functions
	bindings = functionBindings[ name ] || [ ] ;
	for ( const fn of bindings ) {
		try { fn.call( ); }
			// Errors logged but don't break script execution
		catch( e ){ console.log( e ); }
		}
	}
export function inputChangeHandler( evt ) {
		// Get the bound object
	const name = evt.target.getAttribute( "data-set" );
	const value = evt.target.hasAttribute( "data-attrib" ) ? 
		evt.target.getAttribute( evt.target.getAttribute( "data-attrib" )) : 
		evt.target[ evt.target.getAttribute( "data-member" )] ;
	console.log ( `${name} = ${value}` );
		// Set its value
	set( name, value );
	}
export function addFunctionBindings ( name, functions ) {
	////	Binds a list of functions to a variable name
		// Make sure that functions is an array of functions
	if ( typeof functions === "string" ) functions = functions.split( /\s*,\s*/ ) ;
		// Get the function bindings for the variable name
	const bindings = functionBindings[ name ] || (functionBindings[ name ] = [ ] );
		// Iterate over incoming function names
	for ( const fn of functions ) { 
		addCallBinding : {
				// Prevent duplicate function bindings
			for ( const binding of bindings ) if ( binding.name === fn ) break addCallBinding ;
				// Add the new function call binding.
			bindings.push( globalThis[ fn ] );
	}	}	}
export function addPropertyUpdateBinding ( name, objectReference, propertyName ) {
		// Get the binding for the named variable
	const bindings = updateBindings[ name ] || ( updateBindings[ name ] = [ ] );
		// Prevent multiple references to the same target.
	for ( const binding of bindings ) if ( binding.object === objectReference && binding.property === propertyName ) return ;
		// Add the element reference to the binding.
	bindings.push( { object : objectReference, property : propertyName } );
	}
export function addElementUpdateBinding( name, element ) {
	////	Binds an element attribute or property to a variable for updating
	if ( element.hasAttribute( "data-member" )) {
		addPropertyUpdateBinding( name, element, element.getAttribute( "data-member" ));
		}
	else if ( element.hasAttribute( "data-attrib" )) {
		addPropertyUpdateBinding( name, element.attributes[ element.getAttribute( "data-attrib" )], "value" ) ;
		}
	else throw new Error( "evaluator.js:initPage(): No update attribute or property specified." );  // TODO: Decide if we can exit silently or throw an error here. 
	}
export function initPage ( container=document ) {
		// Bind read-only elements to a variable
	container.querySelectorAll( "[data-get]" )
		.forEach( element => addElementUpdateBinding( element.getAttribute( "data-get" ), element )) ;
		// Bind read-write elements and add an input change event handler
	container.querySelectorAll( "[data-set]" ).forEach( element => { 
		addElementUpdateBinding( element.getAttribute( "data-set" ), element ) ;
		addFunctionBindings( element.getAttribute( "data-set" ), element.getAttribute( "data-exec" ));
		element.addEventListener( "change", inputChangeHandler )
		} ) ;  
	}
