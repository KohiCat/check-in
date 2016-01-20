'use strict';

import { EventDispatcher, AppDispatcher,
         AttendanceFormDispatcher } from './dispatchers';
import { EventConstants, AppConstants,
         AttendanceFormConstants } from './constants';

import AppStore from './stores/AppStore';

export class EventActions {
  static loadEverything() {
    EventDispatcher.dispatch({
      actionType: EventConstants.LOAD_EVERYTHING
    });
  }
  static createEvent(name, datetime) {
    EventDispatcher.dispatch({
      actionType: EventConstants.CREATE_EVENT,
      name: name,
      datetime: datetime
    });
  }
  static updateEvent(index, name, datetime) {
    EventDispatcher.dispatch({
      actionType: EventConstants.UPDATE_EVENT,
      index: index,
      name: name,
      datetime: datetime
    });
  }
  static deleteEvent(index) {
    EventDispatcher.dispatch({
      actionType: EventConstants.DELETE_EVENT,
      index: index
    });
  }
}

export class AppActions {
  static selectEvent(index) {
    AppDispatcher.dispatch({
      actionType: AppConstants.SELECT_EVENT,
      index: index
    });
  }
  static viewEventModal(index) {
    AppDispatcher.dispatch({
      actionType: AppConstants.VIEW_EVENT_MODAL,
      index: index
    });
  }
  static showCreateEventModal() {
    AppDispatcher.dispatch({
      actionType: AppConstants.CREATE_EVENT_MODAL
    });
  }
  static closeEventModal() {
    AppDispatcher.dispatch({
      actionType: AppConstants.CLOSE_EVENT_MODAL
    });
  }
  static appBoxSelected(klass) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_BOX_SELECTED,
      klass: klass
    });
  }
}

export class AttendanceFormActions {
  static keyPressed(key) {
    AttendanceFormDispatcher.dispatch({
      actionType: AttendanceFormConstants.ATTENDANCE_KEY_PRESSED,
      key: key
    });
  }

  static pushLog(log) {
    AttendanceFormDispatcher.dispatch({
      actionType: AttendanceFormConstants.PUSH_LOG,
      index: AppStore.getAll().currentEventIndex,
      log: log
    });
  }

  static addAttendee(log) {
    AttendanceFormDispatcher.dispatch({
      actionType: AttendanceFormConstants.NEW_ATTENDEE,
      index: AppStore.getAll().currentEventIndex,
      log: log
    })
  }
}