class CRDTString {
	constructor( str ) {
		this.start = new CRDTSpan( "" , -1 , false , this );
		this.end = new CRDTSpan( "" , -2 , false , this );

		this.crdt = new CRDTSpan( str , 1 , false , this );

		this.start.joinSpans( this.start , this.crdt );
		this.end.joinSpans( this.crdt , this.end );

		this.length = str.length;
		this.events = [ ];
		this.identifiers = { };
	}

	split( offset ) {
		this.start.split( offset );
	}

	splitAtId( id ) {
		this.start.splitAtId( id );
	}


	delete( offset , length ) {
		let action = this.start.delete( offset , length );
		this.length -= length;
		this.fireEvents( action );
		return action;
	}

	insert( offset , character ) {
		let action = this.start.insert( offset , character );
		this.length++;
		this.fireEvents( action );
		return action; 

	}

	onChange( cb ) {
		return( this.events.push( cb ) );
	}

	fireEvents( event ) {
		this.events.forEach( ( item ) => {
			process.nextTick( ( ) => {
				item( event );
			 });
		} );
	}

	toString( showHidden ) {
		let str = "";
		let item = this.start.next;
		while( item !== this.end ) {
			if( item.isVisible || showHidden ) {
				str += item.str;	
			}
			item = item.next;
		}
		return str;
	}
	toDebug( ) {
		let str = "";
		let item = this.start.next;
		while( item !== this.end ) {
			str += "{id:" + item.id + ",str:" + item.str + ",length:" + item.length + ",isNew:" + item.isNew + ",isVisible:" + item.isVisible + "},";
			item = item.next;
		}

		return str;
	}
	toId( ) {
		let ids = [ ];
		let item = this.start.next;
		while( item !== this.end ) {
		
			ids.push( item.id );
			item = item.next
		}
		return ids;
	}


	updateIdentifier( id ) {

		if( this.identifiers.hasOwnProperty( id ) ) {
			this.getIdentifier( id , true );
		}
	}


	getIdentifierAtOffset( offset , update ) {
		return this.start.getIdentifierAtOffset( offset , update );
	
	}

	getIdentifier( id , update ) {
		return this.start.getIdentifier( id , update );
	}

	getSlice( start , end ) {
		return new CRDTSlice( start , end );
	}



	onSplit( old , newLeft , newRight ) {
		if( !old.isNew && old.length > 1 ) {
			for( let i = 0; i < old.length; i++ ) {
				this.updateIdentifier( old.id + i );
			}
		} else {
			this.updateIdentifier( old.id );
		}
	}
}

class CRDTSpan {
	constructor( str , id , isNew , parent ) {
		this.next;
		this.prev;
		this.str 	= str;
		this.id		= id;
		this.length = str.length;
		this.isVisible = true;
		this.isNew 	= isNew || false;
		this.parent = parent;
	
	}

	insert( offset , character ) {
		
		let { left , right } = this.split( offset );
		
		let left_offset_length = left.isNew ? left.id : left.id + left.length;

		if( left.isNew ) {
			//console.log( right.id , left.id , )
		}

		let id = ( ( right.id - left_offset_length ) / 2 ) + left_offset_length;
		
		//we can't halve 0
		if( right.id === left_offset_length ) {
			id = right.id - .5;
		}
		
		if( right.id < 0 ) { //if we're at the end then we actually do whole numbers and not fractions
			id = left.id + left.length;
		}
		let span = new CRDTSpan( character , id, true , left.parent);

		this.joinSpans( left , span );
		this.joinSpans( span , right );

		return { verb : 'add' , operation : span.serialise( ) }
	}

	delete( offset , length ) {
		length = length || 1;
		let start = this.split( offset );
		let end = start.right.split( length );

		let item = start.left.next;
		while( item != end.left ) {
			item.isVisible = false;
			item = item.next;
		}
		item.isVisible = false;

		return { verb : 'del' , operation : item.serialise( ) }
	}

	split( offset ) {
		
		let total = this.length;
		let item = this;
		
		while( offset > total && item.id !== -2 ) {	
 			item = item.next;
			total += item.length;		
		}
		
		let charOffset = item.length - (total - offset );
		

		if( item.id == -2  ) { //after end
			item = item.prev;
			charOffset = item.length;
		} else if ( item.id == -1 ) { //before start
			item = item.next;
			charOffset = 0;
		}


		let left = new CRDTSpan( item.str.substr( 0 , charOffset ) , item.id );
		let right = new CRDTSpan( item.str.substr( charOffset ) , ( item.id + charOffset ) + 1 );


		//also copy new, ownership, and tombstone info
		
		left.isNew = item.isNew;
		right.isNew = item.isNew;
		left.isVisible = item.isVisible;
		right.isVisible = item.isVisible;
		left.parent = item.parent;
		right.parent = item.parent;

		if( left.length === 0 ) {
			this.joinSpans( item.prev , right );
			this.joinSpans( right , item.next );
			this.parent.onSplit( item , left , right );
			return { left : right.prev , right }
		} else if (right.length === 0 ) {
			this.joinSpans( item.prev , left );
			this.joinSpans( left , item.next );
			this.parent.onSplit( item , left , right );
			return { left , right : left.next }
		} else {
			this.joinSpans( item.prev , left );
			this.joinSpans( right , item.next );
			this.joinSpans( left , right );		
			this.parent.onSplit( item , left , right );
			return { 
				left , right
			}
		}
	}



