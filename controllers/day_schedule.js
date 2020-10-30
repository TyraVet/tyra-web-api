const MOMENT = require('moment');
const DAY_SCHEDULE = require('../models/day_schedule.js');
const APPOINTMENT = require('../models/appointment.js');

/* Create Day Schedule or Get Day Schedule
 *
 * When the user enters the application it should return the current
 * day schedule of the day. If the day schedule isn't in the database
 * it should create one. */
exports.DaySchedule = (req, res) => {
	DAY_SCHEDULE.findOne({ date: new Date(req.body.date) }, (err, MyDaySchedule) => {
		if(err)
			res.status(406).json(err);

		if(!MyDaySchedule){
			/* The date has a very specific format, so to avoid any issues
			 * we better create a temporal date, format it and create a ne
			 * date as today and then compare. */
			let temp_date = new Date();
			temp_date = MOMENT(temp_date).format('YYYY-MM-DD');
			today = new Date(temp_date);
			const REQUEST_DAY = new Date(req.body.date);

			if(REQUEST_DAY < today){
				res.status(410).json();
			}else{
				const NewDaySchedule = new DAY_SCHEDULE({
					date: req.body.date,
					appointments: []
				}).save((err, NewDaySchedule) => {
					if(err)
						res.status(406).json(err);

					/* Success */
					res.status(201).json(NewDaySchedule);
				})
			}
		}else{
			/* Success */
			res.status(200).json(MyDaySchedule);
		}
	});
};

/* Add Appointment
 *
 * The user can add appointments to the day schedule. */
exports.AddAppointment = (req, res) => {
	if(!req.body.service || !req.body.clientId || !req.body.petId)
		return res.status(406).json({ error: 'No Service or Client send' });

	const MY_APPOINTMENT = new APPOINTMENT({
		service: req.body.service,
		clientId: req.body.clientId,
		petId: req.body.petId,
		hour: req.body.hour,
		notes: req.body.notes ? req.body.notes : null
	});

	let appointments = req.body.appointments;
	appointments.push(MY_APPOINTMENT);

	DAY_SCHEDULE.findByIdAndUpdate(req.body.id,
								  { appointments: appointments },
								  err => {
		if(err)
			res.status(406).json(err);

		/* Success */
		res.status(201).json(appointments);
	});
};

/* Update Appointment
 *
 * The user can change the appointment state from un-done to done
 * and from done to un-done. */
exports.UpdateAppointment = (req, res, next) => {
	DAY_SCHEDULE.findByIdAndUpdate(req.body.id,
								  { appointments: req.body.appointments },
								  (err, appointments) => {
		if(err)
			res.status(406).json(err);

		/* Success */
		res.status(201).json(appointments);
	});
};
