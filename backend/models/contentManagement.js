const db = require('../config/db');

const ContentManagement = {
  getContent: (id, callback) => {
    db.query('SELECT * FROM content_management WHERE id = ?', [id], callback);
  },
  updateContent: (id, data, callback) => {
    db.query(
      `UPDATE content_management SET 
        hero_main_heading = ?, hero_sub_text = ?, hero_button_text = ?, hero_button_link = ?, hero_animate_button = ?, hero_fade_in_text = ?, hero_bg_image = ?, hero_overlay_color = ?,
        logo_current_logo = ?, logo_size = ?, logo_position = ?, logo_animation = ?
      WHERE id = ?`,
      [
        data.hero_main_heading,
        data.hero_sub_text,
        data.hero_button_text,
        data.hero_button_link,
        data.hero_animate_button,
        data.hero_fade_in_text,
        data.hero_bg_image,
        data.hero_overlay_color,
        data.logo_current_logo,
        data.logo_size,
        data.logo_position,
        data.logo_animation,
        id
      ],
      callback
    );
  }
};

module.exports = ContentManagement;
