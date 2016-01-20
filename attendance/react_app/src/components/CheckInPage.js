'use strict';

import React from 'react';

import { EventConstants, AppConstants } from '../constants';
import { EventActions } from '../actions';
import EventStore from '../stores/EventStore';
import AppStore from '../stores/AppStore';
import { EventListBox } from './EventList';
import { AttendanceBox } from './Attendance';
import { EventModal, EventModalBackdrop } from './EventModal';

export default class CheckInPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalMode: AppConstants.CLOSE_EVENT_MODAL,
      eventListVisible: true,
      eventState: EventStore.getAll(),
      appState: AppStore.getAll()
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleEventStoreChange = this.handleEventStoreChange.bind(this);
    this.handleAppStoreChange = this.handleAppStoreChange.bind(this);
  }

  componentDidMount() {
    EventStore.on(EventConstants.CHANGE,
      this.handleEventStoreChange);
    AppStore.on(AppConstants.CHANGE,
      this.handleAppStoreChange);
    EventActions.loadEverything();
  }

  handleEventStoreChange() {
    this.setState({
      eventState: EventStore.getAll()
    });
  }

  handleAppStoreChange() {
    this.setState({
      appState: AppStore.getAll()
    });
  }

  render() {
    // get selection status
    const eventState = this.state.eventState;
    const appState = this.state.appState;
    const currentEvent = eventState.eventList[appState.currentEventIndex];
    const attendanceBoxFocused = appState.appBoxSelected === AttendanceBox;
    const eventListBoxFocused = appState.appBoxSelected === EventListBox;
    return (
      <div className="checkin-box">
        <EventModalBackdrop mode={appState.modalMode}/>
        <EventListBox events={eventState.eventList}
                      currentEventIndex={appState.currentEventIndex}
                      visible={appState.eventListVisible}
                      focused={eventListBoxFocused}/>
        <AttendanceBox event={currentEvent}
                       appState={appState}
                       focused={attendanceBoxFocused}/>
        <div className="clear"></div>
        <EventModal mode={appState.modalMode}
                    currentEventIndex={appState.currentEventIndex}
                    event={currentEvent}/>
      </div>
    );
  }
}