import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(domContainer) {
    const thisBooking = this;

    thisBooking.render(domContainer);
    thisBooking.getDomElements();
    thisBooking.initWidgets();
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
      console.log(thisBooking.widgets.peopleAmount.value);
    });
    thisBooking.widgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', () => {
      console.log(thisBooking.widgets.hoursAmount.value);
    });
    thisBooking.widgets.date = new DatePicker(thisBooking.dom.date);
    thisBooking.widgets.time = new HourPicker(thisBooking.dom.time);
  }
}

export default Booking;
