'use strict';

import { EventEmitter } from 'events';
import moment from 'moment';

import { AttendanceFormConstants as AFConstants } from '../constants';
import { AttendanceFormActions } from '../actions';
import { AttendanceFormDispatcher } from '../dispatchers';
import APIClient from '../api';
import AppStore from './AppStore';

var _store = {
  keys: '',
  logs: []
};

var AttendanceStore = Object.assign({}, EventEmitter.prototype, {
  getAll: function () {
    return _store;
  },
  dispatchToken: AttendanceFormDispatcher.register(function (payload) {
    switch (payload.actionType) {
      case AFConstants.ATTENDANCE_KEY_PRESSED:
        _store.keys += payload.key;
        if (payload.key === '\n') {
          AttendanceStore.attendEvent(_store.keys);
          _store.keys = '';
        }
        AttendanceStore.emit(AFConstants.CHANGE);
        AttendanceStore.emit(AFConstants.ATTENDANCE_KEY_PRESSED);
        break;
    }
  }),
  attendEvent: function (swipe) {
    const event = AppStore.getCurrentEvent();
    let formData = new FormData();
    formData.append('swipe', swipe);
    return APIClient.attend(event.id, formData).then(function (jdata) {
      const errors = jdata['errors'];
      const apiLog = jdata['log'];
      let log;

      if (errors && errors['swipe']) {
        log = {
          message: `ERROR: ${errors.swipe}`,
          timestamp: moment(new Date())
        };
        AttendanceFormActions.pushLog(log);
      }
      else {
        log = {
          message: apiLog.message,
          timestamp: moment(apiLog.timestamp * 1000)
        };
        AttendanceFormActions.pushLog(log);
      }


      AttendanceStore.emit(AFConstants.CHANGE);
      if (errors) {
        AttendanceStore.emit(AFConstants.ERROR);
      }
      else {
        AttendanceStore.emit(AFConstants.READY);
      }
    });
  }
});

export default AttendanceStore;