	insertAtId( id ) {

		//if the id is a fraction then it's a newly inserted character
		
		if( id !== Math.round( id ) ) {
			let item = this;
			while( item.id < id ) {
				item = item.next;
			}

			let span = new CRDTSpan( character , ( ( right.id - left_offset_length ) / 2 ) + left_offset_length , true , item.parent );

			this.joinSpans( item , span );
			return;
		}
	}

	splitAtId( id ) {
		let item = this;
		while( item.id + item.length < id ) {
			item = item.next;
		}

		console.log( item.id );
	}

	joinSpans( startSpan , endSpan ) {
		startSpan.next = endSpan;
		endSpan.prev = startSpan;
	}

	serialise( ) {
		return {
			id : this.id, str : this.str, visible : this.isVisible
		};
	}


	getIdentifierAtOffset( offset , update ) {
		
		if( this.parent.identifiers.hasOwnProperty( id ) && !update ) {
			return this.parent.identifiers[ id ];
		} else {


			let total = this.length;
			let item = this;
			
			while( offset > total && item.id !== -2 ) {	
	 			item = item.next;
				total += item.length;		
			}
			
			let charOffset = item.length - (total - offset );
			

			if( item.id == -2  ) { //after end
				item = item.prev;
				charOffset = item.length;
			} else if ( item.id == -1 ) { //before start
				item = item.next;
				charOffset = 0;
			}
			let id = item.id;

			if( this.parent.identifiers.hasOwnProperty( id ) ) {
				this.parent.identifiers[ id ].item = item;
				this.parent.identifiers[ id ].offset = charOffset;
			} else {
				this.parent.identifiers[ id ] = new identifier( id , item , charOffset )
			}
		}

		return this.parent.identifiers[ id ];
	
	}

	getIdentifier( id , update ) {
	
		if( this.parent.identifiers.hasOwnProperty( id ) && !update ) {
			return this.parent.identifiers[ id ];
		} else {


			
			let item = this;
			
			while( item.next.id <= id && item.next.id !== -2 ) {
				item = item.next;
			
			}

			
			let charOffset = item.isNew ? 0 : id - item.id;
			
			
			if( this.parent.identifiers.hasOwnProperty( id ) ) {
			
				this.parent.identifiers[ id ].item = item;
				this.parent.identifiers[ id ].offset = charOffset;
			} else {
				
				this.parent.identifiers[ id ] = new identifier( id , item , charOffset )
			}
		}

		return this.parent.identifiers[ id ];
	
	}

}

//an identifier is an object which identifies a piece of the CRDT,
//it is guaranteed to be updated when an event happens so it is always in sync.
class identifier {
	constructor( key , item , offset_within_item ) {
		this.key  = key
		this.item = item;
		this.offset = offset_within_item;
	}
}

//a slice of a CRDT string, guaranteed to be consistant as the CRDT updates
//todo allow offsets and identifiers
class CRDTSlice {
	constructor( start_identifier , end_identifier ) {
		this.start = start_identifier;
		this.end = end_identifier;
	}

	toString( show_hidden ) {
		
		let str = "";
		
		let item = this.start.item;
		while( item !== this.end.item.next) {
			if( item.isVisible || showHidden ) {
				if( this.start.item == this.end.item  ) {
			
					str += item.str.substring( this.start.offset , this.end.offset );

				} else if( item == this.start.item ) {
				
					str += item.str.substring( this.start.offset );
				} else if( item == this.end.item ) {
				
					str += item.str.substring( 0 , this.end.offset + 1 );
				} else {
				
					str += item.str;	
				}
			
			}
		
			
			item = item.next;
		}
		return str;
	}

	insert( offset , character , ignore_hidden ) {
		ignore_hidden = ignore_hidden || true;
		let item = this.start.item;
		item.insert( offset , character , ignore_hidden )
	}

	//go from back to front and front to back until it finds the change set
	insertDiff( new_string ) {

	}
}
module.exports = function( str ) {
	return new CRDTString( str );
}