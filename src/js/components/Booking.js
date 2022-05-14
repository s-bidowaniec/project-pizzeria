import {select, settings} from '../settings.js';
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
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
      });

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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.widgets = {};
    thisBooking.widgets.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', () => {
      //console.log(thisBooking.widgets.peopleAmount.value);
    });
    thisBooking.widgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', () => {
      //console.log(thisBooking.widgets.hoursAmount.value);
    });
    thisBooking.widgets.date = new DatePicker(thisBooking.dom.date);
    thisBooking.widgets.time = new HourPicker(thisBooking.dom.time);
  }
}

export default Booking;
