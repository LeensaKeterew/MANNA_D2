const { getDb } = require("./connection");
const { oid } = require("./util");

const col = () => getDb().collection("albums");

async function create({ ownerId, name, description, hashtags }) {
  const doc = { ownerId, name, description, hashtags, postIds: [], createdAt: new Date() };
  const r = await col().insertOne(doc);
  return { ...doc, _id: r.insertedId };
}

async function findById(id) {
  const _id = oid(id);
  return _id ? col().findOne({ _id }) : null;
}

const listByOwner = (ownerId) => col().find({ ownerId }).sort({ createdAt: -1 }).toArray();
const listAll = (limit = 200) => col().find({}).sort({ createdAt: -1 }).limit(limit).toArray();
const findByPost = (postId) => col().findOne({ postIds: postId });

async function updateById(id, fields) {
  const _id = oid(id);
  if (!_id) return null;
  return col().findOneAndUpdate({ _id }, { $set: fields }, { returnDocument: "after" });
}

async function deleteById(id) {
  const _id = oid(id);
  if (!_id) return false;
  const r = await col().deleteOne({ _id });
  return r.deletedCount === 1;
}

const addPost = (id, postId) =>
  col().findOneAndUpdate({ _id: oid(id) }, { $addToSet: { postIds: postId } }, { returnDocument: "after" });

const removePost = (id, postId) =>
  col().findOneAndUpdate({ _id: oid(id) }, { $pull: { postIds: postId } }, { returnDocument: "after" });

const pullPostFromAll = (postId) => col().updateMany({ postIds: postId }, { $pull: { postIds: postId } });
const deleteByOwner = (ownerId) => col().deleteMany({ ownerId });

module.exports = {
  create, findById, listByOwner, listAll, findByPost, updateById, deleteById,
  addPost, removePost, pullPostFromAll, deleteByOwner,
};
