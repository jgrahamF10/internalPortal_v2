"use client";
import React, { SetStateAction, useEffect, useState } from "react";
import {
    Calendar,
    momentLocalizer,
    Views,
    DateLocalizer,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReservationDetailsModal from "./detailsModal";
import PropTypes from "prop-types";
import NewF10VehiclesRezForm from "@/app/vehicles/newRezModal";
import { useSession } from "next-auth/react";
import { F10Vehicles, F10VehiclesRezs } from "@/db/schema/utilities_db";
import { getF10VehiclesRezs } from "@/app/vehicles/vehicleActions";
import { EosIconsBubbleLoading } from "@/components/spinner";

interface Rez extends F10VehiclesRezs {
    vehicle: F10Vehicles
}

const mLocalizer = momentLocalizer(moment);

export default function VehicleReservationCalendar({
    localizer = mLocalizer,
    ...props
}) {
    const [reservations, setReservations] = useState<Rez[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [selectedReservation, setSelectedReservation] =
        useState<Rez | null>(null);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState(Views.MONTH);
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    // Convert string dates to Date objects for calendar and add title for display
    const formatReservationsForCalendar = (reservations: Rez[]) => {
        return reservations.map(reservation => {
            // Create a title for the event display
            const title = `${reservation?.vehicle.vehicleName} - ${reservation.driver} - ${reservation.reason}`;
            
            return {
                ...reservation,
                title: title, // Add title property for calendar display
                pickUpDate: new Date(reservation.pickUpDate),
                returnDate: reservation.returnDate ? new Date(reservation.returnDate) : new Date(reservation.pickUpDate)
            };
        });
    };

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const fetchRez = await getF10VehiclesRezs();
                console.log("fetchVehicles", fetchRez);
                
                // Store original data
                setReservations(fetchRez);
                
                // Format dates for calendar
                const formattedEvents = formatReservationsForCalendar(fetchRez);
                setCalendarEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSelectEvent = (event: {
        returnDate: string | number | Date;
        pickUpDate: string | number | Date; 
        id: number; 
    }) => {
        // Find the original reservation with string dates for the modal
        const originalReservation = reservations.find(r => r.id === event.id);
        if (!originalReservation) return;
        setSelectedReservation(originalReservation);
    };

    const closeModal = () => {
        setSelectedReservation(null);
    };

    const handleNavigate = (newDate: React.SetStateAction<Date>) => {
        setDate(newDate);
    };

    const handleViewChange = (newView: SetStateAction<'month'>) => {
        setView(newView);
    };

    const refresh = async () => {
        try {
            setIsLoading(true);
            const fetchRez = await getF10VehiclesRezs();
            setReservations(fetchRez);
            
            // Format dates for calendar
            const formattedEvents = formatReservationsForCalendar(fetchRez);
            setCalendarEvents(formattedEvents);
        } catch (error) {
            console.error("Error refreshing reservations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Custom event component to display more info
    const eventStyleGetter = () => {
        return {
            style: {
                backgroundColor: '#3174ad',
                borderRadius: '4px',
                color: 'white',
                border: 'none',
                display: 'block',
                padding: '2px 5px'
            }
        };
    };

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <EosIconsBubbleLoading />
            </div>
        );
    }

    return (
        <div className="h-screen p-4">
            <div className="flex flex-row justify-between">
                <h1 className="text-2xl font-bold mb-4">
                    Vehicle Reservation Calendar
                </h1>
                <NewF10VehiclesRezForm
                    onReservationCreated={refresh}
                    creatingUser={session?.user?.name ?? ""}
                />
            </div>
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="pickUpDate"
                endAccessor="returnDate"
            
                style={{ height: "calc(100% - 100px)" }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
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
                onView={(newView) => handleViewChange(newView as typeof view)}
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