import { Meteor } from 'meteor/meteor';
import { localData } from './local-data.js';
import { HTTP } from "meteor/http";
import { Mongo } from 'meteor/mongo';
/*

    Faire des recherches par genre/réalisateur/…

    Gestion des favoris/blacklist par profil utilisateur

    Possibilité de noter un film

    Possibilité de recommander un film à un autre utilisateur

    Proposer des suggestions automatiques par genre

 */

// API exemple : https://api.themoviedb.org/3/search/company?api_key=1793c4843a64fbd6fdba88ce08e45c5f&query=interstellar&page=1
let data;
let dataRecherche;

const likesCollection = new Mongo.Collection('likes');

var connectHandler = WebApp.connectHandlers;

Meteor.startup(() => {
  // code to run on server at startup

    connectHandler.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']);
        res.setHeader('Access-Control-Max-Age', '1000');
        res.setHeader('Access-Control-Allow-Headers', ['Content-Type', 'Authorization', 'X-Requested-With']);
        return next();
    });
});

WebApp.connectHandlers.use('/api/discover/search/', (req, res, next) => {
    HTTP.call('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=1793c4843a64fbd6fdba88ce08e45c5f&language=fr-FR', {},
        function(error, response) {
            data = response.data;

                data.results.forEach( function (movieRessource) {
                    //console.log(movieRessource.id.toString());
                    let dbressource = likesCollection.findOne({ id: movieRessource.id.toString() });

                    //console.log(dbressource);
                    if(dbressource){
                        console.log("TEST");
                        movieRessource.like = dbressource.like;
                    } else {
                        movieRessource.like = 0;
                    }
                });

            res.writeHead(200);
            res.write(JSON.stringify(data));
            res.end();
    });

});

//button
WebApp.connectHandlers.use('/api/search/', (req, res, next) => {
    let Tag = req.url.split("/");

    HTTP.call('GET', 'https://api.themoviedb.org/3/search/company?api_key=1793c4843a64fbd6fdba88ce08e45c5f&query=' + Tag[1] + '', {},
        function(error, response) {
            // Handle the error or response here.
            // ctrl.movies.set(JSON.parse(response.content).results)

            dataRecherche = response.content;
        });
    //console.log(dataRecherche);
    res.writeHead(200);
    res.end(dataRecherche);
});

//button
WebApp.connectHandlers.use('/api/like/', (req, res, next) => {

    let like = req.url.split("/")[1];
    let likeResult;
    switch (req.method) {
        case 'GET':
            console.log("GET");
            break;
        case 'PUT':
            console.log("PUT");
            likeResult = updatesLikeMovies(like);
            res.writeHead(200);
            res.write(JSON.stringify(likeResult));

            break;
        default:
            console.log("DEFAULT");
            break;

    }
    console.log("RESULTAT : " + likeResult.like);
    res.end();

});

function updatesLikeMovies(idMovie) {

    let ressource = likesCollection.findOne({id: idMovie.toString()});

    if(ressource) {

        likesCollection.update(
            {_id: ressource._id},
            { $inc: {like: 1}})
    } else {
        likesCollection.insert({id: idMovie, like: 1});

    }

    return likesCollection.findOne({id: idMovie.toString() });

}
