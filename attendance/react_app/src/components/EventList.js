'use strict';

import React from 'react';
import classNames from 'classnames';

import { AppActions } from '../actions';

export class EventListBox extends React.Component {
  handleFocus() {
    AppActions.appBoxSelected(EventListBox);
  }

  render() {
    return (
      <div className="event-list-box" onFocus={this.handleFocus} tabIndex="1">
        <div className="title">
          <h2>Events</h2>
        </div>
        <EventList events={this.props.events}
                   currentEventIndex={this.props.currentEventIndex}/>
      </div>
    );
  }
}

class EventList extends React.Component {
  render() {
    const that = this;
    const events = this.props.events.map(function (event, index) {
      const selected = (index === that.props.currentEventIndex);
      const key = 'event-info-' + event.id;
      const liKey = 'li-' + key;
      const liClass = classNames({selected: selected});
      return (
        <li key={liKey} className={liClass}>
          <EventInfo event={event} index={index}/>
        </li>
      );
    });
    return (
      <ul className="event-list">
        {events}
        <AddEventItem />
      </ul>
    )
  }
}

class EventInfo extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleEditClick() {
    AppActions.viewEventModal(this.props.index);
  }

  handleClick() {
    AppActions.selectEvent(this.props.index);
  }

  render() {
    const event = this.props.event;
    const dtFormatted = event.datetime.format('HH:mm on M/D');
    const className = classNames('event-info', {selected: this.props.selected});
    return (
      <div className={className} onClick={this.handleClick}>
        <div>{event.name} ({dtFormatted})</div>
        <div>{event.num_attendees} attendees</div>
        <div className="edit-button" onClick={this.handleEditClick}>▼</div>
      </div>
    );
  }
}

class AddEventItem extends React.Component {
  //noinspection JSMethodCanBeStatic
  handleClick() {
    AppActions.showCreateEventModal();
  }

  render() {
    return (
      <li className="add-event" onClick={this.handleClick}>
        <span className="plus">+</span> Add Event
      </li>
    );
  }
}