'use strict';

import React from 'react';
import classNames from 'classnames';

import { AttendanceFormConstants as AFConstants } from '../constants';
import AttendanceStore from '../stores/AttendanceStore';
import { AppActions, AttendanceFormActions } from '../actions';

export class AttendanceBox extends React.Component {
  constructor(props) {
    super(props);
  }

  handleFocus() {
    AppActions.appBoxSelected(AttendanceBox);
  }

  handleKeyPress(event) {
    let key = event.keyIdentifier || event.key;
    if (key === 'Enter') {
      key = '\n';
    }
    AttendanceFormActions.keyPressed(key);
  }

  render() {
    let eventName = null;
    let eventLogs = [];
    const event = this.props.event;
    if (event) {
      eventName = event.name;
      eventLogs = event.logs;
    }
    const className = classNames('attendance-box',
      {'no-event': !this.props.event});

    return (
      <div className={className} onFocus={this.handleFocus}
           onKeyPress={this.handleKeyPress} tabIndex="2">
        <EventTitle name={eventName}/>
        <AttendanceForm store={this.props.appState}
                        focused={this.props.focused}/>
        <AttendanceLogs logs={eventLogs}/>
      </div>
    );
  }
}
AttendanceBox.defaultProps = {
  appState: {
    keys: '',
    logs: []
  }
};

class EventTitle extends React.Component {
  render() {
    const name = this.props.name || 'No Event Selected';
    return (
      <div className="title">
        <h2>{name}</h2>
      </div>
    )
  }
}

class AttendanceForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scanStatus: null
    };

    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  makeMessage(status) {
    switch (status) {
      case AFConstants.READY:
        return 'Ready to scan!';
      case AFConstants.NOT_READY:
        return 'Not ready (click here to start scanning)';
      case AFConstants.ERROR:
        return 'Error! See log below.'
    }
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  componentDidMount() {
    let that = this;
    AttendanceStore.on(AFConstants.ERROR, function () {
      that.setState({
        scanStatus: AFConstants.ERROR
      });
    });
    AttendanceStore.on(AFConstants.READY, function () {
      that.setState({
        scanStatus: AFConstants.READY
      });
    })
  }

  componentWillReceiveProps(nextProps) {
    let scanStatus;

    // recover from error with another swipe
    if (nextProps.focused) {
      scanStatus = AFConstants.READY;
      const keys = nextProps.store.keys;
      if (keys && keys.length !== 0) {
        scanStatus = AFConstants.ATTENDANCE_KEY_PRESSED;
      }
    }
    else {
      scanStatus = AFConstants.NOT_READY;
    }

    this.setState({
      scanStatus: scanStatus
    });
  }

  render() {
    const message = this.makeMessage(this.state.scanStatus);
    const scanData = this.props.store.keys;

    return (
      <form className="attendance-form" action="" method="post"
            onSubmit={this.handleSubmit}>
        <div className="status">
          <StatusSymbol status={this.state.scanStatus}/>
          <div className="message">{message}</div>
        </div>
        <input type="hidden" id="scan-data" value={scanData}/>
      </form>
    );
  }
}

class StatusSymbol extends React.Component {
  render() {
    const codepoint = {
      [AFConstants.READY]: '✓',
      [AFConstants.ATTENDANCE_KEY_PRESSED]: '…',
      [AFConstants.NOT_READY]: '?',
      [AFConstants.ERROR]: '✕'
    }[this.props.status];

    const statusClass = {
      [AFConstants.READY]: 'ready',
      [AFConstants.ATTENDANCE_KEY_PRESSED]: 'ready',
      [AFConstants.NOT_READY]: 'not-ready',
      [AFConstants.ERROR]: 'error'
    }[this.props.status];

    const className = classNames('status-symbol', statusClass);
    return (
      <div className={className}>{codepoint}</div>
    );
  }
}

class AttendanceLogs extends React.Component {
  render() {
    let logs = [];

    for (let i = this.props.logs.length - 1; i >= 0; i--) {
      const log = this.props.logs[i];
      const timestamp = log.timestamp.fromNow();
      const trKey = `${log.message} - ${log.timestamp}`;
      logs.push(
        <tr key={trKey}>
          <td>{timestamp}</td>
          <td>{log.message}</td>
        </tr>
      );
    }

    return (
      <div className="log">
        <h3>Scan Log</h3>
        <table className="logs">
          <thead>
          <tr>
            <th>Time</th>
            <th>Message</th>
          </tr>
          </thead>
          <tbody>
          {logs}
          </tbody>
        </table>
      </div>
    );
  }
}