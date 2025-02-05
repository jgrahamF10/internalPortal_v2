"use client";
import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import { getFlights, getAllFLightCredits } from "../actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EosIconsBubbleLoading } from "@/components/spinner";
import Link from "next/link";
import styled from "styled-components";
import { useSession } from "next-auth/react";

import { ThemeColors } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TextField = styled.input`
    height: 32px;
    width: 200px;
    border-radius: 3px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border: 1px solid #e5e5e5;
    padding: 0 32px 0 16px;

    &:hover {
        cursor: pointer;
    }
`;

const FilterComponent = ({
    filterText,
    onFilter,
    onClear,
}: {
    filterText: string;
    onFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}) => (
    <div className="flex justify-between items-center mb-4">
        <TextField
            id="search"
            type="text"
            placeholder="Filter assets"
            aria-label="Search Input"
            value={filterText}
            onChange={onFilter}
            className="form-input"
        />
        <button
            type="button"
            onClick={onClear}
            className="btn btn-secondary bg-red-400 px-1 py-1 rounded-md"
        >
            Clear
        </button>
    </div>
);

export default function Page() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const [inactives, setInactives] = useState<boolean>(true);
    const [filterText, setFilterText] = useState<string>("");
    const [resetPaginationToggle, setResetPaginationToggle] =
        useState<boolean>(false);
    const { data: session } = useSession();
    const { backgroundColor, fontColor, mutedColor } = ThemeColors();

    useEffect(() => {
        async function fetchData() {
            const flightData: any = await getAllFLightCredits();
            console.log("flight credits", flightData);
            setData(flightData);
            setLoading(false);
        }
        fetchData();
    }, []);

    const errorStatusChange = (estatus: boolean) => {
        setErrorStatus(estatus);
        if (estatus) {
            setErrorStatus(true);
        } else {
            window.location.reload();
        }
    };

    const handleInactive = () => {
        setInactives(!inactives);
    };

    const filteredAssets = data.filter((flight) => {
        // Filter by active/inactive status
        if (inactives) {
            if (flight.archived !== false) return false;
        }
        // If filterText is empty, include all remaining users
        if (!filterText) return true;

        // Convert filterText to lowercase for case-insensitive matching
        const lowerFilterText = filterText.toLowerCase();

        // Match against the relevant fields
        return (
            flight.flightConfirmationNumber
                .toLowerCase()
                .includes(lowerFilterText) ||
            flight.members.firstname.toLowerCase().includes(lowerFilterText) ||
            flight.members.lastname.toLowerCase().includes(lowerFilterText) ||
            flight.departureAirport.toLowerCase().includes(lowerFilterText)
        );
    });

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText("");
            }
        };

        return (
            <FilterComponent
                onFilter={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilterText(e.target.value)
                }
                onClear={handleClear}
                filterText={filterText}
            />
        );
    }, [filterText, resetPaginationToggle]);

    const columns = [
        {
            name: "OriginalConfirmation #",
            selector: (row: any) => row.flight.flightConfirmationNumber,
            cell: (row: any) => (
                <Link
                    href={`/flights/${row.flight.flightConfirmationNumber}`}
                    className="font-bold text-lg text-green-700 capitalize hover:underline"
                >
                    <span
                        className={
                            row?.verified === false
                                ? "text-warning"
                                : row?.verified === true
                                ? "text-green-700"
                                : "text-primary"
                        }
                    >
                        {row.flight.flightConfirmationNumber}
                    </span>
                </Link>
            ),
            sortable: true,
            center: true,
        },
        {
            name: "Passenger",
            selector: (row: any) => row.members?.firstname,
            sortable: true,
            center: true,
            cell: (row: any) => (
                <span className="capitalize">
                    {row.member?.firstname} {row.member?.lastname}
                </span>
            ),
        },
        {
            name: "Original Flight Date",
            selector: (row: any) => row.flight.travelDate,
            sortable: true,
            center: true,
        },
        {
            name: "Credits Amount",
            selector: (row: any) => row.amount,
            sortable: true,
            center: true,
            cell: (row: any) => (
                <span className="text-green-700">${row.amount ?? 0}</span>
            ),
            
        },
        {
            name: "Credits Used",
            selector: (row: any) => row.departureAirport,
            sortable: true,
            center: true,
            cell: (row: any) => (
                <div>
            {row.creditUsage?.map((credit: any) => (
                <div key={credit.id} className="text-red-700">
                    ${credit.amount ?? 0}
                </div>
            ))}
        </div>
            ),
        },
        {
            name: "Airline",
            selector: (row: any) => row.flight.airlines.airlines,
            sortable: true,
            center: true,
        },
        {
            name: "Expiration Date",
            selector: (row: any) => row.expirationDate,
            sortable: true,
            center: true,
        },
        {
            name: "Credits Used",
            selector: (row: any) => row.used,
            sortable: true,
            center: true,
            cell: (row: any) => {
                const totalCreditUsage = row.creditUsage?.reduce((sum: number, credit: any) => 
                    sum + (credit.amount || 0), 0) || 0;
                    
                const isFullyUsed = totalCreditUsage === row.amount;
                return (
                    <span className={isFullyUsed ? "text-green-600" : "text-red-600"}>
                        {isFullyUsed ? "Yes" : "No"}
                    </span>
                );
            }
        },
    ];

    if (loading) {
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

    const customStyles = {
        rows: {
            style: {
                minHeight: "72px", // override the row height
            },
        },
        headCells: {
            style: {
                paddingLeft: "2px", // override the cell padding for head cells
                paddingRight: "2px",
                color: fontColor,
                fontWeight: "bold",
                fontSize: "16px",
                backgroundColor: backgroundColor,
            },
        },
        subHeader: {
            style: {
                backgroundColor: backgroundColor,
                color: fontColor,
            },
        },
        cells: {
            style: {
                paddingLeft: "4px", // override the cell padding for data cells
                paddingRight: "4px",
                fontSize: "16px",
                backgroundColor: backgroundColor,
                color: fontColor,
                fontWeight: "bold",
            },
        },
        pagination: {
            style: {
                backgroundColor: backgroundColor,
                color: fontColor,
            },
            pageButtonsStyle: {
                color: fontColor,
                fill: fontColor,
                backgroundColor: "transparent",
                "&:disabled": {
                    cursor: "unset",
                    color: fontColor,
                    fill: mutedColor,
                },
                "&:hover:not(:disabled)": {
                    backgroundColor: "#c1f2f3",
                },
                "&:focus": {
                    outline: "none",
                    backgroundColor: "#aa82f3",
                },
            },
        },
    };

    const refresh = () => {
        window.location.reload();
    };

    return (
        <div className="flex justify-center min-h-[90vh]">
            <div className="shadow-xl p-6 rounded-md max-w-screen-xl min-w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">Flight Credit Tracker</h1>
                    {session?.roles?.some((role) =>
                        ["Managers", "Human Resources"].includes(role)
                    ) && (
                        <Button className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg">
                            New Credit
                        </Button>
                    )}
                </div>
                <div className="flex justify-start mb-4">
                    <h3
                        className="text-sm font-semibold cursor-pointer"
                        onClick={handleInactive}
                    >
                        <button className="bg-blue-600 text-white py-1 px-2 rounded-sm hover:bg-blue-700">
                            Show Archived
                        </button>
                    </h3>
                </div>
                <h3 className="pb-2">
                    Displaying {filteredAssets.length} Flight Credits
                </h3>
                <div className="overflow-auto rounded-md w-full">
                    <DataTable
                        columns={columns}
                        data={filteredAssets}
                        pagination
                        paginationResetDefaultPage={resetPaginationToggle}
                        paginationPerPage={20}
                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        subHeader
                        subHeaderComponent={subHeaderComponentMemo}
                        customStyles={customStyles}
                        //theme="solarized"
                    />
                </div>
                <Alert
                    variant="destructive"
                    className={errorStatus ? "" : "hidden"}
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        That manufacturer already exists.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
