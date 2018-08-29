function getTimeString(times){
  let str = '';
  const secondSpan = 1000
  const minuteSpan = 60*secondSpan
  const hourSpan = 60*minuteSpan
  const daySpan = 24*hourSpan
  let days, hours, minutes, seconds
  if(times/daySpan >= 1){
    days = Math.floor(times/daySpan)
    str +=  days + '天'
    times = times - daySpan * days
  }
  if(times/hourSpan >= 1){
    hours = Math.floor(times/hourSpan)
    str += hours + '小时'
    times = times - hourSpan * hours
  }
  if(times/minuteSpan >= 1){
    minutes = Math.floor(times/minuteSpan)
    str += minutes + '分钟'
    times = times - minuteSpan * minutes
  }
  if(times/secondSpan >= 1){
    seconds = Math.floor(times/secondSpan)
    str += seconds + '秒'
    times = times - secondSpan * seconds
  }
  return str
}