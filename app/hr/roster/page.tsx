"use client";
import React, { useState, useEffect, useMemo } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { getRoster } from "../hrActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EosIconsBubbleLoading } from "@/components/spinner";
import Link from "next/link";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import CreateUserForm from "@/components/hr_components/newMember";
import { ThemeColors } from "@/lib/utils";
import NotAuth from "@/components/auth/notAuth";


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
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const [inactives, setInactives] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>("");
    const [resetPaginationToggle, setResetPaginationToggle] =
        useState<boolean>(false);
    const { data: session } = useSession();
    const { backgroundColor, fontColor, mutedColor } = ThemeColors();
    
    useEffect(() => {
        async function fetchData() {
            const members: any = await getRoster();
            // console.log("members", members);
            setMembers(members);
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

    const filteredAssets = members.filter((user) => {
        // Filter by active/inactive status
        if (inactives) {
            if (user.status !== "Inactive") return false;
        } else {
            if (user.status !== "Active") return false;
        }

        // If filterText is empty, include all remaining users
        if (!filterText) return true;

        // Convert filterText to lowercase for case-insensitive matching
        const lowerFilterText = filterText.toLowerCase();

        // Match against the relevant fields
        return (
            user.preferedName.toLowerCase().includes(lowerFilterText) ||
            user.designation?.toLowerCase().includes(lowerFilterText) || // Assuming you meant designation
            user.email?.toLowerCase().includes(lowerFilterText) ||
            user.city?.toLowerCase().includes(lowerFilterText) ||
            user.state?.toLowerCase().includes(lowerFilterText) ||
            user.zipcode?.toLowerCase().includes(lowerFilterText)
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
            name: "Name",
            selector: (row: any) => row.preferedName,
            cell: (row: any) => (
                <Link
                    href={`/hr/roster/${row.preferedName}-${row.lastname}`}
                    className="font-medium text-green-700 capitalize hover:underline"
                >
                    {row.preferedName} {row.lastname}
                </Link>
            ),
            sortable: true,
        },
        {
            name: "Designation",
            selector: (row: any) => row.designation,
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row: any) => row.phone,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row: any) => row.email,
            sortable: true,
        },
        {
            name: "City",
            selector: (row: any) => row.city,
            sortable: true,
            cell: (row: any) => <span className="capitalize">{row.city}</span>,
        },
        {
            name: "State",
            selector: (row: any) => row.state,
            sortable: true,
            cell: (row: any) => <span className="capitalize">{row.state}</span>,
        },
        {
            name: "Status",
            selector: (row: any) => (row.status ? "Active" : "Inactive"),
            sortable: true,
            cell: (row: any) => (
                <span
                    className={row.status ? "text-green-600" : "text-red-600"}
                >
                    {row.status ? "Active" : "Inactive"}
                </span>
            ),
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
                paddingLeft: "8px", // override the cell padding for head cells
                paddingRight: "8px",
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
                paddingLeft: "6px", // override the cell padding for data cells
                paddingRight: "4px",
                fontSize: "14px",
                backgroundColor: backgroundColor,
                color: fontColor,
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
                '&:disabled': {
				cursor: 'unset',
				color: fontColor,
				fill: mutedColor,
			},
			'&:hover:not(:disabled)': {
				backgroundColor: '#c1f2f3',
			},
			'&:focus': {
				outline: 'none',
				backgroundColor: '#aa82f3',
			},
            },
        },
    };

    if (
        !session?.roles?.some((role) =>
            ["Managers", "Human Resources"].includes(role)
        )
    ) {
        return <NotAuth />;
    }

    return (
        <div className="flex justify-center min-h-[90vh]">
            <div className="shadow-xl p-6 rounded-md max-w-screen-xl w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">Tech Roster</h1>
                    {session?.roles?.some((role) =>
                        ["Managers", "Human Resources"].includes(role)
                    ) && (
                        <CreateUserForm
                            errorStatusChange={errorStatusChange}
                            creatingUser={session?.user?.name ?? ""}
                        />
                    )}
                </div>
                <div className="flex justify-start mb-4">
                    <h3
                        className="text-sm font-semibold cursor-pointer"
                        onClick={handleInactive}
                    >
                        <button className="bg-blue-600 text-white py-1 px-2 rounded-sm hover:bg-blue-700">
                            Show inactives
                        </button>
                    </h3>
                </div>
                <h3 className="pb-2">
                    Displaying {filteredAssets.length} Technicians
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
