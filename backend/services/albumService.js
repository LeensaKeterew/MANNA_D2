const albums = require("../db/albums");
const posts = require("../db/posts");
const { oid } = require("../db/util");
const v = require("../utils/validate");
const { badRequest, notFound } = require("../utils/errors");
const { assertOwnerOrAdmin } = require("./permissions");
const { presentAlbums, presentPosts } = require("./presenters");

async function load(id) {
  const album = await albums.findById(id);
  if (!album) throw notFound("Album not found.");
  return album;
}

async function create(user, body = {}) {
  const album = await albums.create({
    ownerId: user._id,
    name: v.text(body.name, { field: "Album name", required: true, max: 80 }),
    description: v.text(body.description, { field: "Description", max: 500 }),
    hashtags: v.hashtags(body.hashtags),
  });
  return (await presentAlbums([album]))[0];
}

// Album plus its posts (in the order they were added).
async function get(id, viewer) {
  const album = await load(id);
  const [presented] = await presentAlbums([album]);
  const rows = await posts.findByIds(album.postIds);
  const byId = Object.fromEntries(rows.map((p) => [p._id.toString(), p]));
  const ordered = album.postIds.map((pid) => byId[pid.toString()]).filter(Boolean);
  return { ...presented, posts: await presentPosts(ordered, viewer) };
}

async function update(id, user, body = {}) {
  const album = await load(id);
  assertOwnerOrAdmin(user, album.ownerId);
  const fields = {};
  if (body.name !== undefined) fields.name = v.text(body.name, { field: "Album name", required: true, max: 80 });
  if (body.description !== undefined) fields.description = v.text(body.description, { field: "Description", max: 500 });
  if (body.hashtags !== undefined) fields.hashtags = v.hashtags(body.hashtags);
  if (!Object.keys(fields).length) throw badRequest("Nothing to update.");
  const updated = await albums.updateById(album._id, fields);
  return (await presentAlbums([updated]))[0];
}

async function remove(id, user) {
  const album = await load(id);
  assertOwnerOrAdmin(user, album.ownerId);
  await albums.deleteById(album._id);
}

async function addPost(id, user, postId) {
  const album = await load(id);
  assertOwnerOrAdmin(user, album.ownerId);
  const _pid = oid(postId);
  const post = _pid ? await posts.findById(_pid) : null;
  if (!post) throw notFound("Post not found.");
  if (!post.authorId.equals(album.ownerId)) throw badRequest("Only the album owner's own posts can be added.");
  return (await presentAlbums([await albums.addPost(album._id, post._id)]))[0];
}

async function removePost(id, user, postId) {
  const album = await load(id);
  assertOwnerOrAdmin(user, album.ownerId);
  const _pid = oid(postId);
  if (!_pid || !album.postIds.some((p) => p.equals(_pid))) throw notFound("That post is not in this album.");
  return (await presentAlbums([await albums.removePost(album._id, _pid)]))[0];
}

module.exports = { create, get, update, remove, addPost, removePost };
