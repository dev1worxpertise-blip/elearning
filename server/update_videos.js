/**
 * Update all modules in PostgreSQL to use verified 200 OK CDN video URLs
 */
require('dotenv').config();
const db = require('./src/db');

async function updateVideos() {
  const updates = [
    { id: 'mod-posh-1', video_url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4', youtube_id: 'aqz-KE-bpKQ' },
    { id: 'mod-posh-2', video_url: 'https://vjs.zencdn.net/v/oceans.mp4', youtube_id: '3JZ_D3ELwOQ' },
    { id: 'mod-posh-3', video_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', youtube_id: 'M7lc1UVf-VE' },
    { id: 'mod-fs-1', video_url: 'https://vjs.zencdn.net/v/oceans.mp4', youtube_id: 'bMknfKXIFA8' },
    { id: 'mod-fs-2', video_url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4', youtube_id: 'Oe421EPjeBE' },
    { id: 'mod-fs-3', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', youtube_id: '31ieHmcTUOk' },
    { id: 'mod-ai-1', video_url: 'https://vjs.zencdn.net/v/oceans.mp4', youtube_id: 'aircAruvnKk' },
    { id: 'mod-ai-2', video_url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4', youtube_id: 'zOjov-2OZ0E' },
    { id: 'mod-ai-3', video_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', youtube_id: '2xxziIWmaSA' },
    { id: 'mod-sec-1', video_url: 'https://vjs.zencdn.net/v/oceans.mp4', youtube_id: 'inWWhr5tnEA' },
    { id: 'mod-sec-2', video_url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4', youtube_id: '2_lswM1S264' },
    { id: 'mod-sec-3', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', youtube_id: 'jhXCTbFnK8o' }
  ];

  try {
    for (const u of updates) {
      await db.query(
        'UPDATE modules SET video_url = $1, youtube_id = $2 WHERE id = $3',
        [u.video_url, u.youtube_id, u.id]
      );
      console.log(`✅ Updated ${u.id} -> ${u.video_url}`);
    }
    console.log('🎉 All module video URLs successfully updated in PostgreSQL database!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating video URLs:', err);
    process.exit(1);
  }
}

updateVideos();
