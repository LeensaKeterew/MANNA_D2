// Idempotent seed: safe to run any number of times. Existing records are left
// untouched; only missing demo records are inserted.
//   node seed.js        (or: npm run seed)
const path = require("path");
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  /* variables come from the environment (Docker) */
}

const bcrypt = require("bcryptjs");
const { connect, getDb, close } = require("./db/connection");
const { DEFAULT_SETTINGS } = require("./db/users");

const ADMIN_PASSWORD = "Admin123!";
const USER_PASSWORD = "Password123!";
const at = (day, hour = 10, minute = 0) => new Date(Date.UTC(2026, 8, day, hour, minute));

const USERS = [
  { username: "manna_admin", email: "admin@manna.test", name: "Manna Admin", role: "admin", password: ADMIN_PASSWORD,
    avatar: "https://i.pravatar.cc/150?img=68", bio: "Keeping the Manna table tidy and welcoming for everyone." },
  { username: "miriam_okafor", email: "miriam@manna.test", name: "Miriam Okafor", role: "user", password: USER_PASSWORD,
    avatar: "https://i.pravatar.cc/150?img=47",
    bio: "Home cook & faith-driven foodie 🍞❤️ Sharing recipes that nourish body and soul. “For the Lord your God is bringing you into a good land…” — Deuteronomy 8:7" },
  { username: "david_mensah", email: "david@manna.test", name: "David Mensah", role: "user", password: USER_PASSWORD,
    avatar: "https://i.pravatar.cc/150?img=12", bio: "Garden-to-table cooking and Sunday stews." },
  { username: "ruth_adeyemi", email: "ruth@manna.test", name: "Ruth Adeyemi", role: "user", password: USER_PASSWORD,
    avatar: "https://i.pravatar.cc/150?img=32", bio: "Grain bowls, gratitude and good company." },
  { username: "samuel_obi", email: "samuel@manna.test", name: "Samuel Obi", role: "user", password: USER_PASSWORD,
    avatar: "https://i.pravatar.cc/150?img=51", bio: "Baker. Sabbath loaves every Friday." },
  { username: "esther_kimani", email: "esther@manna.test", name: "Esther Kimani", role: "user", password: USER_PASSWORD,
    avatar: "https://i.pravatar.cc/150?img=25", bio: "Fresh salads inspired by the fruit of the Promised Land." },
];

const POSTS = [
  { key: "p1", author: "miriam_okafor", when: at(14), title: "Honey & Herb Roasted Chicken",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=900",
    text: "Marinated overnight in raw honey, rosemary, thyme, and garlic, then slow-roasted until the skin is caramelized and the meat falls off the bone.",
    verse: { text: "Taste and see that the Lord is good; blessed is the one who takes refuge in him.", reference: "Psalm 34:8" },
    hashtags: ["#HolyBread", "#FaithFood"], likedBy: ["david_mensah", "ruth_adeyemi", "samuel_obi"] },
  { key: "p2", author: "david_mensah", when: at(13), title: "Lentil & Olive Harvest Stew",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900",
    text: "A hearty, humble stew built from lentils, olive oil, and whatever the garden gave this week.",
    verse: { text: "Give us this day our daily bread.", reference: "Matthew 6:11" },
    hashtags: ["#GardenHarvest", "#PsalmsAndSoups"], likedBy: ["miriam_okafor", "ruth_adeyemi"] },
  { key: "p3", author: "ruth_adeyemi", when: at(12), title: "Garden Grain Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900",
    text: "Roasted chickpeas, greens, and radish over herbed grains — a bowl of gratitude.",
    verse: { text: "", reference: "" }, hashtags: ["#GardenHarvest", "#GraceAtTable"], likedBy: ["miriam_okafor"] },
  { key: "p4", author: "samuel_obi", when: at(11), title: "Fig & Almond Sabbath Bread",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900",
    text: "A sweet braided loaf studded with figs and toasted almonds, baked fresh for the Sabbath table.",
    verse: { text: "Man shall not live on bread alone, but on every word that comes from the mouth of God.", reference: "Matthew 4:4" },
    hashtags: ["#BiblicalRecipes", "#MannaMoments"], likedBy: ["esther_kimani", "david_mensah"] },
  { key: "p5", author: "esther_kimani", when: at(10), title: "Pomegranate & Mint Salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900",
    text: "Bright pomegranate seeds, fresh mint, and feta over greens — a table piece inspired by the Promised Land's fruit.",
    verse: { text: "A land with wheat and barley, vines and fig trees, pomegranates, olive oil and honey.", reference: "Deuteronomy 8:8" },
    hashtags: ["#GraceAtTable", "#BiblicalRecipes"], likedBy: ["samuel_obi"] },
  { key: "p6", author: "miriam_okafor", when: at(9), title: "Rosemary Sourdough Loaf",
    image: "https://images.unsplash.com/photo-1495195129352-aeb325a55b65?w=900",
    text: "80% hydration, a 48 hour cold ferment, and a handful of rosemary from the windowsill. Every loaf is a prayer.",
    verse: { text: "I am the bread of life.", reference: "John 6:35" },
    hashtags: ["#BreadOfLife", "#FaithFood"], likedBy: ["ruth_adeyemi"] },
  { key: "p7", author: "david_mensah", when: at(8), title: "Fire-Roasted Vegetable Platter",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900",
    text: "Whatever was ripe on Saturday morning, charred over open coals with olive oil and sea salt.",
    verse: { text: "", reference: "" }, hashtags: ["#GardenHarvest"], likedBy: [] },
];

