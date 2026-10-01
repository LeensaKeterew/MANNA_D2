const users = require("../db/users");
const posts = require("../db/posts");
const albums = require("../db/albums");
const comments = require("../db/comments");
const reports = require("../db/reports");
const friends = require("../db/friends");
const messages = require("../db/messages");

// Deleting a post removes everything that hangs off it.
async function deletePost(postId) {
  await Promise.all([comments.deleteByPost(postId), reports.deleteByPost(postId), albums.pullPostFromAll(postId)]);
  return posts.deleteById(postId);
}

// Deleting a user removes their posts, albums, comments, reports, likes, friendships and messages.
async function deleteUser(userId) {
  const postIds = await posts.idsByAuthor(userId);
  await Promise.all([
    comments.deleteByPosts(postIds),
    reports.deleteByPosts(postIds),
    ...postIds.map((id) => albums.pullPostFromAll(id)),
  ]);
  await posts.deleteByAuthor(userId);
  await Promise.all([
    albums.deleteByOwner(userId),
    comments.deleteByAuthor(userId),
    reports.deleteByReporter(userId),
    posts.pullLikesBy(userId),
    friends.deleteAllFor(userId),
    messages.deleteAllFor(userId),
  ]);
  return users.deleteById(userId);
}

module.exports = { deletePost, deleteUser };
