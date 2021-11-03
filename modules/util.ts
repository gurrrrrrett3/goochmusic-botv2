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