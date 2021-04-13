import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';
import './Recherche.html';

let Tag;
let GlobalSearchResult;

FlowRouter.route('/', {
    action: function(params, queryParams) {
        BlazeLayout.render('home');
    }
});



    Template.home.onCreated(function homeOnCreated() {
        let ctrl = this;
        this.movies = new ReactiveVar();
        this.titleModal = new ReactiveVar();
        this.poster_path = new ReactiveVar();
        this.videos = new ReactiveVar();

        HTTP.call('GET', '/api/discover/search/', {},
            function(error, response) {
                // Handle the error or response here.
                ctrl.movies.set(JSON.parse(response.content).results);
                GlobalSearchResult = JSON.parse(response.content).results;
            });


           /* //let element = document.querySelector(selector);
            let truncated = document.getElementById('like').innerText;

            if (truncated.length > 200) {
                truncated = truncated.substr(0,200) + '...';
            }*/

//You can then call the function with something like what i have below.
    });

    Template.home.events({

      'click #ButtonLike'(event, instance) {
        // increment the counter when button is clicked
        const idMovie = event.currentTarget.dataset.id;
        updateLikeId(idMovie, Template.instance().movies);

      },
        'click #openModal'(event, instance){
            const idMovie = event.currentTarget.dataset.id;
             let ctrl = Template.instance();
            for (let iMovie = 0; iMovie < GlobalSearchResult.length; iMovie++){
                if (idMovie == GlobalSearchResult[iMovie].id){
                    console.log("movie ----" + GlobalSearchResult[iMovie].title);
                    Template.instance().titleModal.set(GlobalSearchResult[iMovie].title);
                    Template.instance().poster_path.set(GlobalSearchResult[iMovie].poster_path);

                    HTTP.call('GET', '/api/discover/video/' + idMovie, {},
                        function(error, responseVideo) {
                            // Handle the error or response here.
                            let video = JSON.parse(responseVideo.content).results;
                            //console.log(video[0].key);

                            ctrl.videos.set(video[0].key);

                        });
                }
            }


        }

    });

    Template.home.helpers({
        movies() {
            return Template.instance().movies.get();
        },

        titleModal(){
            return Template.instance().titleModal.get();
        },

        pathModal(){
            return Template.instance().poster_path.get();
        },

        videosModal(){
            return Template.instance().videos.get();
        },
        /*overview() {
            var truncated = document.getElementById('like').innerText;

            if (truncated.length > 107) {
                truncated = truncated.substr(0,107) + '...';
            }
        }*/

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

FlowRouter.route('/Recherche/', {
    action: function(params, queryParams) {
        //updateSearch(Object.values(queryParams)[0]);
        BlazeLayout.render('recherche');
    }
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

