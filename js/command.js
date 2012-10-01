var Command = new Class( {
  
  initialize: function( options ) {
    this.options = options;
  },

  exec: function( args, cb ) {
    cb.call( this.terminal );
  },

  setTerminal: function( terminal ) {
    this.terminal = terminal;
  },

  cout: function( arg ) {
    this.terminal.cout( arg );
  },

  argGiven: function( argc ) {
    if ( arguments.length > 1 ) {
      for ( var i = 1; i <= arguments.length; ++i ) {
        console.log( arguments[ i ] );
        if ( argc.indexOf( arguments[ i ] ) != -1 ) {
          return true;
        };
      }
    }
    return false;
  },
  help: function() {
    this.cout( "\nПо какой-то причине мы поленились написать руководство к этой команде. Даже не знаю по какой )))" );
  }
} );