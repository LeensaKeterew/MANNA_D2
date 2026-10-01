const { getDb } = require("./connection");
const { oid } = require("./util");

const col = () => getDb().collection("reports");

async function create({ postId, reporterId, reasonId, details }) {
  const doc = { postId, reporterId, reasonId, details, status: "open", createdAt: new Date() };
  const r = await col().insertOne(doc);
  return { ...doc, _id: r.insertedId };
}

async function list(status = null) {
  return col().find(status ? { status } : {}).sort({ createdAt: -1 }).toArray();
}

async function findById(id) {
  const _id = oid(id);
  return _id ? col().findOne({ _id }) : null;
}

async function resolve(id, adminId, note = "") {
  const _id = oid(id);
  if (!_id) return null;
  return col().findOneAndUpdate(
    { _id },
    { $set: { status: "resolved", resolvedAt: new Date(), resolvedBy: adminId, resolutionNote: note } },
    { returnDocument: "after" }
  );
}

const deleteByPost = (postId) => col().deleteMany({ postId });
const deleteByPosts = (postIds) => (postIds.length ? col().deleteMany({ postId: { $in: postIds } }) : null);
const deleteByReporter = (reporterId) => col().deleteMany({ reporterId });

module.exports = { create, list, findById, resolve, deleteByPost, deleteByPosts, deleteByReporter };
