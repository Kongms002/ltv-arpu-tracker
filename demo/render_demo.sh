#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
frame_dir="$script_dir/rendered"
output_file="$script_dir/grosshacker-demo.mp4"
render_dir="$(mktemp -d "${TMPDIR:-/tmp}/grosshacker-video.XXXXXX")"

cleanup() {
  rm -r "$render_dir"
}
trap cleanup EXIT

render_clip() {
  local input="$1"
  local output="$2"
  local duration="$3"
  local fade_start="$4"
  ffmpeg -loglevel error -y \
    -loop 1 -framerate 30 -i "$input" -t "$duration" \
    -vf "scale=1920:1080,setsar=1,fade=t=in:st=0:d=0.35,fade=t=out:st=${fade_start}:d=0.6,format=yuv420p" \
    -c:v libx264 -preset medium -crf 18 -an "$output"
}

render_clip "$frame_dir/00-title.png" "$render_dir/00-title.mp4" 4 3.4
render_clip "$frame_dir/01-overview.png" "$render_dir/01-overview.mp4" 5 4.4
render_clip "$frame_dir/02-cohorts.png" "$render_dir/02-cohorts.mp4" 5 4.4
render_clip "$frame_dir/03-automation.png" "$render_dir/03-automation.mp4" 5 4.4
render_clip "$frame_dir/04-review.png" "$render_dir/04-review.mp4" 5 4.4
render_clip "$frame_dir/05-applied.png" "$render_dir/05-applied.mp4" 5 4.4
render_clip "$frame_dir/06-activity.png" "$render_dir/06-activity.mp4" 5 4.4
render_clip "$frame_dir/07-sources.png" "$render_dir/07-sources.mp4" 5 4.4
render_clip "$frame_dir/08-outro.png" "$render_dir/08-outro.mp4" 4 3.4

{
  for clip in "$render_dir"/*.mp4; do
    printf "file '%s'\n" "$clip"
  done
} > "$render_dir/concat.txt"

ffmpeg -loglevel error -y -f concat -safe 0 -i "$render_dir/concat.txt" -c copy -movflags +faststart "$output_file"
echo "$output_file"
