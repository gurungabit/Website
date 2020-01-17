const mongoose = require("mongoose");
const Camp = require("./models/campgrounds");
const Comment = require("./models/comment");

let data = [
  {
    name: "San Antonio",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Downtown_San_Antonio_Skyline_at_Night_in_2019.jpg",
    description:
      "Vivamus arcu orci, vehicula ac placerat et, porttitor molestie ex. Mauris scelerisque leo leo, quis dapibus magna tempus a. Proin condimentum quis est nec scelerisque. Fusce tristique quam ac vestibulum ultricies. Aenean eros mi, egestas vel eros a, bibendum pretium urna. Sed lorem purus, ornare quis semper ac, scelerisque eget libero. Integer ac felis mi. Sed consectetur, nisi a iaculis semper, dolor lorem eleifend justo, in vulputate leo elit a elit. Aliquam nisl justo, facilisis a ante non, vulputate fermentum massa. Cras a ipsum vitae metus volutpat porta. Donec suscipit lectus lorem, sed congue quam rutrum et. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos."
  },
  {
    name: "San Antonio",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Downtown_San_Antonio_Skyline_at_Night_in_2019.jpg",
    description:
      "Vivamus arcu orci, vehicula ac placerat et, porttitor molestie ex. Mauris scelerisque leo leo, quis dapibus magna tempus a. Proin condimentum quis est nec scelerisque. Fusce tristique quam ac vestibulum ultricies. Aenean eros mi, egestas vel eros a, bibendum pretium urna. Sed lorem purus, ornare quis semper ac, scelerisque eget libero. Integer ac felis mi. Sed consectetur, nisi a iaculis semper, dolor lorem eleifend justo, in vulputate leo elit a elit. Aliquam nisl justo, facilisis a ante non, vulputate fermentum massa. Cras a ipsum vitae metus volutpat porta. Donec suscipit lectus lorem, sed congue quam rutrum et. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos."
  },
  {
    name: "San Antonio",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Downtown_San_Antonio_Skyline_at_Night_in_2019.jpg",
    description:
      "Vivamus arcu orci, vehicula ac placerat et, porttitor molestie ex. Mauris scelerisque leo leo, quis dapibus magna tempus a. Proin condimentum quis est nec scelerisque. Fusce tristique quam ac vestibulum ultricies. Aenean eros mi, egestas vel eros a, bibendum pretium urna. Sed lorem purus, ornare quis semper ac, scelerisque eget libero. Integer ac felis mi. Sed consectetur, nisi a iaculis semper, dolor lorem eleifend justo, in vulputate leo elit a elit. Aliquam nisl justo, facilisis a ante non, vulputate fermentum massa. Cras a ipsum vitae metus volutpat porta. Donec suscipit lectus lorem, sed congue quam rutrum et. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos."
  }
];

function seeds() {
  //Rempve camps
  Camp.deleteMany({}, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("removed camps");
    }
  });
  // data.forEach(function(seed) {
  //   Camp.create(seed, function(err, campground) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log("Added Camp");
  //       Comment.create(
  //         {
  //           text: "This place is great, but I wish there was internet",
  //           author: "Homer"
  //         },
  //         function(err, comment) {
  //           if (err) {
  //             console.log(err);
  //           } else {
  //             campground.comments.push(comment);
  //             campground.save();
  //             console.log("Created new comment");
  //           }
  //         }
  //       );
  //     }
  //   });
  // });
}

module.exports = seeds;
