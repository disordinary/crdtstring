class CRDTString {
	constructor( str ) {
		this.start = new CRDTSpan( "" , - 1 );
		this.end = new CRDTSpan( "" , -2 );

		this.crdt = new CRDTSpan( str , 0 );

		this.start.joinSpans( this.start , this.crdt );
		this.end.joinSpans( this.crdt , this.end );
	}

	split( offset ) {
		this.start.split( offset );
	}

	insert( offset , character ) {
		this.start.insert( offset , character );
	}

	toString( ) {
		let str = "";
		let item = this.start.next;
		while( item !== this.end ) {
			str += item.str;
			item = item.next;
		}
		return str;
	}
	toSomething( ) {
		let str = "";
		let item = this.start.next;
		while( item !== this.end ) {
			str += "{id:" + item.id + ",str:" + item.str + ",length:" + item.length + "},";
			item = item.next;
		}

		return str;
	}
}

class CRDTSpan {
	constructor( str , id , isNew ) {
		this.next;
		this.prev;
		this.str 	= str;
		this.id		= id;
		this.length = str.length;
		this.isNew 	= isNew || false;
	}

	insert( offset , character ) {
		
		let { left , right } = this.split( offset );
		
		let left_offset_length = left.isNew ? 0 : left.id + left.length;
		
		let span = new CRDTSpan( character , ( ( right.id - left_offset_length ) / 2 ) + left_offset_length , true );

		this.joinSpans( left , span );
		this.joinSpans( span , right );
		
	}
	split( offset ) {
		
		let total = this.length;
		let item = this;
		
		while( offset > total && item.id !== -2 ) {	
			
 			item = item.next;
			total += item.length;		
 			
 			
		}

		if( item.id == -2 ) {
			throw new Error( "Out of bounds." );
		}
		
		let charOffset = item.length - (total - offset );
		

		let left = new CRDTSpan( item.str.substr( 0 , charOffset ) , item.id );
		let right = new CRDTSpan( item.str.substr( charOffset ) , ( item.id + charOffset ) + 1 );

		//need to get rid of left or right if they are null //todo

		this.joinSpans( item.prev , left );
		this.joinSpans( right , item.next );
		this.joinSpans( left , right );
		
		return { 
			left , right
		}
	}

	joinSpans( startSpan , endSpan ) {
		startSpan.next = endSpan;
		endSpan.prev = startSpan;
	}

}

module.exports = function( str ) {
	return new CRDTString( str );
}