'use strict';

import React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import DateTime from 'react-datetime';

import { AppConstants } from '../constants';
import { EventActions, AppActions } from '../actions';

export class EventModal extends React.Component {
  render() {
    let eventName, visible;
    switch (this.props.mode) {
      case AppConstants.CREATE_EVENT_MODAL:
        eventName = 'New Event';
        visible = true;
        break;
      case AppConstants.VIEW_EVENT_MODAL:
        eventName = 'Edit Event - ' + this.props.event.name;
        visible = true;
        break;
      case AppConstants.CLOSE_EVENT_MODAL:
        eventName = '';
        visible = false;
        break;
    }

    const className = classNames('event-modal', {visible: visible});
    return (
      <div className={className}>
        <h2 className="title">{eventName}</h2>
        <EventForm index={this.props.currentEventIndex} event={this.props.event}
                   mode={this.props.mode}/>
      </div>
    );
  }
}

export class EventModalBackdrop extends React.Component {
  handleClick() {
    AppActions.closeEventModal();
  }

  render() {
    const classes = classNames('modal-blackout',
      {visible: this.props.mode !== AppConstants.CLOSE_EVENT_MODAL});
    return (
      <div className={classes} onClick={this.handleClick}></div>
    );
  }
}

class EventForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      datetime: moment()
    };

    this.componentWillReceiveProps= this.componentWillReceiveProps.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const event = nextProps.event;
    if (event) {
      this.setState({
        name: event.name,
        datetime: event.datetime
      });
    }
  }

  handleDateTimeChange(momentObj) {
    this.setState({datetime: momentObj});
  }

  handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  handleDelete(event) {
    event.preventDefault();
    EventActions.deleteEvent(this.props.index);
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.props.mode === AppConstants.CREATE_EVENT_MODAL) {
      EventActions.createEvent(this.state.name, this.state.datetime);
    }
    else if (this.props.mode === AppConstants.VIEW_EVENT_MODAL) {
      EventActions.updateEvent(this.props.index, this.state.name,
        this.state.datetime);
    }
  }

  render() {
    let submitValue, deleteButton;
    if (this.props.mode === AppConstants.CREATE_EVENT_MODAL) {
      submitValue = 'Create';
    }
    else {
      submitValue = 'Edit';
      deleteButton = <input className="delete" type="submit" value="Delete"
                            onClick={this.handleDelete}/>;
    }

    return (
      <form id="event-modal-form" action="" method="post"
            onSubmit={this.handleSubmit}>
        <div className="row">
          <label htmlFor="model-name">Name</label>
          <input type="text" id="modal-name" value={this.state.name}
                 onChange={this.handleNameChange}/>
        </div>
        <div className="row">
          <label htmlFor="model-datetime">Date + Time</label>
          <DateTime id="modal-datetime"
                    value={this.state.datetime}
                    onChange={this.handleDateTimeChange}/>
        </div>
        <div className="buttons">
          {deleteButton}
          <input type="reset" value="Reset"/>
          <input type="submit" value={submitValue}/>
        </div>
      </form>
    )
  }
}