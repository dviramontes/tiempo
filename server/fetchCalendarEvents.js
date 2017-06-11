import gcal from 'google-calendar';

export default function fetchCalendarEvents(accessToken, id, timeMin, timeMax) {
  return new Promise((resolve, reject) => {
    return gcal(accessToken).events.list(id, {
      timeMin,
      timeMax,
    }, (err, eventList) => {
      if (err) return reject(err);
      return resolve(eventList);
    });
  });
}
