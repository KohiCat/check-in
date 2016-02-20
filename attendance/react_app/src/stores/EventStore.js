"use strict";

import { EventEmitter } from 'events';

import moment from 'moment';
import update from 'react-addons-update';

import { EventDispatcher,
  AttendanceFormDispatcher as AFDispatcher } from '../dispatchers';
import { EventConstants,
  AttendanceFormConstants as AFConstants } from '../constants';
import { AppActions } from '../actions';

import APIClient from '../api';
import AttendanceStore from './AttendanceStore';

var _store = {
  eventList: []
};


function payloadToFormData(payload) {
  let formData = new FormData();
  for (const key of Object.keys(payload)) {
    // don't send actionType
    if (key === 'actionType')  {}
    else if (key === 'datetime') {
      let datetime = payload.datetime.utc();
      const dtFormatted = datetime.format('YYYY-MM-DD HH:MM:ss');
      formData.append(key, dtFormatted);
    }
    else {
      formData.append(key, payload[key]);
    }
  }
  return formData;
}

var EventStore = Object.assign({}, EventEmitter.prototype, {
  getAll: function () {
    return _store;
  },
  dispatchToken: EventDispatcher.register(function (payload) {
    switch (payload.actionType) {
      case EventConstants.SELECT_EVENT:
        const event = _store.eventList[payload.index];
        if (typeof event === 'undefined') {
          throw 'eventIndex is invalid: ' + payload.eventIndex;
        }

        _store.currentEventIndex = payload.index;
        _store.currentEvent = event;
        EventStore.emit(EventConstants.CHANGE);
        break;

      case EventConstants.CREATE_EVENT:
        EventStore.createEvent(payload);
        break;

      case EventConstants.UPDATE_EVENT:
        EventStore.updateEvent(payload);
        break;

      case EventConstants.DELETE_EVENT:
        EventStore.deleteEvent(payload);
        break;

      case EventConstants.LOAD_EVERYTHING:
        EventStore.loadEverything();
        break;

      default:
        break;
    }
  }),

  attendanceDispatchToken: AFDispatcher.register(function (payload) {
    if (payload.actionType === AFConstants.NEW_ATTENDEE) {
      _store.eventList[payload.index].num_attendees++;
      // emit change happens below
    }

    if (payload.actionType === AFConstants.PUSH_LOG
      || payload.actionType === AFConstants.NEW_ATTENDEE) {
      _store.eventList = update(_store.eventList, {
        [payload.index]: {logs: {$push: [payload.log]}}
      });

      EventStore.emit(EventConstants.CHANGE);
    }
  }),

  createEvent: function (payload) {
    let formData = payloadToFormData(payload);

    // optimistic update
    let event = {
      id: _store.eventList.length,
      name: payload.name,
      datetime: payload.datetime,
      num_attendees: 0,
      logs: []
    };
    _store.eventList.push(event);
    _store.currentEvent = event;
    EventStore.emit(EventConstants.CHANGE);

    APIClient.createEvent(formData).then(function (eventId) {
      if (typeof eventId === 'undefined') {
        _store.eventList.pop();
      } else {
        _store.eventList = update(_store.eventList, {
          [_store.eventList.length - 1]: {$merge: {id: eventId}}
        });
      }
      EventStore.emit(EventConstants.CHANGE);
      AppActions.closeEventModal();
    });

  },

  updateEvent: function (payload) {
    let formData = payloadToFormData(payload);
    const eventId = _store.eventList[payload.index].id;

    APIClient.updateEvent(eventId, formData).then(function (updatedEvent) {
      updatedEvent.datetime = moment(updatedEvent.datetime);
      _store.eventList = update(_store.eventList, {
        [payload.index]: {$set: updatedEvent}
      });
      EventStore.emit(EventConstants.CHANGE);
      AppActions.closeEventModal();
    });
  },

  deleteEvent: function (payload) {
    const index = payload.index;
    const eventID = _store.eventList[index].id;
    let formData = new FormData();
    formData.append('id', eventID);

    APIClient.deleteEvent(formData).then(function (jdata) {
      if (jdata['success']) {
        _store.eventList = update(_store.eventList,
          {$splice: [[payload.index, 1]]}
        );

        // we need to close the modal first so we never reference a non-existent event
        AppActions.closeEventModal();
        EventStore.emit(EventConstants.CHANGE);
      }
    });
  },

  loadEverything: function () {
    APIClient.loadEverything().then(function (events) {
      events.forEach(function (item) {
        item.datetime = moment(item.datetime * 1000);
        for (let i = 0; i < item.logs.length; i++) {
          item.logs[i].timestamp = moment(item.logs[i].timestamp * 1000);
        }
        _store.eventList.push(item);
      });
      EventStore.emit(EventConstants.CHANGE);
    });
  }
});

export default EventStore;