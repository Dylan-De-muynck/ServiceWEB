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
const likeCollection = [];

const Chatrooms = new Mongo.Collection('chatrooms');
const Messages = new Mongo.Collection('messages');

Meteor.startup(() => {
  // code to run on server at startup
});


WebApp.connectHandlers.use('/api/discover/search/', (req, res, next) => {
    HTTP.call('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=1793c4843a64fbd6fdba88ce08e45c5f&language=fr-FR', {},
        function(error, response) {
            data = response.content;

            data.results.forEach(function (movieRessource) {
               movieRessource.like = likeCollection.find(function (likeRessource) {
                  return movieRessource.id === likeRessource.id; }) ?
                   likeCollection.find(function (likeRessource) {
                  return movieRessource.id === likeRessource.id; }).like : 0;
               });
            });
    res.writeHead(200);
    res.end(data);
});

//button
WebApp.connectHandlers.use('/api/search/', (req, res, next) => {
    let Tag = req.url.split("/");

    HTTP.call('GET', 'https://api.themoviedb.org/3/search/company?api_key=1793c4843a64fbd6fdba88ce08e45c5f&query=' + Tag[1] + '', {},
        function(error, response) {
            // Handle the error or response here.
            //ctrl.movies.set(JSON.parse(response.content).results)

            dataRecherche = response.content;
        });
    console.log(dataRecherche);
    res.writeHead(200);
    res.end(dataRecherche);
});

//button
WebApp.connectHandlers.use('/api/like/', (req, res, next) => {
    let like = req.url.split("/");

    Messages.insert({like: like[1]});

});
