/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import useAcademies from "@/app/hooks/useAcademies";
import useUser from "@/app/hooks/useUser";
import useUsers from "@/app/hooks/useUsers";
import { Academy } from "@/app/types/academyType";
import { Timestamp } from "firebase/firestore";
import { Tag } from "lucide-react";
import { useEffect, useState } from "react";

const Academies = () => {
  const { academies, saveAcademy, deleteAcademy, updateAcademy } =
    useAcademies();

  const { getUserById } = useUsers();

  const [newAcademy, setNewAcademy] = useState<Omit<Academy, "id"> | null>(
    null
  );
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  // Estado para almacenar los nombres de usuario ya cargados
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Guardamos los IDs que necesitamos cargar
    const organizerIdsToFetch = academies
      .map((academy) => academy.organizerId)
      .filter((id) => id && !userNames[id]);

    // Si no hay nada nuevo que cargar, salimos temprano
    if (organizerIdsToFetch.length === 0) return;

    const loadUserNames = async () => {
      const newUserNames: Record<string, string> = {};

      for (const organizerId of organizerIdsToFetch) {
        try {
          const user = await getUserById(organizerId);
          if (user) {
            newUserNames[organizerId] = user.firstName + " " + user.lastName;
          }
        } catch (error) {
          console.error("Error loading user:", error);
        }
      }

      setUserNames((prev) => ({ ...prev, ...newUserNames }));
    };

    loadUserNames();
  }, [academies]); // Eliminamos getUserById y userNames de las dependencias

  // const newAcademy: Omit<Academy, "id"> = {
  //   organizerId: "NNQh1zDy54efxXxxpGdc8xUOyip2",
  //   name: "Academia Deportiva Campeones",
  //   email: "info@campeones.com",
  //   phoneNumber: "+51987654321",
  //   location: {
  //     street: "Av. Los Deportistas 453",
  //     district: "San Borja",
  //     province: "Lima",
  //     department: "Lima",
  //     placeName: "Complejo Deportivo Municipal",
  //     coordinates: {
  //       latitude: "-12.0864",
  //       longitude: "-77.0028",
  //     },
  //   },
  //   createdAt: Timestamp.now(),
  //   updatedAt: Timestamp.now(),
  // };
  const columns: ColumnDef[] = [
    {
      key: "id",
      title: "ID",
      render: (value: any, item: Academy) => {
        return (
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-black" />
            {value}
          </div>
        );
      },
      width: "100px",
    },
    {
      key: "organizerId",
      title: "Organizador",
      render: (value: any, item: Academy) => {
        return (
          <div>{userNames[value] ? <div>{userNames[value]}</div> : value}</div>
        );
      },
    },
    {
      key: "name",
      title: "Academy Name",
    },
    {
      key: "email",
      title: "Email",
      render: (value: any, item: Academy) => {
        return (
          <a href={`mailto:${value}`} className="text-blue-500 hover:underline">
            {value}
          </a>
        );
      },
      width: "100px",
    },
    {
      key: "phoneNumber",
      title: "Número telefónico",
    },
    {
      key: "location",
      title: "Ubicación",
      render: (value: any, item: Academy) => {
        const { latitude, longitude } = item.location.coordinates;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        return (
          <div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {item.location.street}
            </a>
          </div>
        );
      },
      width: "150px",
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Academy) => {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpdateAcademy(item.id, item)}
              className="text-blue-500 hover:underline"
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteAcademy(item.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const handleSaveAcademy = async () => {
    try {
      const docRef = await saveAcademy(newAcademy);
      console.log("Academy saved: ", docRef);
      console.log(academies);
    } catch (error) {
      console.error("Error saving academy: ", error);
    }
  };

  const handleDeleteAcademy = async (id: string) => {
    try {
      const success = await deleteAcademy(id);
      if (success) {
        console.log("Academy deleted successfully");
      } else {
        console.error("Failed to delete academy");
      }
    } catch (error) {
      console.error("Error deleting academy: ", error);
    }
  };

  const handleUpdateAcademy = async (
    id: string,
    academyUpdated: Omit<Academy, "id">
  ) => {
    // try {
    //   const academyToUpdate = academies.find((academy) => academy.id === id);
    //   if (academyToUpdate) {
    //     const updatedAcademy = {
    //       ...academyToUpdate,
    //       updatedAt: Timestamp.now(),
    //     };
    //     await updateAcademy(id, updatedAcademy);
    //     console.log("Academy updated successfully");
    //   } else {
    //     console.error("Academy not found");
    //   }
    // } catch (error) {
    //   console.error("Error updating academy: ", error);
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div id="table-div" className="w-full px-4">
        <AcademiesDatatable columns={columns} data={academies} />
      </div>
    </div>
  );
};

interface ColumnDef<T = any> {
  key: string; // Clave para acceder al dato en el objeto
  title: string; // Título por defecto para el encabezado
  render?: (value: any, item: T, index: number) => React.ReactNode; // Función opcional para renderizar contenido personalizado
  renderHeader?: () => React.ReactNode; // Función opcional para personalizar el encabezado
  width?: string;
}

interface AcademiesDatatableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

const AcademiesDatatable = <T extends Record<string, any>>({
  columns,
  data,
}: AcademiesDatatableProps<T>) => {
  return (
    <table className="min-w-full text-sm rounded-lg shadow-md border-1 border-gray-200 overflow-auto">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="px-4 py-2 border-b border-gray-300 text-left uppercase font-light text-gray-500"
              style={
                column.width
                  ? { width: column.width, maxWidth: column.width }
                  : {}
              }
            >
              {column.renderHeader ? column.renderHeader() : column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-gray-100">
            {columns.map((column) => (
              <td
                key={column.key}
                className="px-4 py-4 border-b border-gray-300 whitespace-nowrap bg-white"
                style={
                  column.width
                    ? {
                        width: column.width,
                        maxWidth: column.width,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }
                    : {}
                }
                title={item[column.key]}
              >
                {column.render
                  ? column.render(item[column.key], item, rowIndex)
                  : item[column.key] !== undefined
                  ? item[column.key]
                  : ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Academies;
