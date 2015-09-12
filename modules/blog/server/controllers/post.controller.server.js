'use strict';

var path = require('path');

var db = require(path.resolve('./lib/db.js'));

exports.createPost = createPost;
exports.deletePost = deletePost;
exports.getPosts = getPosts;
exports.getPostById = getPostById;
exports.sendPost = sendPost;
exports.updatePost = updatePost;

//////////

/**
 * Get all posts from the database.
 *
 * @param {ExpressRequestObject} req The request object generated by express.
 * @param {ExpressResponseObject} res The response object generated by express.
 */

function createPost (req, res) {
  var post = {};
  post.content = req.body.content;
  post.title = req.body.title;

  checkUserAndPost(req.user);

  //////////

  function checkUserAndPost (user) {
    if (!user) {
      res.status(401).send('Authentication Error');
    } else {
      post.UserId = user.id;
      db.Post.create(post)
        .then(sendCreatedPost)
        .catch(send500);
    }
  }

  function sendCreatedPost (post) {
    res.status(200).send(post);
  }
  function send500 () {
    res.status(500).send('Database Error: Page could not be Created');
  }
}

function deletePost (req, res) {

  checkUserAndDelete(req.user);

  //////////

  function checkUserAndDelete (user) {
    if (!user) {
      res.status(401).send('Authentication Error');
    } else {
      db.Post.destroy({ where: { id: req.post.id } })
        .then(sendSuccess)
        .catch(send500);
    }
  }

  function sendSuccess (post) {
    res.sendStatus(200);
  }

  function send500 () {
    res.status(500).send('Database Error: Post could not be deleted.');
  }
}

function getPosts (req, res) {
  db.Post.findAll()
    .then(sendPosts)
    .catch(send500);

  //////////

  function sendPosts (posts) {
    res.send(posts);
  }

  function send500 () {
    res.status(500).send('A database error occured.');
  }
}

/**
 * Gets a post by a given id
 *
 * @param {ExpressRequestObject} req The request object generated by express.
 * @param {ExpressResponseObject} res The response object generated by express.
 * @param {function} next
 * @param {string} id The post id given in the route
 */

function getPostById (req, res, next, id) {
  var postQuery = {
    where: {
      id: id
    }
  };

  db.Post.findOne(postQuery)
    .then(goToNextOrRespond)
    .catch(send404);

  //////////

  function goToNextOrRespond (post) {
    req.post = post;
    if(!next){
      res.send(post);
    } else {
      next();
    }
  }

  function send404 () {
    res.status(404).send('No Post Found');
  }
}

function sendPost (req, res){
  res.send(req.post);
}

function updatePost (req, res) {
  var post = {};
  post.title = req.body.title || req.post.title;
  post.content = req.body.content || req.post.content;
  var postQuery = {
    where: {
      id: req.post.id
    }
  };

  checkUserAndUpdate(req.user);

  //////////

  function checkUserAndUpdate (user) {
    if (!user) {
      res.status(401).send('Authentication Error');
    } else {
      post.UserId = user.id;
      db.Post.update(post, postQuery)
        .then(findUpdatedPost)
        .then(sendUpdatedPost)
        .catch(send500);
    }
  }

  function findUpdatedPost () {
    var postQuery = {
      where: {
        id: req.post.id
      }
    };
    return db.Post.findOne(postQuery);
  }

  function sendUpdatedPost (post) {
    res.status(200).send(post);
  }

  function send500 () {
    res.status(500).send('Database Error: Post could not be updated');
  }
}
