var require = meteorInstall({"server":{"local-data.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// server/local-data.js                                                                                //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
module.export({
  localData: () => localData
});
const localData = {
  "page": 1,
  "results": [{
    "backdrop_path": "/3ombg55JQiIpoPnXYb2oYdr6DtP.jpg",
    "genre_ids": [878, 28],
    "id": 560144,
    "original_language": "en",
    "original_title": "Skylines",
    "overview": "Lorsqu'un virus menace de retourner les hybrides extraterrestres maintenant amicaux",
    "popularity": 3957.023,
    "poster_path": "/2W4ZvACURDyhiNnSIaFPHfNbny3.jpg",
    "release_date": "2020-10-25",
    "title": "Skylines",
    "video": false,
    "vote_average": 5.9,
    "vote_count": 120
  }],
  "total_pages": 500,
  "total_results": 10000
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// server/main.js                                                                                      //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let localData;
module.link("./local-data.js", {
  localData(v) {
    localData = v;
  }

}, 1);
let HTTP;
module.link("meteor/http", {
  HTTP(v) {
    HTTP = v;
  }

}, 2);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 3);

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
Meteor.startup(() => {// code to run on server at startup
});
WebApp.connectHandlers.use('/api/discover/search/', (req, res, next) => {
  HTTP.call('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=1793c4843a64fbd6fdba88ce08e45c5f&language=fr-FR', {}, function (error, response) {
    data = response.content;
    data.results.forEach(function (movieRessource) {
      movieRessource.like = likeCollection.find(function (likeRessource) {
        return movieRessource.id === likeRessource.id;
      }) ? likeCollection.find(function (likeRessource) {
        return movieRessource.id === likeRessource.id;
      }).like : 0;
    });
  });
  res.writeHead(200);
  res.end(data);
}); //button

WebApp.connectHandlers.use('/api/search/', (req, res, next) => {
  let Tag = req.url.split("/");
  HTTP.call('GET', 'https://api.themoviedb.org/3/search/company?api_key=1793c4843a64fbd6fdba88ce08e45c5f&query=' + Tag[1] + '', {}, function (error, response) {
    // Handle the error or response here.
    //ctrl.movies.set(JSON.parse(response.content).results)
    dataRecherche = response.content;
  });
  console.log(dataRecherche);
  res.writeHead(200);
  res.end(dataRecherche);
}); //button

WebApp.connectHandlers.use('/api/like/', (req, res, next) => {
  let like = req.url.split("/");
  Messages.insert({
    like: like[1]
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2xvY2FsLWRhdGEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsImxvY2FsRGF0YSIsIk1ldGVvciIsImxpbmsiLCJ2IiwiSFRUUCIsIk1vbmdvIiwiZGF0YSIsImRhdGFSZWNoZXJjaGUiLCJsaWtlQ29sbGVjdGlvbiIsIkNoYXRyb29tcyIsIkNvbGxlY3Rpb24iLCJNZXNzYWdlcyIsInN0YXJ0dXAiLCJXZWJBcHAiLCJjb25uZWN0SGFuZGxlcnMiLCJ1c2UiLCJyZXEiLCJyZXMiLCJuZXh0IiwiY2FsbCIsImVycm9yIiwicmVzcG9uc2UiLCJjb250ZW50IiwicmVzdWx0cyIsImZvckVhY2giLCJtb3ZpZVJlc3NvdXJjZSIsImxpa2UiLCJmaW5kIiwibGlrZVJlc3NvdXJjZSIsImlkIiwid3JpdGVIZWFkIiwiZW5kIiwiVGFnIiwidXJsIiwic3BsaXQiLCJjb25zb2xlIiwibG9nIiwiaW5zZXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUFDQyxXQUFTLEVBQUMsTUFBSUE7QUFBZixDQUFkO0FBQU8sTUFBTUEsU0FBUyxHQUFHO0FBQ3JCLFVBQVEsQ0FEYTtBQUVyQixhQUFXLENBQ1A7QUFDSSxxQkFBaUIsa0NBRHJCO0FBRUksaUJBQWEsQ0FDVCxHQURTLEVBRVQsRUFGUyxDQUZqQjtBQU1JLFVBQU0sTUFOVjtBQU9JLHlCQUFxQixJQVB6QjtBQVFJLHNCQUFrQixVQVJ0QjtBQVNJLGdCQUFZLHFGQVRoQjtBQVVJLGtCQUFjLFFBVmxCO0FBV0ksbUJBQWUsa0NBWG5CO0FBWUksb0JBQWdCLFlBWnBCO0FBYUksYUFBUyxVQWJiO0FBY0ksYUFBUyxLQWRiO0FBZUksb0JBQWdCLEdBZnBCO0FBZ0JJLGtCQUFjO0FBaEJsQixHQURPLENBRlU7QUFzQnJCLGlCQUFlLEdBdEJNO0FBdUJyQixtQkFBaUI7QUF2QkksQ0FBbEIsQzs7Ozs7Ozs7Ozs7QUNBUCxJQUFJQyxNQUFKO0FBQVdILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGVBQVosRUFBNEI7QUFBQ0QsUUFBTSxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsVUFBTSxHQUFDRSxDQUFQO0FBQVM7O0FBQXBCLENBQTVCLEVBQWtELENBQWxEO0FBQXFELElBQUlILFNBQUo7QUFBY0YsTUFBTSxDQUFDSSxJQUFQLENBQVksaUJBQVosRUFBOEI7QUFBQ0YsV0FBUyxDQUFDRyxDQUFELEVBQUc7QUFBQ0gsYUFBUyxHQUFDRyxDQUFWO0FBQVk7O0FBQTFCLENBQTlCLEVBQTBELENBQTFEO0FBQTZELElBQUlDLElBQUo7QUFBU04sTUFBTSxDQUFDSSxJQUFQLENBQVksYUFBWixFQUEwQjtBQUFDRSxNQUFJLENBQUNELENBQUQsRUFBRztBQUFDQyxRQUFJLEdBQUNELENBQUw7QUFBTzs7QUFBaEIsQ0FBMUIsRUFBNEMsQ0FBNUM7QUFBK0MsSUFBSUUsS0FBSjtBQUFVUCxNQUFNLENBQUNJLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNHLE9BQUssQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNFLFNBQUssR0FBQ0YsQ0FBTjtBQUFROztBQUFsQixDQUEzQixFQUErQyxDQUEvQzs7QUFJN007QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLElBQUlHLElBQUo7QUFDQSxJQUFJQyxhQUFKO0FBQ0EsTUFBTUMsY0FBYyxHQUFHLEVBQXZCO0FBRUEsTUFBTUMsU0FBUyxHQUFHLElBQUlKLEtBQUssQ0FBQ0ssVUFBVixDQUFxQixXQUFyQixDQUFsQjtBQUNBLE1BQU1DLFFBQVEsR0FBRyxJQUFJTixLQUFLLENBQUNLLFVBQVYsQ0FBcUIsVUFBckIsQ0FBakI7QUFFQVQsTUFBTSxDQUFDVyxPQUFQLENBQWUsTUFBTSxDQUNuQjtBQUNELENBRkQ7QUFLQUMsTUFBTSxDQUFDQyxlQUFQLENBQXVCQyxHQUF2QixDQUEyQix1QkFBM0IsRUFBb0QsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEVBQVdDLElBQVgsS0FBb0I7QUFDcEVkLE1BQUksQ0FBQ2UsSUFBTCxDQUFVLEtBQVYsRUFBaUIscUdBQWpCLEVBQXdILEVBQXhILEVBQ0ksVUFBU0MsS0FBVCxFQUFnQkMsUUFBaEIsRUFBMEI7QUFDdEJmLFFBQUksR0FBR2UsUUFBUSxDQUFDQyxPQUFoQjtBQUVBaEIsUUFBSSxDQUFDaUIsT0FBTCxDQUFhQyxPQUFiLENBQXFCLFVBQVVDLGNBQVYsRUFBMEI7QUFDNUNBLG9CQUFjLENBQUNDLElBQWYsR0FBc0JsQixjQUFjLENBQUNtQixJQUFmLENBQW9CLFVBQVVDLGFBQVYsRUFBeUI7QUFDaEUsZUFBT0gsY0FBYyxDQUFDSSxFQUFmLEtBQXNCRCxhQUFhLENBQUNDLEVBQTNDO0FBQWdELE9BRDdCLElBRWxCckIsY0FBYyxDQUFDbUIsSUFBZixDQUFvQixVQUFVQyxhQUFWLEVBQXlCO0FBQzlDLGVBQU9ILGNBQWMsQ0FBQ0ksRUFBZixLQUFzQkQsYUFBYSxDQUFDQyxFQUEzQztBQUFnRCxPQUQvQyxFQUNpREgsSUFIL0IsR0FHc0MsQ0FINUQ7QUFJQyxLQUxKO0FBTUMsR0FWVDtBQVdBVCxLQUFHLENBQUNhLFNBQUosQ0FBYyxHQUFkO0FBQ0FiLEtBQUcsQ0FBQ2MsR0FBSixDQUFRekIsSUFBUjtBQUNILENBZEQsRSxDQWdCQTs7QUFDQU8sTUFBTSxDQUFDQyxlQUFQLENBQXVCQyxHQUF2QixDQUEyQixjQUEzQixFQUEyQyxDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsSUFBWCxLQUFvQjtBQUMzRCxNQUFJYyxHQUFHLEdBQUdoQixHQUFHLENBQUNpQixHQUFKLENBQVFDLEtBQVIsQ0FBYyxHQUFkLENBQVY7QUFFQTlCLE1BQUksQ0FBQ2UsSUFBTCxDQUFVLEtBQVYsRUFBaUIsZ0dBQWdHYSxHQUFHLENBQUMsQ0FBRCxDQUFuRyxHQUF5RyxFQUExSCxFQUE4SCxFQUE5SCxFQUNJLFVBQVNaLEtBQVQsRUFBZ0JDLFFBQWhCLEVBQTBCO0FBQ3RCO0FBQ0E7QUFFQWQsaUJBQWEsR0FBR2MsUUFBUSxDQUFDQyxPQUF6QjtBQUNILEdBTkw7QUFPQWEsU0FBTyxDQUFDQyxHQUFSLENBQVk3QixhQUFaO0FBQ0FVLEtBQUcsQ0FBQ2EsU0FBSixDQUFjLEdBQWQ7QUFDQWIsS0FBRyxDQUFDYyxHQUFKLENBQVF4QixhQUFSO0FBQ0gsQ0FiRCxFLENBZUE7O0FBQ0FNLE1BQU0sQ0FBQ0MsZUFBUCxDQUF1QkMsR0FBdkIsQ0FBMkIsWUFBM0IsRUFBeUMsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEVBQVdDLElBQVgsS0FBb0I7QUFDekQsTUFBSVEsSUFBSSxHQUFHVixHQUFHLENBQUNpQixHQUFKLENBQVFDLEtBQVIsQ0FBYyxHQUFkLENBQVg7QUFFQXZCLFVBQVEsQ0FBQzBCLE1BQVQsQ0FBZ0I7QUFBQ1gsUUFBSSxFQUFFQSxJQUFJLENBQUMsQ0FBRDtBQUFYLEdBQWhCO0FBRUgsQ0FMRCxFIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgbG9jYWxEYXRhID0ge1xyXG4gICAgXCJwYWdlXCI6IDEsXHJcbiAgICBcInJlc3VsdHNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgXCJiYWNrZHJvcF9wYXRoXCI6IFwiLzNvbWJnNTVKUWlJcG9QblhZYjJvWWRyNkR0UC5qcGdcIixcclxuICAgICAgICAgICAgXCJnZW5yZV9pZHNcIjogW1xyXG4gICAgICAgICAgICAgICAgODc4LFxyXG4gICAgICAgICAgICAgICAgMjhcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgXCJpZFwiOiA1NjAxNDQsXHJcbiAgICAgICAgICAgIFwib3JpZ2luYWxfbGFuZ3VhZ2VcIjogXCJlblwiLFxyXG4gICAgICAgICAgICBcIm9yaWdpbmFsX3RpdGxlXCI6IFwiU2t5bGluZXNcIixcclxuICAgICAgICAgICAgXCJvdmVydmlld1wiOiBcIkxvcnNxdSd1biB2aXJ1cyBtZW5hY2UgZGUgcmV0b3VybmVyIGxlcyBoeWJyaWRlcyBleHRyYXRlcnJlc3RyZXMgbWFpbnRlbmFudCBhbWljYXV4XCIsXHJcbiAgICAgICAgICAgIFwicG9wdWxhcml0eVwiOiAzOTU3LjAyMyxcclxuICAgICAgICAgICAgXCJwb3N0ZXJfcGF0aFwiOiBcIi8yVzRadkFDVVJEeWhpTm5TSWFGUEhmTmJueTMuanBnXCIsXHJcbiAgICAgICAgICAgIFwicmVsZWFzZV9kYXRlXCI6IFwiMjAyMC0xMC0yNVwiLFxyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiU2t5bGluZXNcIixcclxuICAgICAgICAgICAgXCJ2aWRlb1wiOiBmYWxzZSxcclxuICAgICAgICAgICAgXCJ2b3RlX2F2ZXJhZ2VcIjogNS45LFxyXG4gICAgICAgICAgICBcInZvdGVfY291bnRcIjogMTIwXHJcbiAgICAgICAgfSxcclxuICAgIF0sXHJcbiAgICBcInRvdGFsX3BhZ2VzXCI6IDUwMCxcclxuICAgIFwidG90YWxfcmVzdWx0c1wiOiAxMDAwMFxyXG59O1xyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGxvY2FsRGF0YSB9IGZyb20gJy4vbG9jYWwtZGF0YS5qcyc7XG5pbXBvcnQgeyBIVFRQIH0gZnJvbSBcIm1ldGVvci9odHRwXCI7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG4vKlxuXG4gICAgRmFpcmUgZGVzIHJlY2hlcmNoZXMgcGFyIGdlbnJlL3LDqWFsaXNhdGV1ci/igKZcblxuICAgIEdlc3Rpb24gZGVzIGZhdm9yaXMvYmxhY2tsaXN0IHBhciBwcm9maWwgdXRpbGlzYXRldXJcblxuICAgIFBvc3NpYmlsaXTDqSBkZSBub3RlciB1biBmaWxtXG5cbiAgICBQb3NzaWJpbGl0w6kgZGUgcmVjb21tYW5kZXIgdW4gZmlsbSDDoCB1biBhdXRyZSB1dGlsaXNhdGV1clxuXG4gICAgUHJvcG9zZXIgZGVzIHN1Z2dlc3Rpb25zIGF1dG9tYXRpcXVlcyBwYXIgZ2VucmVcblxuICovXG5cbi8vIEFQSSBleGVtcGxlIDogaHR0cHM6Ly9hcGkudGhlbW92aWVkYi5vcmcvMy9zZWFyY2gvY29tcGFueT9hcGlfa2V5PTE3OTNjNDg0M2E2NGZiZDZmZGJhODhjZTA4ZTQ1YzVmJnF1ZXJ5PWludGVyc3RlbGxhciZwYWdlPTFcbmxldCBkYXRhO1xubGV0IGRhdGFSZWNoZXJjaGU7XG5jb25zdCBsaWtlQ29sbGVjdGlvbiA9IFtdO1xuXG5jb25zdCBDaGF0cm9vbXMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbignY2hhdHJvb21zJyk7XG5jb25zdCBNZXNzYWdlcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdtZXNzYWdlcycpO1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIC8vIGNvZGUgdG8gcnVuIG9uIHNlcnZlciBhdCBzdGFydHVwXG59KTtcblxuXG5XZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgnL2FwaS9kaXNjb3Zlci9zZWFyY2gvJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgSFRUUC5jYWxsKCdHRVQnLCAnaHR0cHM6Ly9hcGkudGhlbW92aWVkYi5vcmcvMy9kaXNjb3Zlci9tb3ZpZT9hcGlfa2V5PTE3OTNjNDg0M2E2NGZiZDZmZGJhODhjZTA4ZTQ1YzVmJmxhbmd1YWdlPWZyLUZSJywge30sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmNvbnRlbnQ7XG5cbiAgICAgICAgICAgIGRhdGEucmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChtb3ZpZVJlc3NvdXJjZSkge1xuICAgICAgICAgICAgICAgbW92aWVSZXNzb3VyY2UubGlrZSA9IGxpa2VDb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24gKGxpa2VSZXNzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtb3ZpZVJlc3NvdXJjZS5pZCA9PT0gbGlrZVJlc3NvdXJjZS5pZDsgfSkgP1xuICAgICAgICAgICAgICAgICAgIGxpa2VDb2xsZWN0aW9uLmZpbmQoZnVuY3Rpb24gKGxpa2VSZXNzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtb3ZpZVJlc3NvdXJjZS5pZCA9PT0gbGlrZVJlc3NvdXJjZS5pZDsgfSkubGlrZSA6IDA7XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIHJlcy53cml0ZUhlYWQoMjAwKTtcbiAgICByZXMuZW5kKGRhdGEpO1xufSk7XG5cbi8vYnV0dG9uXG5XZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgnL2FwaS9zZWFyY2gvJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgbGV0IFRhZyA9IHJlcS51cmwuc3BsaXQoXCIvXCIpO1xuXG4gICAgSFRUUC5jYWxsKCdHRVQnLCAnaHR0cHM6Ly9hcGkudGhlbW92aWVkYi5vcmcvMy9zZWFyY2gvY29tcGFueT9hcGlfa2V5PTE3OTNjNDg0M2E2NGZiZDZmZGJhODhjZTA4ZTQ1YzVmJnF1ZXJ5PScgKyBUYWdbMV0gKyAnJywge30sXG4gICAgICAgIGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBlcnJvciBvciByZXNwb25zZSBoZXJlLlxuICAgICAgICAgICAgLy9jdHJsLm1vdmllcy5zZXQoSlNPTi5wYXJzZShyZXNwb25zZS5jb250ZW50KS5yZXN1bHRzKVxuXG4gICAgICAgICAgICBkYXRhUmVjaGVyY2hlID0gcmVzcG9uc2UuY29udGVudDtcbiAgICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coZGF0YVJlY2hlcmNoZSk7XG4gICAgcmVzLndyaXRlSGVhZCgyMDApO1xuICAgIHJlcy5lbmQoZGF0YVJlY2hlcmNoZSk7XG59KTtcblxuLy9idXR0b25cbldlYkFwcC5jb25uZWN0SGFuZGxlcnMudXNlKCcvYXBpL2xpa2UvJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgbGV0IGxpa2UgPSByZXEudXJsLnNwbGl0KFwiL1wiKTtcblxuICAgIE1lc3NhZ2VzLmluc2VydCh7bGlrZTogbGlrZVsxXX0pO1xuXG59KTtcbiJdfQ==
