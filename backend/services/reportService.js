const reports = require("../db/reports");
const reasons = require("../db/reportReasons");
const posts = require("../db/posts");
const v = require("../utils/validate");
const { badRequest, notFound, conflict } = require("../utils/errors");
const { publicUser, userMap } = require("./presenters");
const postService = require("./postService");

const presentReason = (r) => ({ id: r._id.toString(), name: r.name, description: r.description || "" });

const listReasons = async () => (await reasons.list()).map(presentReason);

async function createReason(body = {}) {
  const name = v.text(body.name, { field: "Reason", required: true, max: 80 });
  const description = v.text(body.description, { field: "Description", max: 300 });
  if (await reasons.findByName(name)) throw conflict("That reason already exists.");
  try {
    return presentReason(await reasons.create({ name, description }));
  } catch (err) {
    if (err.code === 11000) throw conflict("That reason already exists.");
    throw err;
  }
}

async function reportPost(user, postId, body = {}) {
  const post = await postService.load(postId);
  if (post.authorId.equals(user._id)) throw badRequest("You cannot report your own post.");
  const reason = await reasons.findById(body.reasonId);
  if (!reason) throw badRequest("Choose a valid reason for the report.");
  const details = v.text(body.details, { field: "Details", max: 500 });
  try {
    await reports.create({ postId: post._id, reporterId: user._id, reasonId: reason._id, details });
  } catch (err) {
    if (err.code === 11000) throw conflict("You have already reported this post.");
    throw err;
  }
}

async function present(rows) {
  if (!rows.length) return [];
  const [people, reasonRows, postRows] = await Promise.all([
    userMap(rows.flatMap((r) => [r.reporterId, r.resolvedBy])),
    reasons.findByIds(rows.map((r) => r.reasonId)),
    posts.findByIds(rows.map((r) => r.postId)),
  ]);
  const reasonById = Object.fromEntries(reasonRows.map((r) => [r._id.toString(), r]));
  const postById = Object.fromEntries(postRows.map((p) => [p._id.toString(), p]));
  return rows.map((r) => {
    const post = postById[r.postId.toString()];
    return {
      id: r._id.toString(),
      status: r.status,
      details: r.details || "",
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt || null,
      reason: reasonById[r.reasonId.toString()] ? presentReason(reasonById[r.reasonId.toString()]) : null,
      reporter: publicUser(people[r.reporterId.toString()]),
      post: post ? { id: post._id.toString(), title: post.title, image: post.image } : null,
    };
  });
}

async function list(status) {
  if (status && !["open", "resolved"].includes(status)) throw badRequest("Status must be open or resolved.");
  return present(await reports.list(status || null));
}

async function resolve(id, admin, body = {}) {
  const note = v.text(body.note, { field: "Note", max: 300 });
  const updated = await reports.resolve(id, admin._id, note);
  if (!updated) throw notFound("Report not found.");
  return (await present([updated]))[0];
}

module.exports = { listReasons, createReason, reportPost, list, resolve };
