// Dependencies
var mongoose        = require('mongoose');
var User            = require('./model.js');


// Opens App Routes
module.exports = function(app) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all users in the db
    app.get('/users', function(req, res){

        // Uses Mongoose schema to run the search (empty conditions)
        var query = User.find({});
        query.exec(function(err, users){
            if(err) {
                res.send(err);
            } else {
                // If no errors are found, it responds with a JSON of all users
                res.json(users);
            }
        });
    });

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new users in the db
    app.post('/users', function(req, res){

        // Creates a new User based on the Mongoose schema and the post bo.dy
        var newuser = new User(req.body);

        // New User is saved in the db.
        newuser.save(function(err){
            if(err)
                res.send(err);
            else
                // If no errors are found, it responds with a JSON of the new user
                res.json(req.body);
        });
    });

    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/query/', function(req, res){

        // Grab all of the query parameters from the body.
        var lat             = req.body.latitude;
        var long            = req.body.longitude;
        var distance        = req.body.distance;
        var studio          = req.body.studio;
        var two             = req.body.two;
        var tree            = req.body.tree;
        var four            = req.body.four;
        var five            = req.body.five;
        var minPrice        = req.body.minPrice;
        var maxPrice        = req.body.maxPrice;
        var minArea         = req.body.minArea;
        var maxArea         = req.body.maxArea;
        var description     = req.body.description;
        var phone           = req.body.phone;
        var reqVerified     = req.body.reqVerified;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = User.find({});

        // ...include filter by Max Distance (converting miles to meters)
        if(distance){

            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({ center: {type: 'Point', coordinates: [long, lat]},

                // Converting meters to miles. Specifying spherical geometry (for globe)
                maxDistance: distance * 1609.34, spherical: true});

        }

        // ...include filter by rooms (all options)
        if(two || tree || four || five || studio ){
            query.or([{ 'rooms': two }, { 'rooms': tree }, {'rooms': four} ,{'rooms': five}, {'rooms': studio}]);
        }

        // ...include filter by Min price
        if(minPrice){
            query = query.where('price').gte(minPrice);
        }

        // ...include filter by Max price
        if(maxPrice){
            query = query.where('price').lte(maxPrice);
        }

         // ...include filter by Min price
        if(minArea){
            query = query.where('area').gte(minArea);
        }

        // ...include filter by Max price
        if(maxArea){
            query = query.where('area').lte(maxArea);
        }

        // ...include filter for HTML5 Verified Locations
        if(reqVerified){
            query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
        }

        // Execute Query and Return the Query Results
        query.exec(function(err, users){
            if(err)
                res.send(err);
            else
                // If no errors, respond with a JSON of all users that meet the criteria
                res.json(users);
        });
    });

    // DELETE Routes (Dev Only)
    // --------------------------------------------------------
    // Delete a User off the Map based on objID
    app.delete('/users/:objID', function(req, res){
        var objID = req.params.objID;
        var update = req.body;

        User.findByIdAndRemove(objID, update, function(err, user){
            if(err)
                res.send(err);
            else
                res.json(req.body);
        });
    });
};
