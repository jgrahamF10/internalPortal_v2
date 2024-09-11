'use client';
import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
//import { AddForm } from "@/app/(postAuth)/assets/NewAsset";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EosIconsBubbleLoading } from "@/components/spinner";
import Link from "next/link";
import styled from "styled-components";
import { auth } from "@/auth"
import { Session } from "next-auth";
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

export default function Page( { session }: { session: Session | null }) {
   
    const router = useRouter();
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorStatus, setErrorStatus] = useState<boolean>(false);
    const [inactives, setInactives] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>("");
    const [resetPaginationToggle, setResetPaginationToggle] =
        useState<boolean>(false);

    useEffect(() => {
        async function fetchData() {
            const results: any = await getAssets();
            const lgroups: any = await getLGroups();

            const assetsWithLGroups = results.map((asset: any) => {
                const locationGroup = lgroups.find(
                    (group: any) => group.id === asset.site.locationGroup_id
                );
                return { ...asset, locationGroup };
            });

            //console.log("assets with lgroups", assetsWithLGroups);
            setAssets(assetsWithLGroups);
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

    const filteredAssets = assets.filter((item: any) => {
        if (item.inactive !== inactives) return false;
        if (!filterText) return true;
        const lowerFilterText = filterText.toLowerCase();
        return (
            item.serialNumber.toLowerCase().includes(lowerFilterText) ||
            item.assetModel.model.toLowerCase().includes(lowerFilterText) ||
            item.assetModel.assetType.type.toLowerCase().includes(lowerFilterText)  || 
            item.site.siteName.toLowerCase().includes(lowerFilterText) ||
            item.owned.toLowerCase().includes(lowerFilterText) ||
            item.locationGroup.locationGroupName.toLowerCase().includes(lowerFilterText)
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
            name: "Serial Number",
            selector: (row: any) => row.serialNumber,
            cell: (row: any) => (
                <Link
                    href={`/assets/${row.serialNumber}`}
                    className="font-medium text-green-700 capitalize hover:underline"
                >
                    {row.serialNumber}
                </Link>
            ),
            sortable: true,
        },
        {
            name: "Model",
            selector: (row: any) => row.assetModel.model,
            sortable: true,
        },
        {
            name: "Type",
            selector: (row: any) => row.assetModel.assetType.type,
            sortable: true,
            cell: (row: any) => (
                <span className="capitalize">{row.assetModel.assetType.type}</span>
            ),
        },
        {
            name: "Site",
            selector: (row: any) => row.site.siteName,
            sortable: true,
            cell: (row: any) => (
                <span className="capitalize">{row.site.siteName}</span>
            ),
        },
        { name: "Owner", selector: (row: any) => row.owned, sortable: true },
        {
            name: "Location Group",
            selector: (row: any) => row.locationGroup.locationGroupName,
            sortable: true,
        },
        {
            name: "Warranty Status",
            selector: (row: any) => (row.warrantyStatus ? "Active" : "Expired"),
            sortable: true,
            cell: (row: any) => (
                <span className={row.warrantyStatus ? "text-green-600" : "text-red-600"}>
                    {row.warrantyStatus ? "Active" : "Expired"}
                </span>
            ),
        },
        {
            name: "Install Date",
            selector: (row: any) => row.installDate,
            sortable: true,
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

    if (!session?.roles?.some(role => ["Managers", "Human Resources"].includes(role))) {
        return <NotAuth />
        
      }

    return (
        <div className="flex justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-xl p-6 rounded-md max-w-screen-xl w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">All Assets</h1>
                    {/*(user?.publicMetadata?.admin as boolean) && (
                        <AddForm errorStatusChange={errorStatusChange} />
                    )*/}
                </div>
                <div className="flex justify-start mb-4">
                    <h3
                        className="text-sm font-semibold cursor-pointer"
                        onClick={handleInactive}
                    >
                        Show inactives
                    </h3>
                </div>
                <h3>Displaying {filteredAssets.length} Assets</h3>
                <div className="overflow-auto">
                    <DataTable
                        columns={columns}
                        data={filteredAssets}
                        pagination
                        paginationResetDefaultPage={resetPaginationToggle}
                        paginationPerPage={20}
                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        subHeader
                        subHeaderComponent={subHeaderComponentMemo}
                        persistTableHead
                        actions={actionsMemo}
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
