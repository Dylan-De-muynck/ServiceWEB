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

Template.recherche.onCreated(function homeOnCreated(){
    let ctrl = this;
    this.page = new ReactiveVar();
    ctrl.page.set();
});
function updateLikeId(idMovies, movies){

    HTTP.call('PUT', 'http://localhost:3000/api/like/' + idMovies, {},
        function(error, response) {
            // Handle the error or response here.
            const index = movies.get().findIndex( function (item) {
                return item.id.toString() === JSON.parse(response.content).id;
            });

            console.log(index);

            if(index > -1){
                console.log("index" + response.content);
                let newMoviesList = movies.get();

                console.log("INDEX");

                newMoviesList[index].like = JSON.parse(response.content).like;

                movies.set(newMoviesList);
            }
            //console.log('data : ' + contentRecherche);
        });
}

Template.recherche.events({

  'submit form'(event, instance) {
    // increment the counter when button is clicked
    event.preventDefault();
    Tag = event.target.Tag.value;
    const idsearch = event.currentTarget.dataset.id;
    updateSearch(Tag, Template.instance().page);

  },

});

function updateSearch(Tag, search){
  HTTP.call('PUT', 'http://localhost:3000/api/search/' + Tag, {},
      function(error, response) {
        // Handle the error or response here.
          console.log("test : " + response.content);
          let Nsearch = new ReactiveVar();
          //let newsearch = search.get();
          Nsearch.page = JSON.parse(response.content).page;
          search.set(Nsearch);
        //console.log('data : ' + contentRecherche);
      });

}

Template.recherche.helpers({
    search() {
        return Template.instance().page.get();
    }
});

Template.home.helpers({
  movies() {
    return Template.instance().movies.get();
  }

});

