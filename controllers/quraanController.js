const {
  ReadingItem,
  LikedHotspot,
  Hotspot,
  Reading,
} = require("../models/quraanModels");

exports.getReadingItems = async (req, res) => {
  try {
    const items = await ReadingItem.find();
    res.send(items);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getLikedHotspots = async (req, res) => {
  try {
    const liked = await LikedHotspot.find({ userId: req.user._id }).populate(
      "hotspotId"
    );

    const result = liked.map((entry) => {
      const hotspot = entry.hotspotId;
      return {
        id: entry._id,
        hotspotId: hotspot._id,
        userId: req.user._id,
        wordURL: hotspot.wordURL,
        audio: hotspot.audio,
        instruction: hotspot.instruction,
        readingTitle: hotspot.readingTitle,
        surahTitle: hotspot.surahTitle,
        surahId: hotspot.surahId,
        ayaNumber: hotspot.ayaNumber,
        pageNumber: hotspot.pageNumber,
      };
    });

    res.send(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getLastNLikedHotspots = async (req, res) => {
  try {
    const N = parseInt(req.body.N || 10);
    const liked = await LikedHotspot.find({ userId: req.user._id })
      .sort({ _id: -1 })
      .limit(N)
      .populate("hotspotId");

    const result = liked.map((entry) => {
      const hotspot = entry.hotspotId;
      return {
        id: entry._id,
        hotspotId: hotspot._id,
        userId: req.user._id,
        wordURL: hotspot.wordURL,
        audio: hotspot.audio,
        instruction: hotspot.instruction,
        readingTitle: hotspot.readingTitle,
        surahTitle: hotspot.surahTitle,
        surahId: hotspot.surahId,
        ayaNumber: hotspot.ayaNumber,
        pageNumber: hotspot.pageNumber,
      };
    });

    res.send(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
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
      wordURL: hotspot.wordURL,
      audio: hotspot.audio,
      instruction: hotspot.instruction,
      readingTitle: hotspot.readingTitle,
      surahTitle: hotspot.surahTitle,
      surahId: hotspot.surahId,
      ayaNumber: hotspot.ayaNumber,
      pageNumber: hotspot.pageNumber,
    });

    await newLike.save();
    res.send(newLike);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

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

exports.getReadingByKey = async (req, res) => {
  try {
    const reading = await Reading.findOne({ name: req.body.key });
    if (!reading) return res.status(404).send("Reading not found");

    const limitedPages = {};
    Object.keys(reading.pages || {})
      .slice(0, 5)
      .forEach((k) => (limitedPages[k] = reading.pages[k]));

    const result = reading.toObject();
    result.pages = limitedPages;

    res.send(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getReadingPagesByKey = async (req, res) => {
  try {
    const { key, pagesNumber } = req.body;
    const reading = await Reading.findOne({ name: key });
    if (!reading) return res.status(404).send("Reading not found");

    const result = {};
    for (const p of pagesNumber) {
      if (reading.pages[p]) {
        result[p] = reading.pages[p];
      }
    }

    res.send(result);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