const ALBUMS = [
  { key: "alb1", owner: "miriam_okafor", name: "Psalms Kitchen", description: "Recipes that pair with a favourite psalm.",
    hashtags: ["#FaithFood", "#PsalmsAndSoups"], posts: ["p1", "p6"], when: at(14, 12) },
  { key: "alb2", owner: "david_mensah", name: "Garden Harvest", description: "From the garden straight to the table.",
    hashtags: ["#GardenHarvest"], posts: ["p2", "p7"], when: at(13, 12) },
  { key: "alb3", owner: "ruth_adeyemi", name: "Bowls of Gratitude", description: "Simple grain bowls.",
    hashtags: ["#GraceAtTable"], posts: ["p3"], when: at(12, 12) },
];

const COMMENTS = [
  { key: "c1", post: "p1", author: "david_mensah", text: "This looks absolutely divine! I'll be making this for Sunday dinner 🙌", when: at(14, 12) },
  { key: "c2", post: "p1", author: "ruth_adeyemi", text: "Love this one! What's the marinating time?", when: at(14, 13) },
  { key: "c3", post: "p2", author: "miriam_okafor", text: "Sharing the lentil recipe 🙏", when: at(13, 14) },
  { key: "c4", post: "p4", author: "esther_kimani", text: "The braid is beautiful, Samuel.", when: at(11, 15) },
  { key: "c5", post: "p6", author: "ruth_adeyemi", text: "Breaking bread with intention. Amen.", when: at(9, 11) },
  { key: "c6", post: "p3", author: "miriam_okafor", text: "A bowl of gratitude indeed.", when: at(12, 16) },
];

const FRIENDSHIPS = [
  { a: "miriam_okafor", b: "david_mensah", status: "accepted" },
  { a: "miriam_okafor", b: "ruth_adeyemi", status: "accepted" },
  { a: "david_mensah", b: "samuel_obi", status: "accepted" },
  { a: "esther_kimani", b: "miriam_okafor", status: "pending" }, // incoming request for Miriam
];

const REASONS = [
  { name: "Spam or misleading", description: "Advertising, scams or content that is not what it claims to be." },
  { name: "Inappropriate content", description: "Content that is offensive or unsuitable for the community." },
  { name: "Harassment or bullying", description: "Targets or attacks another member." },
  { name: "Copyright infringement", description: "Uses someone else's photo or recipe without permission." },
  { name: "Misinformation", description: "Contains false or harmful claims." },
  { name: "Other", description: "Something else that moderators should look at." },
];

