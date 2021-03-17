import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

let Tag;
let contentRecherche = [{"name": "test"}];
Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});

Template.home.onCreated(function homeOnCreated() {
  let ctrl = this;
  this.movies = new ReactiveVar();
  HTTP.call('GET', '/api/discover/search/', {},
      function(error, response) {
      // Handle the error or response here.
        ctrl.movies.set(JSON.parse(response.content).results);
      });
});

Template.home.events({

  'click button'(event, instance) {
    // increment the counter when button is clicked
    const idMovie = event.currentTarget.dataset.id;
    updateLikeId(idMovie, Template.instance().movies);

  },

});

function updateLikeId(idMovies, movies){
  HTTP.call('GET', '/api/like/' + idMovies, {},
      function(error, response) {
        // Handle the error or response here.
        const index = movies.get().findIndex( function (item) {
          return item.id == JSON.parse(response.content).id;
        });

        if(index < -1){
          let newMoviesList = movies.get();
          newMoviesList[index].like = JSON.parse(response.content).like;
          movies.set(newMoviesList);
        }
        //console.log('data : ' + contentRecherche);
      });

}

Template.Recherche.events({

  'submit form'(event, instance) {
    // increment the counter when button is clicked
    event.preventDefault();
    Tag = event.target.Tag.value;
    const idsearch = event.currentTarget.dataset.id;
    updateSearch(Tag, Template.instance().search);

  },

});

function updateSearch(Tag, search){
  HTTP.call('GET', '/api/search/' + Tag, {},
      function(error, response) {
        // Handle the error or response here.
        let newSearch = search.get();
        newSearch.name = JSON.parse(response.content).name;
        search.set(newSearch);
        //console.log('data : ' + contentRecherche);
      });

}

Template.home.helpers({
  movies() {

    return Template.instance().movies.get();
  }

});

