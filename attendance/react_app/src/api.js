"use strict";

import cookie from 'cookie';

const csrftoken = cookie.parse(document.cookie)['csrftoken'];

function justParse(r) {
  if (r.responseText) {
    return JSON.parse(r.responseText);
  }
  return JSON.parse(r);
}

export default class APIClient {
  static _request(method, url, formData) {
    let r = new XMLHttpRequest();
    r.open(method, url, true);
    let promise = new Promise(function (resolve, reject) {
      r.onreadystatechange = function () {
        if (r.readyState !== XMLHttpRequest.DONE) {
        }
        else if (r.status === 200) {
          resolve(r.responseText);
        } else {
          reject(r);
        }
      }
    });

    formData.append('csrfmiddlewaretoken', csrftoken);
    r.send(formData);
    return promise;
  }

  static get(url, formData) {
    return APIClient._request('GET', url, formData);
  }

  static post(url, formData) {
    return APIClient._request('POST', url, formData);
  }

  static createEvent(formData) {
    return APIClient.post('/api/events/new', formData).then(function (r) {
      const jdata = JSON.parse(r);
      if (jdata['success']) {
        return jdata['event']['id'];
      }
    }, function (r) {
      return JSON.parse(r.responseText);
    });
  }

  static updateEvent(eventID, formData) {
    const url = `/api/events/${eventID}`;
    return APIClient.post(url, formData).then(function (r) {
      const jdata = JSON.parse(r);
      if (jdata['success']) {
        return jdata['event'];
      }
      return jdata;
    }, justParse);
  }

  static deleteEvent(formData) {
    const url = '/api/events/delete';

    return APIClient.post(url, formData).then(justParse, justParse);
  }

  static loadEverything() {
    return APIClient.get('/api/events', new FormData()).then(function (r) {
      return JSON.parse(r)['events'];
    }, justParse);
  }

  static attend(eventID, formData) {
    const url = `/api/events/${eventID}/attend`;
    return APIClient.post(url, formData).then(function (r) {
      return JSON.parse(r);
    }, justParse);
  }
}