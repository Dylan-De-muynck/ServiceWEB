var require = meteorInstall({"client":{"main.html":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// client/main.html                                                                   //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
module.link("./template.main.js", { "*": "*+" });

////////////////////////////////////////////////////////////////////////////////////////

},"template.main.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// client/template.main.js                                                            //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //

Template.body.addContent((function() {
  var view = this;
  return [ HTML.Raw("<h1>Welcome to Meteor!</h1>\n\n  "), Spacebars.include(view.lookupTemplate("hello")), "\n  ", Spacebars.include(view.lookupTemplate("info")), "\n  ", Spacebars.include(view.lookupTemplate("home")), "\n  ", Spacebars.include(view.lookupTemplate("Recherche")) ];
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("hello");
Template["hello"] = new Template("Template.hello", (function() {
  var view = this;
  return [ HTML.Raw("<button>Click Me</button>\n  "), HTML.P("You've pressed the button ", Blaze.View("lookup:counter", function() {
    return Spacebars.mustache(view.lookup("counter"));
  }), " times.") ];
}));

Template.__checkName("info");
Template["info"] = new Template("Template.info", (function() {
  var view = this;
  return HTML.Raw('<h2>Learn Meteor!</h2>\n  <ul>\n    <li><a href="https://www.meteor.com/try" target="_blank">Do the Tutorial</a></li>\n    <li><a href="http://guide.meteor.com" target="_blank">Follow the Guide</a></li>\n    <li><a href="https://docs.meteor.com" target="_blank">Read the Docs</a></li>\n    <li><a href="https://forums.meteor.com" target="_blank">Discussions</a></li>\n  </ul>');
}));

Template.__checkName("home");
Template["home"] = new Template("Template.home", (function() {
  var view = this;
  return [ HTML.Raw("<h1>Movies List</h1>\n    "), Blaze.Each(function() {
    return Spacebars.call(view.lookup("movies"));
  }, function() {
    return [ "\n        ", HTML.H3(Blaze.View("lookup:title", function() {
      return Spacebars.mustache(view.lookup("title"));
    })), "\n        ", HTML.LI(Blaze.View("lookup:overview", function() {
      return Spacebars.mustache(view.lookup("overview"));
    })), "\n        ", HTML.IMG({
      src: function() {
        return [ "https://www.themoviedb.org/t/p/w440_and_h660_face", Spacebars.mustache(view.lookup("poster_path")) ];
      }
    }), "\n        ", HTML.BUTTON({
      "data-id": function() {
        return Spacebars.mustache(view.lookup("id"));
      }
    }, "Like"), "\n        ", HTML.P("Like: ", Blaze.View("lookup:like", function() {
      return Spacebars.mustache(view.lookup("like"));
    })), "\n    " ];
  }) ];
}));

Template.__checkName("Recherche");
Template["Recherche"] = new Template("Template.Recherche", (function() {
  var view = this;
  return [ HTML.FORM("\n        ", HTML.Raw('<input type="text" placeholder="Recherche ..." name="Tag">'), "\n        ", HTML.Raw('<input type="submit" value="Recherche">'), "\n        ", HTML.Raw("<h1>Recherche</h1>"), "\n        ", Blaze.Each(function() {
    return Spacebars.call(view.lookup("search"));
  }, function() {
    return [ "\n            ", HTML.H3(Blaze.View("lookup:page", function() {
      return Spacebars.mustache(view.lookup("page"));
    })), "\n        " ];
  }), "\n    "), "\n\n    ", HTML.P(Blaze.View("lookup:searchhh", function() {
    return Spacebars.mustache(view.lookup("searchhh"));
  })) ];
}));

////////////////////////////////////////////////////////////////////////////////////////

},"main.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// client/main.js                                                                     //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
let Template;
module.link("meteor/templating", {
  Template(v) {
    Template = v;
  }

}, 0);
let ReactiveVar;
module.link("meteor/reactive-var", {
  ReactiveVar(v) {
    ReactiveVar = v;
  }

}, 1);
let HTTP;
module.link("meteor/http", {
  HTTP(v) {
    HTTP = v;
  }

}, 2);
module.link("./main.html");
let Tag;
let contentRecherche = [{
  "name": "test"
}];
Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});
Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  }

});
Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  }

});
Template.home.onCreated(function homeOnCreated() {
  let ctrl = this;
  this.movies = new ReactiveVar();
  HTTP.call('GET', '/api/discover/search/', {}, function (error, response) {
    // Handle the error or response here.
    ctrl.movies.set(JSON.parse(response.content).results);
  });
});
Template.home.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    const idMovie = event.currentTarget.dataset.id;
    updateLikeId(idMovie, Template.instance().movies);
  }

});

function updateLikeId(idMovies, movies) {
  HTTP.call('GET', '/api/like/' + idMovies, {}, function (error, response) {
    // Handle the error or response here.
    const index = movies.get().findIndex(function (item) {
      return item.id == JSON.parse(response.content).id;
    });

    if (index < -1) {
      let newMoviesList = movies.get();
      newMoviesList[index].like = JSON.parse(response.content).like;
      movies.set(newMoviesList);
    } //console.log('data : ' + contentRecherche);

  });
}

Template.Recherche.events({
  'submit form'(event, instance) {
    // increment the counter when button is clicked
    event.preventDefault();
    Tag = event.target.Tag.value;
    const idsearch = event.currentTarget.dataset.id;
    updateSearch(Tag, Template.instance().search);
  }

});

function updateSearch(Tag, search) {
  HTTP.call('GET', '/api/search/' + Tag, {}, function (error, response) {
    // Handle the error or response here.
    let newSearch = search.get();
    newSearch.name = JSON.parse(response.content).name;
    search.set(newSearch); //console.log('data : ' + contentRecherche);
  });
}

Template.home.helpers({
  movies() {
    return Template.instance().movies.get();
  }

});
////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".css"
  ]
});

var exports = require("/client/main.js");