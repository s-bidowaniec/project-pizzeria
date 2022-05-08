import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(domContainer) {
    const thisBooking = this;

    thisBooking.render(domContainer);
    thisBooking.initWidgets();
  }
  render(domElement){
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = domElement;
    const domBookingTemplate = document.querySelector(select.templateOf.bookingWidget);
    const bookingTemplate = Handlebars.compile(domBookingTemplate.innerHTML);
    const bookingHTML = bookingTemplate();
    thisBooking.dom.wrapper.innerHTML = bookingHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.widgets = {};
    thisBooking.widgets.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', ()=>{
      console.log(thisBooking.widgets.peopleAmount.value);
    });
    thisBooking.widgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated',  ()=>{
      console.log(thisBooking.widgets.hoursAmount.value);
    });
  }
}

export default Booking;
