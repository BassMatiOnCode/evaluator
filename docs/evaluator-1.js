//		evaluator-1.js    2023-05-27    usp

const createError = function ( message = "There was an error...", fname = "" ) {
	return new Error ( `evaluator.js:${fname}: ${message}` );
	}

export class Evaluator {
	constructor ( options = { } ) {
			// Create the bindings container objects
		this.updateBindings = { } ;
		this.functionBindings = { } ;
			// Process options
			// Scope object for accessing variables and functions
		this.scope = options.scope || globalThis ;
		if ( typeof options.container === "string" ) options.container = document.getElementById( options.container );
		this.container = options.container || document ;
			// Bind read-only elements to a variable
		this.container.querySelectorAll( "[data-get]" )
			.forEach( element => this.addElementUpdateBinding( element.getAttribute( "data-get" ), element )) ;
			// Bind read-write elements and add an input change event handler
		this.container.querySelectorAll( "[data-set]" ).forEach( element => { 
				// Add update binding
			this.addElementUpdateBinding( element.getAttribute( "data-set" ), element ) ;
				// Add function call bindings
			this.addFunctionBindings( element.getAttribute( "data-set" ), element.getAttribute( "data-exec" ));
				// Add change event handler
			element.addEventListener( "change", this.inputChangeHandler.bind( this ));
			} ) ;  
		}
	set ( name, value ) {
		//// Sets a variable and updates bound properties.
			// Bail out if nothing to do.
		if ( this.scope[ name ] === value ) return value ;
			// Set the variable
		this.scope[ name ] = value ;
		console.info ( `evaluator.js:set(): ${name} = ${value}` );
			// Update bound properties
		let bindings = this.updateBindings[ name ] || [ ] ;
		for ( let binding of bindings ) binding.object [ binding.property ] = value ;
			// Call bound functions
		bindings = this.functionBindings[ name ] || [ ] ;
		for ( const fn of bindings ) {
			try { fn.call( this.scope ); }
				// Errors logged but don't break script execution
			catch( e ){ console.log( e ); }
			}
		return value;
		}
	get ( name ) { 
		/// Returns the value of the specified scope member.
		/// This can be a variable, an object, or a function.
		return this.scope[ name ] ;
		}
	addElementUpdateBinding( name, element ) {
		////	Binds an element attribute or property to a variable for updating
		if ( element.hasAttribute( "data-member" )) {
			this.addPropertyBinding( name, element, element.getAttribute( "data-member" ));
			}
		else if ( element.hasAttribute( "data-attrib" )) {
			this.addPropertyBinding( name, element.attributes[ element.getAttribute( "data-attrib" )], "value" ) ;
			}
		else throw createError( "No update attribute or property specified.", "addElementUpdateBinding" );  // TODO: Decide if we can exit silently or throw an error here. 
		}
	addPropertyBinding ( name, objectReference, propertyName ) {
			// Get the binding for the named variable
		const bindings = this.updateBindings[ name ] || ( this.updateBindings[ name ] = [ ] );
			// Prevent multiple references to the same target.
		for ( const binding of bindings ) if ( binding.object === objectReference && binding.property === propertyName ) return ;
			// Add the element reference to the binding.
		bindings.push( { object : objectReference, property : propertyName } );
		console.info( `evaluator.js:addPropertyBinding(): ${name}, ${objectReference.id || objectReference.name || (objectReference.getAttribute && objectReference.getAttribute("name")) || objectReference}, ${propertyName}`);
		}
	addFunctionBindings ( name, functions ) {
		////	Binds a list of functions to a variable name
			// Make sure that functions is an array
		if ( ! functions ) return; 
		if ( typeof functions === "string" ) functions = functions.split( /\s*,\s*/ ) ;
			// Get existing function bindings for the variable
		const bindings = this.functionBindings[ name ] || (this.functionBindings[ name ] = [ ] );
			// Iterate over incoming function names
		for ( const fn of functions ) { 
			addCallBinding : {
					// Prevent duplicate function bindings
				for ( const binding of bindings ) if ( binding.name === fn ) break addCallBinding ;
					// Add the new function call binding
				console.info( `evaluator.js:addFunctionBindings(): ${name}, ${fn}` );
				bindings.push( this.scope[ fn ] );
		}	}	}
	inputChangeHandler( evt ) {
			// Get the bound object
		const name = evt.target.getAttribute( "data-set" );
		const value = evt.target.hasAttribute( "data-attrib" ) ? 
			evt.target.getAttribute( evt.target.getAttribute( "data-attrib" )) : 
			evt.target[ evt.target.getAttribute( "data-member" )] ;
			// Set its value
		this.set( name, value );
		}
	}
