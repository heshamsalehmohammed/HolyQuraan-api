const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const quraanController = require("../controllers/quraanController");

router.get("/readings/items", quraanController.getReadingItems);
router.get("/hotspots/liked", auth, quraanController.getLikedHotspots);
router.post(
  "/hotspots/liked/last-n",
  auth,
  quraanController.getLastNLikedHotspots
);
router.post("/hotspots/like", auth, quraanController.likeHotspot);
router.post("/hotspots/dislike", auth, quraanController.dislikeHotspot);
router.post("/readings/by-key", quraanController.getReadingByKey);
router.post("/readings/pages-by-key", quraanController.getReadingPagesByKey);

module.exports = router;
