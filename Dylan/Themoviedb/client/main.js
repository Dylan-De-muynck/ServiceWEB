import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';
import './Recherche.html';

let Tag;

FlowRouter.route('/', {
    action: function(params, queryParams) {
        BlazeLayout.render('home');
    }
});

FlowRouter.route('/Recherche/', {
    action: function(params, queryParams) {
        BlazeLayout.render('recherche');
    }
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

    Template.home.helpers({
        movies() {
            return Template.instance().movies.get();
        }

    });

Template.recherche.onCreated(function homeOnCreated(){
    let ctrl = this;
    this.search = new ReactiveVar();
    ctrl.search.set();
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
    updateSearch(Tag, Template.instance().search);

  },

});

function updateSearch(Tag, search){
  HTTP.call('PUT', 'http://localhost:3000/api/search/' + Tag, {},
      function(error, response) {
        // Handle the error or response here.
          console.log("test : " + JSON.parse(response.content).results);
          //let newsearch = search.get();
          let Nsearch = JSON.parse(response.content).results;
          search.set(Nsearch);
        //console.log('data : ' + contentRecherche);
      });

}

Template.recherche.helpers({
    search() {
        return Template.instance().search.get();
    }
});

