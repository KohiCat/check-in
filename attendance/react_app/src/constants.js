export const EventConstants  = {
  LOAD_EVERYTHING: 0,
  CHANGE: 1,
  CREATE_EVENT: 2,
  UPDATE_EVENT: 3,
  DELETE_EVENT: 4
};

export const AppConstants = {
  CHANGE: 0,
  SELECT_EVENT: 1,
  CREATE_EVENT_MODAL: 2,
  VIEW_EVENT_MODAL: 3,
  CLOSE_EVENT_MODAL: 4,
  APP_BOX_SELECTED: 5
};

export const AttendanceFormConstants = {
  READY: 0,
  NOT_READY: 1,
  ERROR: 2,
  CHANGE: 3,
  ATTENDANCE_KEY_PRESSED: 4,
  // only for AttendanceStore -> EventStore
  PUSH_LOG: 5,
  NEW_ATTENDEE: 6
};