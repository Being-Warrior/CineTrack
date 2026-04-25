import axios from "axios";
import db from "../config/db.js";

// Manually add a movie/series to content table, then link to user
export const addContent = async (req, res) => {
  const { user_id } = req.user;
  const {
    title,
    content_type,
    release_year,
    genre,
    poster_url,
    overview,
    status,
    rating,
    platform,
    notes,
  } = req.body;

  if (!title || !content_type || !status)
    return res
      .status(400)
      .json({ message: "title, content_type, and status are required" });

  const validTypes = ["movie", "series"];
  const validStatuses = ["watchlist", "watching", "completed", "dropped"];

  if (!validTypes.includes(content_type))
    return res
      .status(400)
      .json({ message: "content_type must be movie or series" });
  if (!validStatuses.includes(status))
    return res
      .status(400)
      .json({ message: `status must be one of: ${validStatuses.join(", ")}` });
  if (rating !== undefined && (rating < 1 || rating > 10))
    return res.status(400).json({ message: "rating must be between 1 and 10" });

  try {
    const [contentResult] = await db.query(
      `INSERT INTO content (title, content_type, release_year, genre, poster_url, overview)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        content_type,
        release_year || null,
        genre || null,
        poster_url || null,
        overview || null,
      ],
    );
    const content_id = contentResult.insertId;

    await db.query(
      `INSERT INTO user_content (user_id, content_id, status, rating, platform, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status=VALUES(status), rating=VALUES(rating),
         platform=VALUES(platform), notes=VALUES(notes)`,
      [
        user_id,
        content_id,
        status,
        rating || null,
        platform || null,
        notes || null,
      ],
    );

    res.status(201).json({ message: "Added successfully", content_id });
  } catch (err) {
    console.error("addContent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update existing entry
export const updateContent = async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const { status, rating, platform, notes, genre, overview } = req.body;

  try {
    const [ucRow] = await db.query(
      "SELECT content_id FROM user_content WHERE id = ? AND user_id = ?",
      [id, user_id],
    );
    if (!ucRow.length)
      return res.status(404).json({ message: "Entry not found" });

    const ucFields = [],
      ucParams = [];
    if (status) {
      ucFields.push("status = ?");
      ucParams.push(status);
    }
    if (rating !== undefined) {
      ucFields.push("rating = ?");
      ucParams.push(rating);
    }
    if (platform !== undefined) {
      ucFields.push("platform = ?");
      ucParams.push(platform);
    }
    if (notes !== undefined) {
      ucFields.push("notes = ?");
      ucParams.push(notes);
    }
    if (ucFields.length) {
      ucParams.push(id, user_id);
      await db.query(
        `UPDATE user_content SET ${ucFields.join(", ")} WHERE id = ? AND user_id = ?`,
        ucParams,
      );
    }

    const cFields = [],
      cParams = [];
    if (genre !== undefined) {
      cFields.push("genre = ?");
      cParams.push(genre);
    }
    if (overview !== undefined) {
      cFields.push("overview = ?");
      cParams.push(overview);
    }
    if (cFields.length) {
      cParams.push(ucRow[0].content_id);
      await db.query(
        `UPDATE content SET ${cFields.join(", ")} WHERE content_id = ?`,
        cParams,
      );
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("updateContent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete entry
export const deleteContent = async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT content_id FROM user_content WHERE id = ? AND user_id = ?",
      [id, user_id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "Entry not found" });

    const content_id = rows[0].content_id;
    await db.query("DELETE FROM user_content WHERE id = ? AND user_id = ?", [
      id,
      user_id,
    ]);

    const [others] = await db.query(
      "SELECT id FROM user_content WHERE content_id = ?",
      [content_id],
    );
    if (!others.length)
      await db.query("DELETE FROM content WHERE content_id = ?", [content_id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteContent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all user content with optional status filter
export const getUserContent = async (req, res) => {
  const { user_id } = req.user;
  const { status } = req.query;

  try {
    let query = `
      SELECT uc.id, uc.status, uc.rating, uc.platform, uc.notes,
             uc.added_at, uc.updated_at,
             c.content_id, c.title, c.content_type, c.release_year,
             c.genre, c.poster_url, c.overview
      FROM user_content uc
      JOIN content c ON uc.content_id = c.content_id
      WHERE uc.user_id = ?`;
    const params = [user_id];
    if (status) {
      query += " AND uc.status = ?";
      params.push(status);
    }
    query += " ORDER BY uc.updated_at DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("getUserContent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch GNews based on user's tracked titles
export const getNews = async (req, res) => {
  const { user_id } = req.user;

  try {
    const [rows] = await db.query(
      `SELECT c.title FROM user_content uc
       JOIN content c ON uc.content_id = c.content_id
       WHERE uc.user_id = ?
       ORDER BY uc.updated_at DESC LIMIT 5`,
      [user_id],
    );

    if (!rows.length)
      return res.json({
        articles: [],
        message: "Add some titles to your list to see related news!",
      });

    const titles = rows.map((r) => r.title);

    // Try each title individually and collect results, fallback to general film news
    let articles = [];
    for (const title of titles) {
      const { data } = await axios.get(
        "https://content.guardianapis.com/search",
        {
          params: {
            q: title,
            "api-key": process.env.GUARDIAN_API_KEY,
            "show-fields": "headline,thumbnail,trailText",
            "order-by": "newest",
            "page-size": 4,
          },
        },
      );
      console.log(
        `Fetched news for "${title}", found ${data.response?.results || 0} articles`,
      );
      const results = (data.response?.results || []).map((item) => ({
        title: item.webTitle,
        description: item.fields?.trailText || "",
        url: item.webUrl,
        image: item.fields?.thumbnail || null,
        publishedAt: item.webPublicationDate,
        source: { name: "The Guardian" },
      }));
      articles.push(...results);
      if (articles.length >= 10) break;
    }

    // If no title-specific results, fall back to latest film & TV news
    if (!articles.length) {
      const { data } = await axios.get(
        "https://content.guardianapis.com/search",
        {
          params: {
            "api-key": process.env.GUARDIAN_API_KEY,
            "show-fields": "headline,thumbnail,trailText",
            "order-by": "newest",
            "page-size": 10,
            section: "film,tv-and-radio",
          },
        },
      );
      articles = (data.response?.results || []).map((item) => ({
        title: item.webTitle,
        description: item.fields?.trailText || "",
        url: item.webUrl,
        image: item.fields?.thumbnail || null,
        publishedAt: item.webPublicationDate,
        source: { name: "The Guardian" },
      }));
    }

    // Deduplicate by url
    const seen = new Set();
    const unique = articles.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    res.json({ articles: unique.slice(0, 10), basedOn: titles });
  } catch (err) {
    console.error("getNews error:", err.message);
    res.status(500).json({ message: "Failed to fetch news" });
  }
};
