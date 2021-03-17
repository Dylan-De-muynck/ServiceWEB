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
Template.Recherche.onCreated(function RechercheOnCreated() {
  let ctrlRecherche = this;
  this.search = new ReactiveVar();
  ctrlRecherche.search.set(contentRecherche);
  console.log('data : ' + contentRecherche);
});

Template.Recherche.events({

  'submit form'(event, instance) {
    // increment the counter when button is clicked
    event.preventDefault();
    Tag = event.target.Tag.value;
    let ctrlRecherche = this;
    this.search = new ReactiveVar();
    HTTP.call('GET', '/api/search/' + Tag, {},
        function(error, response) {
          // Handle the error or response here.
          contentRecherche = JSON.parse(response.content).results;

          //console.log('data : ' + contentRecherche);
        });
  },

});

Template.home.helpers({
  movies() {
    return Template.instance().movies.get();
  }

});

Template.Recherche.helpers({
  search(){
    return Template.instance().search.get();
  }
});
