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
    const [filter, setFilter] = useState("all"); // Estado para el filtro

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

        let results = [];
        if (filter === "events") results = filteredEvents;
        else if (filter === "academies") results = filteredAcademies;
        else if (filter === "users") results = filteredUsers;
        else results = [...filteredEvents, ...filteredAcademies, ...filteredUsers];

        setFilteredResults(results);
    }, [query, events, academies, users, filter]);

    return (
        <div className="flex">
            {/* Barra lateral */}
            <aside className="w-1/4 p-4 bg-gray-100 border-r">
                <h2 className="text-lg font-bold mb-4">Filtrar por:</h2>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => setFilter("all")}
                            className={`w-full text-left px-4 py-2 rounded-lg ${filter === "all" ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                            Todos
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setFilter("events")}
                            className={`w-full text-left px-4 py-2 rounded-lg ${filter === "events" ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                            Eventos
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setFilter("academies")}
                            className={`w-full text-left px-4 py-2 rounded-lg ${filter === "academies" ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                            Academias
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setFilter("users")}
                            className={`w-full text-left px-4 py-2 rounded-lg ${filter === "users" ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                            Usuarios
                        </button>
                    </li>
                </ul>
            </aside>

            {/* Resultados */}
            <main className="w-3/4 p-6">
                <h1 className="text-2xl font-bold mb-4">Resultados para: "{query}"</h1>
                {filteredResults.length > 0 ? (
                    <ul className="space-y-4">
                        {filteredResults.map((result) => (
                            <li key={result.id} className="p-4 border rounded-lg shadow bg-[#fef6ff] hover:bg-[#d3cfd4]">
                                <Link href={result.eventType ? `/event/${result.id}` : result.roleId === 'user' ? `/profiles/user/${result.id}` : `/profiles/academy/${result.id}`} className="text-red-600 hover:underline">
                                   {result.name} {result.firstName} {result.lastName}
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
            </main>
        </div>
    );
}