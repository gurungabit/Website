var express = require("express");
var router = express.Router();
var Camp = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);
//ShOW - gets all camps from database and shows
router.get("/campgrounds", function(req, res) {
  if (req.query.search && req.query.search.length > 0) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Camp.find(
      { $or: [{ name: regex }, { location: regex }, { "author.username": regex }] },
      function(err, camp) {
        if (err || camp.length < 1) {
          req.flash("error", "Could not find any camps with that query!");
          res.redirect("back");
        } else {
          res.render("campgrounds/index", { campgrounds: camp });
        }
      }
    );
  } else {
    Camp.find({}, function(err, camp) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", { campgrounds: camp });
      }
    });
  }
});

//CREATE - add new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var price = req.body.price;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name,
      image: image,
      price: price,
      description: desc,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    };
    // Create a new campground and save to DB
    Camp.create(newCampground, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        //redirect back to campgrounds page
        req.flash("success", "Successfully created!");
        res.redirect("/campgrounds");
      }
    });
  });
});

//NEW - show form to create new camp
router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

//SHOW - shows more info about each camp
router.get("/campgrounds/:id", function(req, res) {
  Camp.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCamp) {
      if (err || !foundCamp) {
        req.flash("error", "Campground does not exist!");
        res.redirect("/campgrounds");
      } else {
        res.render("campgrounds/show", { campgrounds: foundCamp });
      }
    });
});

router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(
  req,
  res
) {
  Camp.findById(req.params.id, function(err, foundCamp) {
    if (err || !foundCamp) {
      req.flash("error", "Campground does not exist!");
      res.redirect("/campgrounds");
    } else {
      res.render("campgrounds/edit", { campgrounds: foundCamp });
    }
  });
});

// UPDATE CAMPGROUND ROUTE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.camp.lat = data[0].latitude;
    req.body.camp.lng = data[0].longitude;
    req.body.camp.location = data[0].formattedAddress;

    Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, campground) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});

router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(
  req,
  res
) {
  Camp.findByIdAndRemove(req.params.id, function(err, removedCamp) {
    if (err) {
      req.flash("error", "You do not have permission to do that!");
      res.redirect("/campgrounds");
    } else {
      Comment.deleteMany({ _id: { $in: removedCamp.comments } }, function(err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/campgrounds");
        }
      });
      req.flash("success", "Successfully deleted!");
    }
  });
});
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = router;
