const {MongoClient} = require( 'mongodb' );


const { dbConfig } = require('./../config');

// Connect to MongoDB
const dbUrl = dbConfig.DBURI;
const database = dbConfig.databaseName
let _db;

module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect(dbUrl, function( err, client ) {
      _db = client.db(database);
      return callback( err );
    } );
  },
  
  getDb: function() {
    return _db;
  }
};
