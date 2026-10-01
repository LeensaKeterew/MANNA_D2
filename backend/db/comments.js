const { getDb } = require("./connection");
const { oid } = require("./util");

const col = () => getDb().collection("comments");

async function create({ postId, authorId, text }) {
  const doc = { postId, authorId, text, createdAt: new Date() };
  const r = await col().insertOne(doc);
  return { ...doc, _id: r.insertedId };
}

async function findById(id) {
  const _id = oid(id);
  return _id ? col().findOne({ _id }) : null;
}

async function updateText(id, text) {
  const _id = oid(id);
  if (!_id) return null;
  return col().findOneAndUpdate({ _id }, { $set: { text, editedAt: new Date() } }, { returnDocument: "after" });
}

const listByPost = (postId) => col().find({ postId }).sort({ createdAt: 1 }).toArray();
const listRecent = (limit = 100) => col().find({}).sort({ createdAt: -1 }).limit(limit).toArray();

async function deleteById(id) {
  const _id = oid(id);
  if (!_id) return false;
  const r = await col().deleteOne({ _id });
  return r.deletedCount === 1;
}

const deleteByPost = (postId) => col().deleteMany({ postId });
const deleteByPosts = (postIds) => (postIds.length ? col().deleteMany({ postId: { $in: postIds } }) : null);
const deleteByAuthor = (authorId) => col().deleteMany({ authorId });

async function countsByPosts(postIds) {
  if (!postIds.length) return {};
  const rows = await col()
    .aggregate([{ $match: { postId: { $in: postIds } } }, { $group: { _id: "$postId", n: { $sum: 1 } } }])
    .toArray();
  return Object.fromEntries(rows.map((r) => [r._id.toString(), r.n]));
}

module.exports = {
  create, findById, updateText, listByPost, listRecent, deleteById, deleteByPost, deleteByPosts, deleteByAuthor, countsByPosts,
};
