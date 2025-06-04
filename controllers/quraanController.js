const {
  ReadingItem,
  LikedHotspot,
  Hotspot,
  Reading,
  Sura,
  PartInReading,
  SuraInReading,
  Page,
  Part,
} = require("../models/quraanModels");
const { applyTransform } = require("../utils/mongooseHelpers");

// 🔹 Get reading items
exports.getReadingItems = async (req, res) => {
  try {
    const items = await ReadingItem.find().populate("readingId", "name key");
    const formatted = items.map((item) => ({
      id: item._id,
      title: item.readingId?.name || "بدون اسم",
      readingKey: item.readingId?.key || null,
      disabled: item.disabled,
      image: item.image,
      sideNotes: item.sideNotes,
    }));
    res.send(formatted);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// 🔹 Get liked hotspots
exports.getLikedHotspots = async (req, res) => {
  try {
    const liked = await LikedHotspot.find({ userId: req.user._id }).populate({
      path: "hotspotId",
      populate: [
        { path: "suraId", select: "title type" },
        {
          path: "pageId",
          populate: { path: "readingId", select: "name key" },
          select: "pageNumber readingId",
        },
      ],
    });

    const result = liked.map((entry) => {
      const h = entry.hotspotId;
      return {
        id: entry._id,
        hotspotId: h._id,
        userId: req.user._id,
        wordURL: h.wordURL,
        audio: h.audio,
        instruction: h.instruction,
        ayaNumber: h.ayaNumber,
        pageId: h.pageId?._id,
        pageNumber: h.pageId?.pageNumber,
        readingId: h.pageId?.readingId?._id,
        readingKey: h.pageId?.readingId?.key,
        readingTitle: h.pageId?.readingId?.name,
        suraId: h.suraId?._id,
        surahTitle: h.suraId?.title,
        surahType: h.suraId?.type,
      };
    });

    res.send(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// 🔹 Get last N liked hotspots
exports.getLastNLikedHotspots = async (req, res) => {
  try {
    const N = parseInt(req.body.N || 10);
    const liked = await LikedHotspot.find({ userId: req.user._id })
      .sort({ _id: -1 })
      .limit(N)
      .populate({
        path: "hotspotId",
        populate: [
          { path: "suraId", select: "title type" },
          {
            path: "pageId",
            populate: { path: "readingId", select: "name key" },
            select: "pageNumber readingId",
          },
        ],
      });

    const result = liked.map((entry) => {
      const h = entry.hotspotId;
      return {
        id: entry._id,
        hotspotId: h._id,
        userId: req.user._id,
        wordURL: h.wordURL,
        audio: h.audio,
        instruction: h.instruction,
        ayaNumber: h.ayaNumber,
        pageId: h.pageId?._id,
        pageNumber: h.pageId?.pageNumber,
        readingId: h.pageId?.readingId?._id,
        readingKey: h.pageId?.readingId?.key,
        readingTitle: h.pageId?.readingId?.name,
        suraId: h.suraId?._id,
        surahTitle: h.suraId?.title,
        surahType: h.suraId?.type,
      };
    });

    res.send(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// 🔹 Like a hotspot
exports.likeHotspot = async (req, res) => {
  try {
    const hotspot = await Hotspot.findById(req.body);
    if (!hotspot) return res.status(404).send("Hotspot not found");

    const alreadyLiked = await LikedHotspot.findOne({
      userId: req.user._id,
      hotspotId: hotspot._id,
    });
    if (alreadyLiked) return res.status(400).send("Already liked");

    const newLike = new LikedHotspot({
      userId: req.user._id,
      hotspotId: hotspot._id,
    });

    await newLike.save();
    res.send(newLike);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// 🔹 Dislike a hotspot
exports.dislikeHotspot = async (req, res) => {
  try {
    const removed = await LikedHotspot.findOneAndDelete({
      _id: req.body.id,
      userId: req.user._id,
    });
    if (!removed) return res.status(404).send("Not found or not authorized");
    res.send(removed);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// 🔹 Get reading by key
exports.getReadingByKey = async (req, res) => {
  try {
    const reading = await Reading.findOne({ key: req.body.key });
    if (!reading) return res.status(404).send("Reading not found");

    // Get only first 5 pages and clean them
    const rawPages = await Page.find({ readingId: reading._id })
      .limit(5)
      .lean();
    const pages = rawPages.map(applyTransform);

    // Flattened parts
    const rawPartLinks = await PartInReading.find({
      readingId: reading._id,
    }).lean();
    const partLinks = rawPartLinks.map(applyTransform);

    const partIds = partLinks.map((p) => p.partId);
    const partsData = await Part.find({ _id: { $in: partIds } }).lean();
    const partMap = Object.fromEntries(
      partsData.map((p) => [p._id.toString(), applyTransform(p)])
    );

    const parts = partLinks.map((p) => ({
      ...p,
      title: partMap[p.partId.toString()]?.title,
    }));

    // Flattened suras
    const rawSuraLinks = await SuraInReading.find({
      readingId: reading._id,
    }).lean();
    const suraLinks = rawSuraLinks.map(applyTransform);

    const suraIds = suraLinks.map((s) => s.suraId);
    const suraData = await Sura.find({ _id: { $in: suraIds } }).lean();
    const suraMap = Object.fromEntries(
      suraData.map((s) => [s._id.toString(), applyTransform(s)])
    );

    const index = suraLinks.map((s) => ({
      ...s,
      title: suraMap[s.suraId.toString()]?.title,
      type: suraMap[s.suraId.toString()]?.type,
    }));

    res.send({
      ...reading.toObject(), // already transformed by schema
      pages,
      parts,
      index,
    });
  } catch (err) {
    console.error("getReadingByKey error:", err);
    res.status(500).send("Server error");
  }
};

// 🔹 Get specific reading pages by key
exports.getReadingPagesByKey = async (req, res) => {
  try {
    const { key, pagesNumber } = req.body;
    const reading = await Reading.findOne({ key });
    if (!reading) return res.status(404).send("Reading not found");

    const pages = await Page.find({
      readingId: reading._id,
      pageNumber: { $in: pagesNumber },
    }).populate({
      path: "hotspots",
      populate: [
        { path: "suraId", select: "title" },
        {
          path: "pageId",
          populate: { path: "readingId", select: "name" },
          select: "pageNumber readingId",
        },
      ],
    });

    const result = {};
    for (const page of pages) {
      result[page.pageNumber] = {
        ...page.toObject(),
        hotspots: page.hotspots.map((h) => ({
          id: h._id,
          wordURL: h.wordURL,
          audio: h.audio,
          x: h.x,
          y: h.y,
          w: h.w,
          h: h.h,
          instruction: h.instruction,
          readingTitle: h.pageId?.readingId?.name || "",
          surahTitle: h.suraId?.title || "",
          surahId: h.suraId?._id,
          ayaNumber: h.ayaNumber,
          pageNumber: h.pageId?.pageNumber,
        })),
      };
    }

    res.send(result);
  } catch (err) {
    console.error("getReadingPagesByKey error:", err);
    res.status(500).send("Server error");
  }
};
