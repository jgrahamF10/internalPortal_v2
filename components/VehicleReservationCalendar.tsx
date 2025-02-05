"use client";

import React, { useState, Fragment, useMemo } from "react";
import {
    Calendar,
    momentLocalizer,
    Views,
    DateLocalizer,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { type Reservation, generateReservations } from "@/lib/reservationUtils";
import ReservationDetailsModal from "./ReservationDetailsModal";
import PropTypes from "prop-types";

const mLocalizer = momentLocalizer(moment);

export default function VehicleReservationCalendar({
    localizer = mLocalizer,
    ...props
}) {
    const [reservations] = useState<Reservation[]>(generateReservations(10));
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);

    const handleSelectEvent = (event: Reservation) => {
        setSelectedReservation(event);
    };

    const closeModal = () => {
        setSelectedReservation(null);
    };

    return (
        <div className="h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">
                Vehicle Reservation Calendar
            </h1>
            <Calendar
                localizer={localizer}
                events={reservations}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "calc(100% - 100px)" }}
                onSelectEvent={handleSelectEvent}
                views={[
                    Views.MONTH,
                    Views.WEEK,
                    Views.WORK_WEEK,
                    Views.DAY,
                    Views.AGENDA,
                ]}
                step={60}
                defaultView="month"
            />
            {selectedReservation && (
                <ReservationDetailsModal
                    reservation={selectedReservation}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

VehicleReservationCalendar.propTypes = {
    localizer: PropTypes.instanceOf(DateLocalizer),
    showDemoLink: PropTypes.bool,
};
