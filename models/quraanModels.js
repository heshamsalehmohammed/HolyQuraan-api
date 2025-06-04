const mongoose = require("mongoose");

const defaultTransform = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
};

// 🔸 Hotspot
const hotspotSchema = new mongoose.Schema(
  {
    wordURL: { type: String, required: true },
    audio: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    instruction: { type: String },
    surahId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sura",
      required: true,
    },
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    ayaNumber: { type: Number, required: true },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const Hotspot = mongoose.model("Hotspot", hotspotSchema);

// 🔸 LikedHotspot
const likedHotspotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotspotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotspot",
      required: true,
    },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const LikedHotspot = mongoose.model("LikedHotspot", likedHotspotSchema);

// 🔸 Page
const pageSchema = new mongoose.Schema(
  {
    readingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reading",
      required: true,
    },
    pageNumber: { type: Number, required: true },
    pageURL: { type: String, required: true },
    hotspots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotspot" }],
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
pageSchema.index({ readingId: 1, pageNumber: 1 }, { unique: true });
const Page = mongoose.model("Page", pageSchema);

// 🔸 Sura
const suraSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const Sura = mongoose.model("Sura", suraSchema);

// 🔸 SuraInReading
const suraInReadingSchema = new mongoose.Schema(
  {
    suraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sura",
      required: true,
    },
    readingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reading",
      required: true,
    },
    pageNumber: { type: Number, required: true },
    souraNumber: { type: Number, required: true },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const SuraInReading = mongoose.model("SuraInReading", suraInReadingSchema);

// 🔸 Part
const partSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const Part = mongoose.model("Part", partSchema);

// 🔸 PartInReading
const partInReadingSchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
      required: true,
    },
    readingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reading",
      required: true,
    },
    pageNumber: { type: Number, required: true },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const PartInReading = mongoose.model("PartInReading", partInReadingSchema);

// 🔸 Reading
const readingSchema = new mongoose.Schema(
  {
    name: { type: String },
    key: { type: String, required: true, unique: true },
    prePagesCount: { type: Number },
    pagesCount: { type: Number, required: true },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const Reading = mongoose.model("Reading", readingSchema);

// 🔸 ReadingItem
const readingItemSchema = new mongoose.Schema(
  {
    readingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reading",
      required: true,
    },
    disabled: { type: Boolean, default: false },
    image: { type: String, required: true },
    sideNotes: { type: Boolean, default: false },
  },
  {
    toJSON: defaultTransform,
    toObject: defaultTransform,
  }
);
const ReadingItem = mongoose.model("ReadingItem", readingItemSchema);

// 🔁 Export all models
module.exports = {
  Hotspot,
  LikedHotspot,
  Page,
  Sura,
  SuraInReading,
  Part,
  PartInReading,
  Reading,
  ReadingItem,
};
