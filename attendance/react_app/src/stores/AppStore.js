'use strict';

import { EventEmitter } from 'events';

import EventStore from './EventStore';
import { AppConstants, EventConstants } from '../constants';
import { AppDispatcher, EventDispatcher } from '../dispatchers';

var _store = {
  currentEventIndex: null,
  eventListVisible: true,
  modalMode: AppConstants.CLOSE_EVENT_MODAL,
  appBoxSelected: null
};

var AppStore = Object.assign({}, EventEmitter.prototype, {
  getAll: function () {
    return _store;
  },
  getCurrentEvent: function() {
    const events = EventStore.getAll().eventList;
    return events[_store.currentEventIndex];
  },
  dispatchToken: AppDispatcher.register(function (payload) {
    switch (payload.actionType) {
      case AppConstants.SELECT_EVENT:
        const eventStore = EventStore.getAll();
        const event = eventStore.eventList[payload.index];
        if (typeof event === 'undefined') {
          throw 'eventIndex is invalid: ' + payload.index;
        }

        _store.currentEventIndex = payload.index;
        AppStore.emit(AppConstants.CHANGE);
        break;

      case AppConstants.CREATE_EVENT_MODAL:
        _store.modalMode = AppConstants.CREATE_EVENT_MODAL;
        AppStore.emit(AppConstants.CHANGE);
        break;

      case AppConstants.VIEW_EVENT_MODAL:
        _store.modalMode = AppConstants.VIEW_EVENT_MODAL;
        _store.currentEventIndex = payload.index;
        AppStore.emit(AppConstants.CHANGE);
        break;

      case AppConstants.CLOSE_EVENT_MODAL:
        _store.modalMode = AppConstants.CLOSE_EVENT_MODAL;
        AppStore.emit(AppConstants.CHANGE);
        break;

      case AppConstants.APP_BOX_SELECTED:
        _store.appBoxSelected = payload.klass;
        AppStore.emit(AppConstants.CHANGE);
        break;

      default:
        break;
    }
  }),

  eventDispatchToken: EventDispatcher.register(function (payload) {
    EventDispatcher.waitFor([EventStore.dispatchToken]);
    if (payload.actionType === EventConstants.DELETE_EVENT) {
      if (payload.index === _store.currentEventIndex) {
        _store.currentEventIndex = null;
        AppStore.emit(AppConstants.CHANGE);
      }
    }
  })
});

export default AppStore;