'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import useEvents from "@/app/hooks/useEvents";

export default function Resultados() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const { events } = useEvents();
    const [filteredEvents, setFilteredEvents] = useState([]);

    useEffect(() => {
        if (query.trim() === "") {
            setFilteredEvents([]);
            return;
        }

        const results = events.filter((event) => {
            const lowerQuery = query.toLowerCase();
            return (
                event.name.toLowerCase().includes(lowerQuery) ||
                event.eventType?.toLowerCase().includes(lowerQuery) ||
                event.location?.placeName?.toLowerCase().includes(lowerQuery)
            );
        });

        setFilteredEvents(results);
    }, [query, events]);

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Resultados para: "{query}"</h1>
            {filteredEvents.length > 0 ? (
                <ul className="space-y-4">
                    {filteredEvents.map((event) => (
                        <li key={event.id} className="p-4 border rounded-lg shadow bg-[#fef6ff] hover:bg-[#d3cfd4]">
                            <Link href={`/event/${event.id}`} className="text-red-600 hover:underline">
                                {event.name}
                            </Link>
                            <p className="text-gray-600">{event.eventType} - {event.location.district}, {event.location.department}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No se encontraron resultados.</p>
            )}
        </div>
    );
}