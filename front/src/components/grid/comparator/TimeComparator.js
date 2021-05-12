const parseTimeToInt = (str) => {
  const times = (str ?? "").replace(/\s/g, "").split(":");

  let hours = times[0] ? parseInt(times[0]) : -1;
  let minutes = times[1] ? parseInt(times[1]) : -1;

  return {
    hours: hours,
    minutes: minutes,
  };
};

export default function (valueA, valueB) {
  const A = parseTimeToInt(valueA);
  const B = parseTimeToInt(valueB);

  if (A.hours === B.hours) {
    return A.minutes - B.minutes;
  } else {
    return A.hours - B.hours;
  }
}
