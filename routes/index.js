const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Camp = require("../models/campgrounds");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
var middleware = require("../middleware");
var _ = require("lodash");

router.get("/", function(req, res) {
  res.render("landing");
});

//=======================================
// Auth routes
//=======================================

router.get("/register", function(req, res) {
  res.render("register");
});

router.post("/register", changeCase, function(req, res) {
  let newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  });
  if (req.body.adminCode === "admin") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("register");
    } else {
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome " + req.user.username + "!");
        res.redirect("/campgrounds");
      });
    }
  });
});

//Login

router.get("/login", function(req, res) {
  res.render("login");
});

router.post(
  "/login",
  changeCase,
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "login",
    failureFlash: true,
    successFlash: "Welcome back!"
  }),
  function(req, res) {}
);
function changeCase(req, res, next) {
  req.body.firstName = _.upperFirst(req.body.firstName);
  req.body.lastName = _.upperFirst(req.body.lastName);
  req.body.username = _.lowerCase(req.body.username);
  next();
}
// Logout

router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Successfully logged out!");
  res.redirect("/campgrounds");
});

//userprofile

router.get("/profile/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("error", "Could not find user!");
      res.redirect("back");
    }
    Camp.find()
      .where("author.id")
      .equals(foundUser._id)
      .exec(function(err, foundCamp) {
        if (err) {
          req.flash("error", "Could not find!");
          res.redirect("back");
        }
        res.render("user/profile", { user: foundUser, camp: foundCamp });
      });
  });
});

//Edit user profile
router.get("/profile/:id/edit", middleware.isLoggedIn, function(req, res) {
  if (req.params.id === req.user.id) {
    User.findById(req.params.id, function(err, foundUser) {
      _.upperFirst(foundUser.username);
      res.render("user/edit", { user: foundUser });
    });
  } else {
    req.flash("error", "Something went wrong!");
    res.redirect("/profile/" + req.user.id);
  }
});

router.put("/profile/:id", function(req, res) {
  if (req.params.id === req.user.id) {
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, foundUser) {
      if (err) {
        req.flash("error", "could not find user! ODD");
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/profile/" + foundUser.id);
      }
    });
  } else {
    req.flash("error", "Something went wrong!");
    res.redirect("/profile/" + req.user.id);
  }
});

router.get("/forgot", function(req, res) {
  res.render("forgot");
});

router.post("/forgot", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        console.log(req.body.email);

        User.findOne({ email: req.body.email }, function(err, user) {
          console.log(user);

          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "necrokings@gmail.com",
            pass: process.env.GMAILPWD
          }
        });
        var mailOptions = {
          to: user.email,
          from: "necrokings@gmail.com",
          subject: "Camp Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("mail sent");
          req.flash(
            "success",
            "An e-mail has been sent to " + user.email + " with further instructions."
          );
          done(err, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

router.get("/reset/:token", function(req, res) {
  User.findOne(
    { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
    function(err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});

router.post("/reset/:token", function(req, res) {
  console.log("here");
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          function(err, user) {
            if (!user) {
              req.flash("error", "Password reset token is invalid or has expired.");
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect("back");
            }
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "necrokings@gmail.com",
            pass: process.env.GMAILPWD
          }
        });
        var mailOptions = {
          to: user.email,
          from: "necrokings@gmail.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      }
    ],
    function(err) {
      res.redirect("/campgrounds");
    }
  );
});
module.exports = router;
