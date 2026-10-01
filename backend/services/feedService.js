const posts = require("../db/posts");
const friends = require("../db/friends");
const users = require("../db/users");
const { badRequest } = require("../utils/errors");
const { presentPosts, publicUser } = require("./presenters");

async function authorScope(user, scope) {
  if (!["local", "global"].includes(scope)) throw badRequest("Scope must be local or global.");
  if (scope === "global") return null;
  return [user._id, ...(await friends.friendIds(user._id))];
}

// Local = you + your friends. Global = everyone. Newest first.
async function feed(user, scope = "local", limit = 50) {
  const authorIds = await authorScope(user, scope);
  const rows = await posts.list({ authorIds, limit: Math.min(Number(limit) || 50, 100) });
  return presentPosts(rows, user);
}

async function trending(user, scope = "local") {
  const authorIds = await authorScope(user, scope);
  return (await posts.topHashtags(authorIds)).map((t) => ({ tag: t._id, count: t.count }));
}

async function search(user, query) {
  const q = String(query || "").trim();
  if (!q) return { posts: [], users: [] };
  if (q.length > 80) throw badRequest("Search is too long.");
  const [postRows, userRows] = await Promise.all([posts.search(q, 6), users.search(q.replace(/^#/, ""), 4)]);
  return { posts: await presentPosts(postRows, user), users: userRows.map(publicUser) };
}

module.exports = { feed, trending, search };
