'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import useEvents from "@/app/hooks/useEvents";
import useAcademies from "@/app/hooks/useAcademies";
import useUsers from "@/app/hooks/useUsers";

export default function Resultados() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const { events } = useEvents();
    const { academies } = useAcademies();
    const { users } = useUsers();
    const [filteredResults, setFilteredResults] = useState([]);

    useEffect(() => {
        if (query.trim() === "") {
            setFilteredResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        const filteredEvents = events.filter((event) =>
            event.name.toLowerCase().includes(lowerQuery) ||
            event.eventType?.toLowerCase().includes(lowerQuery) ||
            event.location?.placeName?.toLowerCase().includes(lowerQuery)
        );

        const filteredAcademies = academies.filter((academy) =>
            academy.name.toLowerCase().includes(lowerQuery)
        );

        const filteredUsers = users.filter((user) =>
            user.firstName.toLowerCase().includes(lowerQuery) ||
            user.lastName.toLowerCase().includes(lowerQuery) ||
            user.email.at(0).toLowerCase().includes(lowerQuery) ||
            user.email.at(1)?.toLowerCase().includes(lowerQuery)
        );

        setFilteredResults([...filteredEvents, ...filteredAcademies, ...filteredUsers]);
    }, [query, events, academies, users]);

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Resultados para: "{query}"</h1>
            {filteredResults.length > 0 ? (
                <ul className="space-y-4">
                    {filteredResults.map((result) => (
                        <li key={result.id} className="p-4 border rounded-lg shadow bg-[#fef6ff] hover:bg-[#d3cfd4]">
                            <Link href={result.eventType ? `/event/${result.id}` : result.email ? `/user/${result.id}` : `/academy/${result.id}`} className="text-red-600 hover:underline">
                                {result.name}
                            </Link>
                            <p className="text-gray-600">
                                {result.eventType
                                    ? `${result.eventType} - ${result.location.district}, ${result.location.department}`
                                    : result.email
                                        ? `Usuario ${result.firstName} ${result.lastName} - ${result.email}`
                                        : `Academia - ${result.location.district}, ${result.location.department}`}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No se encontraron resultados.</p>
            )}
        </div>
    );
}