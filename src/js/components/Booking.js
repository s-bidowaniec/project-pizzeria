import {select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(domContainer) {
    const thisBooking = this;

    thisBooking.render(domContainer);
    thisBooking.getDomElements();
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }

  render(domElement) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = domElement;
    const domBookingTemplate = document.querySelector(select.templateOf.bookingWidget);
    const bookingTemplate = Handlebars.compile(domBookingTemplate.innerHTML);
    const bookingHTML = bookingTemplate();
    thisBooking.dom.wrapper.innerHTML = bookingHTML;
  }

  getDomElements() {
    const thisBooking = this;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.time = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.booking.floor);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.widgets = {};
    thisBooking.widgets.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.widgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.widgets.date = new DatePicker(thisBooking.dom.date);
    thisBooking.widgets.time = new HourPicker(thisBooking.dom.time);
  }

  getData() {
    const thisBooking = this;

    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(thisBooking.widgets.date.minDate)}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(thisBooking.widgets.date.maxDate)}`;

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params', params);
    const urls = {
      bookings: `${settings.db.url}/${settings.db.booking}?${params.bookings.join('&')}`,
      eventsCurrent: `${settings.db.url}/${settings.db.event}?${params.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${settings.db.event}?${params.eventsRepeat.join('&')}`,
    };
    //console.log(urls);
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    console.log(eventsRepeat);
    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.widgets.date.minDate;
    const maxDate = thisBooking.widgets.date.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log(thisBooking.booked);
    thisBooking.updateDOM();
  }

  initActions() {
    const thisBooking = this;

    thisBooking.dom.wrapper.addEventListener('updated', function (event) {
      thisBooking.updateDOM();
      thisBooking.updateTable(event);
    });

    thisBooking.dom.floor.addEventListener('click', function (event) {
      thisBooking.updateTable(event);
    });
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop ', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.widgets.date.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.widgets.time.value);

    let allAvalible = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
    ) {
      allAvalible = true;
    }
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvalible
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(tableId))
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  updateTable(event) {
    const thisBooking = this;


    if (event.type === 'updated') {
      // reset
      thisBooking.dom.tables.forEach((table) => {
        table.classList.remove(classNames.booking.tableChoosed);
      });
      thisBooking.selectedTable = null;
    } else if (event.type == 'click') {
      // update
      const thisClickedElement = event.target;
      if (thisClickedElement.classList.contains('table') && !thisClickedElement.classList.contains('booked')) {
        thisBooking.dom.tables.forEach((table) => {
          if (table !== thisClickedElement) {
            table.classList.remove(classNames.booking.tableChoosed);
          }
        });
        const activated = thisClickedElement.classList.toggle(classNames.booking.tableChoosed);
        thisBooking.selectedTable = activated ? thisClickedElement.getAttribute('data-table') : null;
        console.log(thisBooking.selectedTable);
      }
    } else {
      console.log('unknow event for table update: ', event);
    }
  }
}

export default Booking;
