import { json, serverError } from '../_lib/http.js';

// Public read of active banners ordered by sort_order. Browser-cached briefly.
export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB
      .prepare(
        `SELECT id, eyebrow, heading, heading_accent, description,
                btn1_text, btn1_link, btn2_text, btn2_link,
                bg_type, bg_image_url, bg_image_mobile_url, bg_video_url,
                bg_color, bg_gradient_from, bg_gradient_to, overlay_opacity,
                text_align, text_color
           FROM hero_banners
          WHERE is_active = 1
          ORDER BY sort_order ASC, id ASC`
      )
      .all();
    return json(
      { ok: true, items: results || [] },
      { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } }
    );
  } catch (e) {
    return serverError(e);
  }
};
