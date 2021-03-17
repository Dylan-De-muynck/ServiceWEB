import { Meteor } from 'meteor/meteor';
import { localData } from './local-data.js';
import { HTTP } from "meteor/http";

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
Meteor.startup(() => {
  // code to run on server at startup
});

WebApp.connectHandlers.use('https://api.themoviedb.org/3/search/company?api_key=1793c4843a64fbd6fdba88ce08e45c5f&query=interstellar&page=1', (req, res, next) => {
    res.writeHead(200);
    res.end(JSON.stringify(localData));
});


WebApp.connectHandlers.use('/api/discover/search/', (req, res, next) => {
    HTTP.call('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=1793c4843a64fbd6fdba88ce08e45c5f&language=fr-FR', {},
        function(error, response) {
            // Handle the error or response here.
            //ctrl.movies.set(JSON.parse(response.content).results)

            data = response.content;
        });
    res.writeHead(200);
    res.end(data);
});

//button
WebApp.connectHandlers.use('/api/search/', (req, res, next) => {
    let Tag = req.url.split("/");

    HTTP.call('GET', 'https://api.themoviedb.org/3/search/company?api_key=1793c4843a64fbd6fdba88ce08e45c5f&query=' + Tag[1] + '&page=1', {},
        function(error, response) {
            // Handle the error or response here.
            //ctrl.movies.set(JSON.parse(response.content).results)

            dataRecherche = response.content;
        });
    console.log(dataRecherche);
    res.writeHead(200);
    res.end(dataRecherche);
});
