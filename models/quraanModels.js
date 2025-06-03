const mongoose = require("mongoose");

// 🔸 Hotspot
const hotspotSchema = new mongoose.Schema({
  wordURL: { type: String, required: true },
  audio: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true },
  instruction: { type: String },
  readingTitle: { type: String },
  surahTitle: { type: String },
  surahId: { type: Number, required: true },
  ayaNumber: { type: Number, required: true },
  pageNumber: { type: Number, required: true },
});

const Hotspot = mongoose.model("Hotspot", hotspotSchema);

// 🔸 LikedHotspot – only stores references
const likedHotspotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hotspotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotspot",
    required: true,
  },
});

const LikedHotspot = mongoose.model("LikedHotspot", likedHotspotSchema);

// 🔸 Page
const pageSchema = new mongoose.Schema({
  pageNumber: { type: Number, required: true, unique: true },
  pageURL: { type: String, required: true },
  hotspots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotspot" }],
});

const Page = mongoose.model("Page", pageSchema);

// 🔸 Sura
const suraSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // مكية / مدنية
});

const Sura = mongoose.model("Sura", suraSchema);

// 🔸 SuraInReading – references Sura only
const suraInReadingSchema = new mongoose.Schema({
  suraId: { type: mongoose.Schema.Types.ObjectId, ref: "Sura", required: true },
  pageNumber: { type: Number, required: true },
  souraNumber: { type: Number, required: true },
});

// 🔸 Part
const partSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pageNumber: { type: Number, required: true },
});

const Part = mongoose.model("Part", partSchema);

// 🔸 PartInReading – references Part only
const partInReadingSchema = new mongoose.Schema({
  partId: { type: mongoose.Schema.Types.ObjectId, ref: "Part", required: true },
  pageNumber: { type: Number, required: true },
});

// 🔸 Reading
const readingSchema = new mongoose.Schema({
  name: { type: String },
  prePagesCount: { type: Number },
  pagesCount: { type: Number, required: true },
  index: [suraInReadingSchema],
  pages: [pageSchema],
  parts: [partInReadingSchema],
});

const Reading = mongoose.model("Reading", readingSchema);

// 🔸 ReadingItem
const readingItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  readingKey: { type: String, required: true, unique: true },
  disabled: { type: Boolean, default: false },
  image: { type: String, required: true },
  sideNotes: { type: Boolean, default: false },
});

const ReadingItem = mongoose.model("ReadingItem", readingItemSchema);

module.exports = {
  Hotspot,
  LikedHotspot,
  Page,
  Sura,
  Part,
  Reading,
  ReadingItem,
};
