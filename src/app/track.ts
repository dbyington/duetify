import { Artist } from './artist';

export class Track {
  name: string;
  id: string;
  album_cover: string;
  pupularity: number;
  artists: Array<string>;
  spotify_open_url: string;
  uri: string;
  // albums: Array<{}>; // TODO: keep a single track that appears on multiple albums

}
