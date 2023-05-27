//		evaluator-1.js    2023-05-27    usp

export class evaluator {
	constructor ( options = { } ) {
		if ( options.container ) {
			this.container = options.container ;
			if ( typof options.container === "string" ) this.container = document.getElementById( options.container ) ;
			else this.container = options.container;
			}
		else this.container = document;
		}
	}

	// Bindings associate variables with elements.
export const updateBindings = { } ;
export const functionBindings = { } ;
var scope ;

export function set ( name, value ) {
	//// Sets a variable and updates bound properties.
		// Bail out if nothing to do.
	if ( scope[ name ] === value ) return value ;
		// Set the variable
	scope[ name ] = value ;
	console.info ( `evaluator:set(): ${name} = ${value}` );
		// Update bound properties
	let bindings = updateBindings[ name ] || [ ] ;
	for ( let binding of bindings ) binding.object [ binding.property ] = value ;
		// Call bound functions
	bindings = functionBindings[ name ] || [ ] ;
	for ( const fn of bindings ) {
		try { fn.call( scope ); }
			// Errors logged but don't break script execution
		catch( e ){ console.log( e ); }
		}
	return value;
	}
export function inputChangeHandler( evt ) {
		// Get the bound object
	const name = evt.target.getAttribute( "data-set" );
	const value = evt.target.hasAttribute( "data-attrib" ) ? 
		evt.target.getAttribute( evt.target.getAttribute( "data-attrib" )) : 
		evt.target[ evt.target.getAttribute( "data-member" )] ;
		// Set its value
	set( name, value );
	}
export function addFunctionBindings ( name, functions ) {
	////	Binds a list of functions to a variable name
		// Make sure that functions is an array of functions
	if ( ! functions ) return; 
	if ( typeof functions === "string" ) functions = functions.split( /\s*,\s*/ ) ;
		// Get the function bindings for the variable name
	const bindings = functionBindings[ name ] || (functionBindings[ name ] = [ ] );
		// Iterate over incoming function names
	for ( const fn of functions ) { 
		addCallBinding : {
				// Prevent duplicate function bindings
			for ( const binding of bindings ) if ( binding.name === fn ) break addCallBinding ;
				// Add the new function call binding
			console.info( `evaluator:addFunctionBindings: ${name}, ${fn}` );
			bindings.push( scope[ fn ] );
	}	}	}
export function addPropertyBinding ( name, objectReference, propertyName ) {
		// Get the binding for the named variable
	const bindings = updateBindings[ name ] || ( updateBindings[ name ] = [ ] );
		// Prevent multiple references to the same target.
	for ( const binding of bindings ) if ( binding.object === objectReference && binding.property === propertyName ) return ;
		// Add the element reference to the binding.
	bindings.push( { object : objectReference, property : propertyName } );
	console.info( `evaluator:addPropertyBinding: ${name}, ${objectReference.id || objectReference.name || (objectReference.getAttribute && objectReference.getAttribute("name")) || objectReference}, ${propertyName}`);
	}
export function addElementUpdateBinding( name, element ) {
	////	Binds an element attribute or property to a variable for updating
	if ( element.hasAttribute( "data-member" )) {
		addPropertyBinding( name, element, element.getAttribute( "data-member" ));
		}
	else if ( element.hasAttribute( "data-attrib" )) {
		addPropertyBinding( name, element.attributes[ element.getAttribute( "data-attrib" )], "value" ) ;
		}
	else throw new Error( "evaluator.js:initPage(): No update attribute or property specified." );  // TODO: Decide if we can exit silently or throw an error here. 
	}
export function initPage ( options = { } ) {
		// Process the options
	scope = options.scope || globalThis ;
	if ( typeof options.container === "string" ) options.container = document.getElementById( options.container );
	const container = options.container || document ;
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
