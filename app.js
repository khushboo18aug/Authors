
const express = require('express');
const app = express();

const cors = require('cors');

const { MongoClient } = require('mongodb');
const { dbConfig } = require('./config');

// const mongodbutil = require( './utils/db' );
// const server = express();


// Connect to MongoDB
const dbUrl = dbConfig.DBURI;
const database = dbConfig.databaseName
app.use(cors());


  // Error Handling
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});


// app.all('*', (req,res) => {
//     res.json({
//         status:400,
//         errorCode: null,
//         errorMessage: 'Bad Request',
//         payload: null
//     })
// });

// // server setup
const server = app.listen(dbConfig.serverPort, () => {
  const port = server.address().port;
})
  const port = dbConfig.serverPort;

  MongoClient.connect(dbUrl, { useNewUrlParser: true , useUnifiedTopology: true },(err, client) => {
    if (err) {
      console.error(err)
      return
    } else {

      const db = client.db(database);
      const bookCollection = db.collection('books');
      const authorCollection = db.collection('authors')

      console.log(`App is listening on port ${port}, connected to ${database} database`);

      // Get details of authors by number of awards >=n
      app.get('/details/award', (req, res) => {
        const {n: awardCount} = req.query;

        // Prepare query object
        const query = [
          { $group : {_id : "$author", count :{ $sum : "$award"}}},
          { $match : { count : { "$gte" :  +awardCount} } }
        ]

        bookCollection.aggregate(query).toArray((error, result) => {
          if(error) {
            return res.status(500).send(error);
          }
          res.send(result);
        });
      });

      // Get details of authors by year >=n
      app.get('/details/year', (req, res) => {
        const {y: year} = req.query;

         // Prepare query object
        const query = {
          year: { $gte: +year },
          award: { $gt: 0 }
        }

        bookCollection.find(query).toArray((error, result) => {
            if(error) {
              return res.status(500).send(error);
            }
            res.send(result);
          });
      });

      // Get details of authors by profit
      app.get('/details/profit', (req, res) => {

         // Prepare query object
        const query = [
          {
            $project: {
              author: 1,
              SP: 1,
              profit: { $multiply : ["$SP", "$totalCopies"] }
            }
          },
          { 
            $group : {
              _id : "$author", 
              totalBooksSold: {$sum: "$SP"},
              totalProfit: {$sum: "$profit"},
            }
          }]

        bookCollection.aggregate(query).toArray((error, result) => {
          if(error) {
            return res.status(500).send(error);
          }
          res.send(result);
        });
      })


      //Get details of authors by book sold
      app.get('/details/dob', (req, res) => {

        const {birthDate, totalPrice} = req.query;

        // Prepare query object
        const query = [
           {
            $match : {
              dob :{$gte :new Date(birthDate)} 
            }
          },
          {
            $lookup:
            {
              from: "books",
              localField: "_id",
              foreignField: "author",
              as: "books"
            }
          },
          { 
            $project: {
              author:1,
              totalPrice: { $sum : "$books.SP" }
           }
          },
          {
            $match: {
              totalPrice : {$gte : +totalPrice}
            }
          }]

        authorCollection.aggregate(query).toArray((error, result) => {
          if(error) {
            return res.status(500).send(error);
          }
          res.send(result);
        });
      })
    }
  })