"use client";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import {
    CardTitle,
    CardDescription,
    CardHeader,
    CardContent,
    Card,
} from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { EosIconsBubbleLoading } from "@/components/ui/spinner";


export default function CurrentMonthOverview() {
    const [assets, setAssets] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [transformedData, setTransformedData] = useState<any[]>([]);
    const [locationData, setLocationData] = useState<any[]>([]);  

    useEffect(() => {
        // Demo data
        const demoAssets = [
            { assetModel: { model: "Model A" }, site: { locationGroup: { locationGroupName: "Location 1", locationGroup_id: 3 } }, installDate: new Date() },
            { assetModel: { model: "Model B" }, site: { locationGroup: { locationGroupName: "Location 2", locationGroup_id: 4 } }, installDate: new Date() },
            { assetModel: { model: "Model A" }, site: { locationGroup: { locationGroupName: "Location 1", locationGroup_id: 3 } }, installDate: null },
            { assetModel: { model: "Model C" }, site: { locationGroup: { locationGroupName: "Location 3", locationGroup_id: 5 } }, installDate: new Date() },
        ];

        setAssets(demoAssets);
        setLoading(false);

        // Transform data to get assetModel counts
        const assetModelCount = demoAssets.reduce(
            (acc: any, asset: any) => {
                const model = asset.assetModel.model;
                if (!acc[model]) {
                    acc[model] = 0;
                }
                acc[model]++;
                return acc;
            },
            {}
        );

        const transformedData = Object.entries(assetModelCount).map(
            ([model, count]) => ({
                id: model,
                value: count,
            })
        );
        setTransformedData(transformedData);

        const locationCount = demoAssets.reduce(
            (acc: any, asset: any) => {
                const location = asset.site.locationGroup.locationGroupName;
                if (!acc[location]) {
                    acc[location] = 0;
                }
                acc[location]++;
                return acc;
            },
            {}
        );

        const locationData = Object.entries(locationCount).map(
            ([name, count]) => ({
                name,
                count,
            })
        );
        setLocationData(locationData);
    }, []);

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

    return (
        <main className="flex-1 overflow-auto h-screen-full p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Asset Count</CardTitle>
                    <CardDescription>
                        Total count of Assets in the inventory
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-4xl font-bold">
                        {assets.length ? assets.length : 0}
                    </div>
                </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Assets Deployed MTD</CardTitle>
                    <CardDescription>
                        Total count of assets deployed month to date.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-4xl font-bold">
                        {
                            assets.filter(
                                (asset: {
                                    site: { locationGroup_id: number };
                                }) =>
                                    asset.site.locationGroup_id !== 1 &&
                                    asset.site.locationGroup_id !== 2
                            ).length
                        }
                    </div>
                </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Total Assets Deployed</CardTitle>
                    <CardDescription>
                        Total count of assets deployed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-4xl font-bold">
                    {
                            assets.filter(
                                (asset: { installDate: Date | null }) => asset.installDate !== null
                            ).length
                        }
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Asset Breakdown</CardTitle>
                    <CardDescription>
                        Distribution of assets brands in the inventory
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LabelledPieChart
                        data={transformedData}
                        className="aspect-[4/3]"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Location Breakdown</CardTitle>
                    <CardDescription>
                        Distribution of assets by county
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BarChart data={locationData} className="aspect-[4/3]" />
                </CardContent>
            </Card>
        </main>
    );
}

function BarChart({ data, ...props }: any) {
    return (
        <div {...props}>
            <ResponsiveBar
                data={data}
                keys={["count"]}
                indexBy="name"
                margin={{ top: 4, right: 0, bottom: 40, left: 40 }}
                padding={0.3}
                colors={["#1c7a29", "#0A2E36", "#FF9505","#B8B08D", "#EC4E20"]}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 16,
                }}
                axisLeft={{
                    tickSize: 0,
                    tickValues: 4,
                    tickPadding: 16,
                }}
                gridYValues={4}
                theme={{
                    tooltip: {
                        chip: {
                            borderRadius: "9999px",
                        },
                        container: {
                            fontSize: "16px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                        },
                    },
                    grid: {
                        line: {
                            stroke: "#f3f4f6",
                        },
                    },
                }}
                tooltipLabel={({ id }) => `${id}`}
                enableLabel={false}
                role="application"
                ariaLabel="A bar chart showing data"
            />
        </div>
    );
}

function LabelledPieChart({ data, ...props }: any) {
    return (
        <div {...props}>
            <ResponsivePie
                data={data}
                sortByValue
                margin={{ top: 30, right: 50, bottom: 30, left: 50 }}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={3}
                activeOuterRadiusOffset={2}
                borderWidth={1}
                arcLinkLabelsThickness={1}
                enableArcLabels={false}
                colors={["#0A2E36", "#1c7a29", "#FF9505", ]}
                theme={{
                    tooltip: {
                        chip: {
                            borderRadius: "9999px",
                        },
                        container: {
                            fontSize: "16px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                        },
                    },
                }}
                role="application"
            />
        </div>
    );
}

function PieChart(props: any) {
    return (
        <div {...props}>
            <ResponsivePie
                data={[
                    { id: "Sig Pad", value: 100,  },
                    { id: "Camera", value: 100 },
                    { id: "Scanner", value: 100 },
                ]}
                sortByValue
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                cornerRadius={0}
                padAngle={0}
                borderWidth={1}
                borderColor={"#ffffff"}
                enableArcLinkLabels={false}
                arcLabel={(d) => `${d.id}`}
                arcLabelsTextColor={"#ffffff"}
                arcLabelsRadiusOffset={0.65}
                colors={["#2563eb"]}
                theme={{
                    labels: {
                        text: {
                            fontSize: "18px",
                        },
                    },
                    tooltip: {
                        chip: {
                            borderRadius: "9999px",
                        },
                        container: {
                            fontSize: "12px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                        },
                    },
                }}
                role="application"
            />
        </div>
    );
}
