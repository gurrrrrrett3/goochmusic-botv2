import { emoji } from "./emojis";

export function formatTime(time: string | number) {
    time = parseInt(time.toString());
  
    const h = Math.floor(time / 3600);
    time = time % 3600;
    const m = Math.floor(time / 60);
    time = time % 60;
  
    return h > 0 ? `${p(h)}:${p(m)}:${p(time)}` : m > 0 ? `${p(m)}:${p(time)}` : `${p(time)}`;
  }
  
  function p(s: number) {
    return s.toString().length == 1 ? `0${s}` : s
  };


  export function formatProgressBar(length: number, current: number, total: number) {

    const percent = Math.floor((current / total) * 100);

    const barCurrent = percent / length

    let progress = "";
    for (let i = 0; i < length; i++) {
        if (i < barCurrent) {
            progress += emoji.progressbar.full;
        } else {
            progress += emoji.progressbar.empty;
        }
    }
    return `|${progress}| ${formatTime(current)}/${formatTime(total)}`;
}