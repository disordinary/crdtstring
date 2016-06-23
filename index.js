class CRDTString {
	constructor( str ) {
		this.start = new CRDTSpan( "" , - 1 );
		this.end = new CRDTSpan( "" , -2 );

		this.crdt = new CRDTSpan( str , 1 );

		this.start.joinSpans( this.start , this.crdt );
		this.end.joinSpans( this.crdt , this.end );

		this.length = str.length;
		this.events = [ ];
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
		//	process.nextTick( ( ) => {
				item( event );
		//	 });
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
		console.log( ids );
		return ids;
	}
}

class CRDTSpan {
	constructor( str , id , isNew ) {
		this.next;
		this.prev;
		this.str 	= str;
		this.id		= id;
		this.length = str.length;
		this.isVisible = true;
		this.isNew 	= isNew || false;

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
		
		
		let span = new CRDTSpan( character , id, true );

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

		if( left.length === 0 ) {
			this.joinSpans( item.prev , right );
			this.joinSpans( right , item.next );
			return { left : right.prev , right }
		} else if (right.length === 0 ) {
			this.joinSpans( item.prev , left );
			this.joinSpans( left , item.next );
			return { left , right : left.next }
		} else {
			this.joinSpans( item.prev , left );
			this.joinSpans( right , item.next );
			this.joinSpans( left , right );		
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

			let span = new CRDTSpan( character , ( ( right.id - left_offset_length ) / 2 ) + left_offset_length , true );

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

}

module.exports = function( str ) {
	return new CRDTString( str );
}