var JSConsole = new Class( {

  initialize: function( options ) {
    this.commandPool = {};
    this.history = [];
    this.sl = "\0";
    this.prompt = options.prompt;
    this.ui = options.ui;
    var self = this;
    this.ui.addEvent( "keydown", function( e ) {
      self.keyPressed.call( self, e )
    });
    this.pprompt( true );
    this.bindSlideDown();
  },

  registerCommand: function( command ) {
    this.commandPool[ command.name ] = command;
    command.setTerminal( this );
  },

  pprompt: function( nofocus ) {
    if ( nofocus == undefined ) nofocus = false;
    if ( this.ui.value.search( this.sl ) != -1 ) {
      this.ui.value += "\n";
    }
    this.ui.value += this.prompt + this.sl;
    console.log( this.ui.value.length );
    if ( !nofocus ) {
      this.setCaretPosition( this.ui.value.length );
      this.ui.scrollTop = this.ui.scrollHeight;
    }
  },

  getInput: function() {
    return this.ui.value.substring( this.searchLast( this.ui.value, this.sl ) + 1, this.ui.value.length );
  },

  searchLast: function( str, reg ) {
    res = -1;
    chunk = 0;
    while ( ( res = str.search( reg ) ) != -1 ) {
      res += 1
      chunk += res;
      str = str.substring( res, str.length );
    }
    return res + chunk;
  },

  keyPressed: function( e ) {
    var input = this.getInput();
    var self = this;
    if ( this.ui.selectionStart <= this.searchLast( this.ui.value, "\0" ) ) {
      e.stop();
      return;
    }
    switch( e.code ) {
      case 13:
        e.stop();
        this.proceed( input, function() { self.pprompt.call( self );
 } );
        break;
      case 8:
        if ( input == "" )
          e.stop();
        break;
      case 75:
        // ⌘ + K || Ctrl + K
        if ( e.meta == true || e.control == true ) {
          e.stop();
          this.ui.value = "";
          this.pprompt();
        }
        break;
      case 67:
        // Ctrl + C
        if ( e.control == true ) {
          this.cout( "^C" );
          this.resetHistoryIndex();
          e.stop();
          this.pprompt();
        }
        break;
      case 37:
      //case 38:
        if ( e.meta == true || e.control == true ) {
          e.stop();
          break;
        }
        break;
      case 38:
        e.stop();
        this.historySearch( -1 );
        break;
      case 40:
        e.stop();
        this.historySearch( 1 );
        break;
      case 46:
        e.stop();
        break;
      case 9:
        this.hint( input );
        e.stop();
        break;
      default:
        break;
    }
  },

  proceed: function( cmd, cb ) {
    if ( cmd == "" ) {
      cb();
      return;
    }
    this.history.push( cmd );
    this.resetHistoryIndex();
    var argv = cmd.split( " " );
    var command = argv[ 0 ];
    var argc = argv.slice( 1 );
    if ( this.commandPool[ command ] == null ) {
      var absolutely = [ "И поныне так", "Безоговорочно", "Вне всяких сомнений", "Совсем", "Вовсе", "Если вы понимаете, о чем я", "Опять", "Кто бы сомневался", "Удивил, ага" ];
      this.cout( "\nКоманда <" + command + "> не найдена. " + absolutely[ Math.floor( Math.random() * absolutely.length ) ] + "." );
      cb();
      return;
    }
    this.commandPool[ command ].exec( argc, cb );
  },

  hint: function( chunk ) {
    if ( chunk == "" ) return;
    var keys = Object.keys( this.commandPool );
    var to_prompt = [];
    Object.each( keys, function( obj ) {
      if ( obj.search( chunk ) === 0 ) to_prompt.push( obj );
    } );
    if ( to_prompt.length == 0 ) return;
    if ( to_prompt.length == 1 ) {
      this.cout( to_prompt[ 0 ].substring( chunk.length, to_prompt[ 0 ].length ) );
      return;
    }
    this.cout( "\n" + to_prompt.join( "\t" ) );
    this.pprompt();
    this.cout( chunk );
  },

  historySearch: function( step ) {
    if ( this.history_index === undefined ) this.resetHistoryIndex();
    if ( this.history_index === null ) {
      this.history_index = this.history.length;
      this.last_input = this.getInput();
    }
    var new_index = this.history_index + step;
    if ( new_index >= 0 && new_index < this.history.length ) {
      this.history_index = new_index;
      this.replaceInputWith( this.history[ this.history_index ] );
    } else if ( new_index == this.history.length ) {
      this.replaceInputWith( this.last_input || "" );
    }
  },

  resetHistoryIndex: function() {
    this.history_index = null;
  },

  replaceInputWith: function( cmd ) {
    var last_pos = this.searchLast( this.ui.value, this.sl ) + 1;
    this.ui.value = this.ui.value.substring( 0, last_pos ) + cmd;
  },

  cout: function( v ) {
    this.ui.value += v;
  },

  // http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
  // thx!
  setCaretPosition: function ( caretPos ) {
    var elem = this.ui;

    if ( elem.createTextRange ) {
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      if ( elem.selectionStart ) {
          elem.focus();
          elem.setSelectionRange(caretPos, caretPos);
      } else
          elem.focus();
    }
  },

  bindSlideDown: function() {
    var _parent = this.ui.getParent();
    _parent.getElements( ".swiper" ).addEvent( "click", function( e ) {
      e.stop();
      _parent.toggleClass( "collapsed" );
    } );
  }
  
} );