const MESSAGES = [
  { key: "m1", from: "ruth_adeyemi", to: "miriam_okafor", text: "Have you tried making the honey roast chicken?", when: at(15, 10, 2) },
  { key: "m2", from: "miriam_okafor", to: "ruth_adeyemi", text: "Yes! It turned out incredible. The herb crust was perfect.", when: at(15, 10, 5) },
  { key: "m3", from: "ruth_adeyemi", to: "miriam_okafor", text: "Love your sourdough post! What's your starter hydration?", when: at(15, 10, 7) },
  { key: "m4", from: "miriam_okafor", to: "ruth_adeyemi", text: "80% hydration, 48hr cold ferment. It's become a weekly ritual.", when: at(15, 10, 9) },
  { key: "m5", from: "david_mensah", to: "miriam_okafor", text: "Sharing the lentil recipe with you tonight.", when: at(15, 9, 0) },
];

async function upsert(collection, filter, doc) {
  await collection.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
  return collection.findOne(filter);
}

async function main() {
  const db = await connect();
  const col = (n) => getDb().collection(n);

  // Users
  const byName = {};
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    byName[u.username] = await upsert(col("users"), { usernameLower: u.username.toLowerCase() }, {
      username: u.username, usernameLower: u.username.toLowerCase(), email: u.email, passwordHash,
      name: u.name, avatar: u.avatar, bio: u.bio, role: u.role, settings: { ...DEFAULT_SETTINGS }, createdAt: at(1),
    });
  }
  const id = (username) => byName[username]._id;

  // Posts (with likes and hashtags)
  const postByKey = {};
  for (const p of POSTS) {
    postByKey[p.key] = await upsert(col("posts"), { seedKey: p.key }, {
      seedKey: p.key, authorId: id(p.author), title: p.title, text: p.text, image: p.image, verse: p.verse,
      hashtags: p.hashtags, likes: p.likedBy.map(id), createdAt: p.when,
    });
  }

  // Albums
  for (const a of ALBUMS) {
    await upsert(col("albums"), { seedKey: a.key }, {
      seedKey: a.key, ownerId: id(a.owner), name: a.name, description: a.description, hashtags: a.hashtags,
      postIds: a.posts.map((k) => postByKey[k]._id), createdAt: a.when,
    });
  }

  // Comments
  for (const c of COMMENTS) {
    await upsert(col("comments"), { seedKey: c.key }, {
      seedKey: c.key, postId: postByKey[c.post]._id, authorId: id(c.author), text: c.text, createdAt: c.when,
    });
  }

  // Friendships
  for (const f of FRIENDSHIPS) {
    await upsert(col("friends"), { requester: id(f.a), recipient: id(f.b) }, {
      requester: id(f.a), recipient: id(f.b), status: f.status, createdAt: at(2),
      ...(f.status === "accepted" ? { respondedAt: at(2, 11) } : {}),
    });
  }

  // Report reasons
  const reasonByName = {};
  for (const r of REASONS) {
    reasonByName[r.name] = await upsert(col("reportReasons"), { nameLower: r.name.toLowerCase() }, {
      name: r.name, nameLower: r.name.toLowerCase(), description: r.description, createdAt: at(1),
    });
  }

  // One open report so the admin report queue is populated
  await upsert(col("reports"), { postId: postByKey.p4._id, reporterId: id("david_mensah") }, {
    postId: postByKey.p4._id, reporterId: id("david_mensah"), reasonId: reasonByName["Spam or misleading"]._id,
    details: "Demo report: please review this post.", status: "open", createdAt: at(16, 9),
  });

  // Direct messages
  for (const m of MESSAGES) {
    await upsert(col("messages"), { seedKey: m.key }, {
      seedKey: m.key, fromId: id(m.from), toId: id(m.to), text: m.text, createdAt: m.when,
    });
  }

  const counts = {};
  for (const n of ["users", "posts", "albums", "comments", "friends", "reportReasons", "reports", "messages"]) {
    counts[n] = await db.collection(n).countDocuments();
  }
  console.log("Seed complete. Collection counts:", counts);
}

main()
  .then(() => close())
  .catch(async (err) => {
    console.error("Seed failed:", err.message);
    await close();
    process.exit(1);
  });
