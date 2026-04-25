import db from '../config/db.js';
import { saveContent } from './contentController.js';

// Add a new entry or update existing (status/rating)
export const addOrUpdate = async (req, res) => {
  const { user_id } = req.user;
  const { tmdbData, status, rating } = req.body;

  if (!tmdbData || !status)
    return res.status(400).json({ message: 'tmdbData and status are required' });

  const validStatuses = ['watchlist', 'watching', 'completed', 'dropped'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });

  if (rating !== undefined && (rating < 1 || rating > 10))
    return res.status(400).json({ message: 'Rating must be between 1 and 10' });

  try {
    const content_id = await saveContent(tmdbData);

    await db.query(
      `INSERT INTO user_content (user_id, content_id, status, rating)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), rating = VALUES(rating)`,
      [user_id, content_id, status, rating || null]
    );

    res.json({ message: 'Saved successfully', content_id });
  } catch (err) {
    console.error('addOrUpdate Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all entries for the logged-in user, optional ?status= filter
export const getUserList = async (req, res) => {
  const { user_id } = req.user;
  const { status } = req.query;

  const validStatuses = ['watchlist', 'watching', 'completed', 'dropped'];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });

  try {
    let query = `
      SELECT
        uc.id,
        uc.status,
        uc.rating,
        uc.added_at,
        uc.updated_at,
        c.content_id,
        c.tmdb_id,
        c.title,
        c.content_type,
        c.release_year,
        c.imdb_rating,
        c.poster_url,
        c.overview
      FROM user_content uc
      JOIN content c ON uc.content_id = c.content_id
      WHERE uc.user_id = ?`;

    const params = [user_id];

    if (status) {
      query += ' AND uc.status = ?';
      params.push(status);
    }

    query += ' ORDER BY uc.updated_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getUserList Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update only the status or rating of an existing entry
export const updateEntry = async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const { status, rating } = req.body;

  if (!status && rating === undefined)
    return res.status(400).json({ message: 'Provide at least status or rating to update' });

  try {
    const fields = [];
    const params = [];

    if (status) {
      fields.push('status = ?');
      params.push(status);
    }
    if (rating !== undefined) {
      fields.push('rating = ?');
      params.push(rating);
    }

    params.push(id, user_id);

    const [result] = await db.query(
      `UPDATE user_content SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Entry not found' });

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('updateEntry Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an entry
export const removeEntry = async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM user_content WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Entry not found' });

    res.json({ message: 'Removed successfully' });
  } catch (err) {
    console.error('removeEntry Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
