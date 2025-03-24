"use client";
import React, { useState } from "react";
import {
    Calendar,
    momentLocalizer,
    Views,
    DateLocalizer,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { generateReservations } from "@/lib/reservationUtils";
import ReservationDetailsModal from "./detailsModal";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";

export interface Vehicle {
    id: string
    name: string
    type: string
  }
  
  export interface Reservation {
    id: string
    vehicleId: string
    start: Date
    end: Date
    title: string
  }

const mLocalizer = momentLocalizer(moment);

export default function VehicleReservationCalendar({
    localizer = mLocalizer,
    ...props
}) {
    const [reservations] = useState<Reservation[]>(generateReservations(10));
    const [selectedReservation, setSelectedReservation] = 
        useState<Reservation | null>(null);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH);

    const handleSelectEvent = (event: Reservation) => {
        setSelectedReservation(event);
    };

    const closeModal = () => {
        setSelectedReservation(null);
    };

    const handleNavigate = (newDate: Date) => {
        setDate(newDate);
    };
    
    const handleViewChange = (newView: any) => {
        setView(newView);
    };



    return (
        <div className="h-screen p-4">
            <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-bold mb-4">
                Vehicle Reservation Calendar
            </h1>
                <Button className="bg-green-600" onClick={handleCreate}>Create Reservation</Button>
                </div>
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
                date={date}
                view={view}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                popup
                selectable
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