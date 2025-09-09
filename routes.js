const express = require("express");
const router = express.Router();
const GamePath = require("./models/GamePath");

router.post("/api/save-path", async (req, res) => {
  try {
    // FIX: Add 'events' to the destructuring
    const { player, path, won, timestamp, mode, skillLevel, defenceMaturity, score, events } =
      req.body;
    
    const saved = await GamePath.create({
      player,
      won,
      mode, 
      skillLevel, 
      defenceMaturity, 
      timestamp,
      score,
      path: JSON.stringify(path),
      events: events ? JSON.stringify(events) : null, // Now 'events' is properly defined
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving game path:", err); // Added logging for debugging
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/paths", async (req, res) => {
  try {
    const paths = await GamePath.findAll({ order: [["createdAt", "DESC"]] });
    res.json(
      paths.map((p) => ({
        ...p.toJSON(),
        path: JSON.parse(p.path),
        events: p.events ? JSON.parse(p.events) : [],
      })),
    );
  } catch (err) {
    console.error("Error fetching game paths:", err); // Added logging for debugging
    res.status(500).json({ error: err.message });
  }
});

// Clear all past paths
router.delete("/api/clear-paths", async (req, res) => {
  try {
    // Use Sequelize's destroy method to delete all records
    const result = await GamePath.destroy({
      where: {}, // No conditions, delete all records
    });
    res.status(200).json({ message: `${result} past paths cleared.` });
  } catch (err) {
    console.error("Error clearing paths:", err);
    res
      .status(500)
      .json({ message: "Failed to clear paths.", error: err.message });
  }
});

module.exports = router;