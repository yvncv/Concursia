
"use client";

import useAcademies from "@/app/hooks/useAcademies";
import useUser from "@/app/hooks/useUser";
import useUsers from "@/app/hooks/useUsers";
import { Academy } from "@/app/types/academyType";
import { Timestamp } from "firebase/firestore";
import {
  CircleEllipsis,
  Eye,
  FilePenLine,
  MapPin,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const Academies = () => {
  const { academies, saveAcademy, deleteAcademy, updateAcademy } =
    useAcademies();

  const { getUserById } = useUsers();

  const [newAcademy, setNewAcademy] = useState<
    Omit<Academy, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    email: "",
    phoneNumber: "",
    location: {
      street: "",
      district: "",
      province: "",
      department: "",
      placeName: "",
      coordinates: { latitude: "", longitude: "" },
    },
    organizerId: "",
    profileImage: ""
  });
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  // Estado para almacenar los nombres de usuario ya cargados
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [openContactMenu, setOpenContactMenu] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<
    "view" | "edit" | "add" | "delete"
  >("view");

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

  const columns: ColumnDef[] = [
    {
      key: "id",
      title: "ID",
      render: (value: any, item: Academy) => {
        return (
          <div className="flex items-center gap-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {value}
          </div>
        );
      },
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
      key: "Contacto",
      title: "Contacto",
      render: (value: any, item: Academy) => {
        const isOpen = openContactMenu === item.id;

        return (
          <div className="relative flex items-center justify-center">
            <CircleEllipsis
              className="w-6 h-6 text-gray-400 hover:text-black hover:cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenContactMenu(isOpen ? null : item.id);
              }}
            />

            {isOpen && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50 w-64">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Información de contacto</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenContactMenu(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email:</p>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-blue-500 hover:underline"
                    >
                      {item.email}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Teléfono:
                    </p>
                    <a
                      href={`tel:${item.phoneNumber}`}
                      className="text-blue-500 hover:underline"
                    >
                      {item.phoneNumber}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Ubicación:
                    </p>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <a
                        href={`https://www.google.com/maps?q=${item.location.coordinates.latitude},${item.location.coordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        {item.location.street}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Academy) => {
        return (
          <div className="flex justify-center space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="Visualizar"
              onClick={() => handleSeeAcademy(item)}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
              title="Editar"
              onClick={() => handleUpdateAcademy(item)}
            >
              <FilePenLine className="w-5 h-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Eliminar"
              onClick={() => handleDeleteAcademy(item)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleSaveAcademy = async () => {
    setNewAcademy({
      name: "",
      email: "",
      phoneNumber: "",
      location: {
        street: "",
        district: "",
        province: "",
        department: "",
        placeName: "",
        coordinates: { latitude: "", longitude: "" },
      },
      organizerId: "",
      profileImage: ""
    });
    setDialogMode("add");
    setDialogOpen(true);
  };

  const handleDeleteAcademy = async (academy: Academy) => {
    setSelectedAcademy(academy);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleUpdateAcademy = async (academyToUpdate: Academy) => {
    setSelectedAcademy(academyToUpdate);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSeeAcademy = async (academy: Academy) => {
    setSelectedAcademy(academy);
    console.log(academy);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col p-4 h-screen">
      <div id="general-actions" className="">
        <button
          id="add-academy"
          onClick={handleSaveAcademy}
          className="p-2 rounded-md text-white bg-rojo uppercase"
        >
          Agregar
        </button>
      </div>
      <div id="table-div" className="w-full">
        <AcademiesDatatable columns={columns} data={academies} />
      </div>

      {/* Academy Dialog */}
      {dialogOpen && (dialogMode === "add" || selectedAcademy) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {dialogMode === "view" && "Detalles de la Academia"}
                {dialogMode === "edit" && "Editar Academia"}
                {dialogMode === "add" && "Agregar Nueva Academia"}
                {dialogMode === "delete" && "Eliminar Academia"}
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {dialogMode === "add" && (
                <div className="flex flex-col gap-y-4">
                  {/* Form fields for editing will go here */}
                  <div>
                    <label htmlFor="add-name">Nombre de academia:</label> <br />
                    <input
                      id="add-name"
                      type="text"
                      value={newAcademy.name}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          name: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-email">Email:</label> <br />
                    <input
                      id="add-email"
                      type="text"
                      value={newAcademy.email}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          email: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-phoneNumber">Celular:</label> <br />
                    <input
                      id="add-phoneNumber"
                      type="text"
                      value={newAcademy.phoneNumber}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-placeName">
                      Nombre del lugar:
                    </label>{" "}
                    <br />
                    <input
                      id="add-location-placeName"
                      type="text"
                      value={newAcademy.location.placeName}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            placeName: e.target.value,
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-street">Dirección:</label>{" "}
                    <br />
                    <input
                      id="add-location-street"
                      type="text"
                      value={newAcademy.location.street}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            street: e.target.value,
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-province">Provincia:</label>{" "}
                    <br />
                    <input
                      id="add-location-province"
                      type="text"
                      value={newAcademy.location.province}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            province: e.target.value,
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-department">
                      Departamento:
                    </label>{" "}
                    <br />
                    <input
                      id="add-location-department"
                      type="text"
                      value={newAcademy.location.department}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            department: e.target.value,
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-district">Distrito:</label>{" "}
                    <br />
                    <input
                      id="add-location-district"
                      type="text"
                      value={newAcademy.location.district}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            district: e.target.value,
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-coordinates-latitude">
                      Latitude:
                    </label>{" "}
                    <br />
                    <input
                      id="add-location-coordinates-longitude"
                      type="text"
                      value={newAcademy.location.coordinates.latitude}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            coordinates: {
                              ...newAcademy.location.coordinates,
                              latitude: e.target.value,
                            },
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-location-coordinates-longitude">
                      Longitud:
                    </label>{" "}
                    <br />
                    <input
                      id="add-location-coordinates-longitude"
                      type="text"
                      value={newAcademy.location.coordinates.longitude}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          location: {
                            ...newAcademy.location,
                            coordinates: {
                              ...newAcademy.location.coordinates,
                              longitude: e.target.value,
                            },
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="add-organizerId">Organizador:</label> <br />
                    <input
                      id="add-organizerId"
                      type="text"
                      value={newAcademy.organizerId}
                      onChange={(e) =>
                        setNewAcademy({
                          ...newAcademy,
                          organizerId: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                </div>
              )}

              {dialogMode === "view" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-500">ID:</h3>
                      <p>{selectedAcademy.id}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Nombre:</h3>
                      <p>{selectedAcademy.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Email:</h3>
                      <p>{selectedAcademy.email}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Teléfono:</h3>
                      <p>{selectedAcademy.phoneNumber}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Dirección:</h3>
                      <p>{selectedAcademy.location.street}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">
                        Organizador:
                      </h3>
                      <p>
                        {userNames[selectedAcademy.organizerId] ||
                          selectedAcademy.organizerId}
                      </p>
                    </div>
                  </div>

                  {selectedAcademy.location?.coordinates && (
                    <div>
                      <h3 className="font-medium text-gray-500">Ubicación:</h3>
                      <a
                        href={`https://www.google.com/maps?q=${selectedAcademy.location.coordinates.latitude},${selectedAcademy.location.coordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:underline"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        Ver en Google Maps
                      </a>
                    </div>
                  )}
                </div>
              )}

              {dialogMode === "edit" && (
                <div className="flex flex-col gap-y-4">
                  {/* Form fields for editing will go here */}
                  <div>
                    <label htmlFor="edit-id">ID de la academia:</label> <br />
                    <p
                      id="edit-id"
                      onChange={(e) => {}}
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    >
                      {selectedAcademy.id}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="edit-name">Nombre de academia:</label>{" "}
                    <br />
                    <input
                      id="edit-name"
                      type="text"
                      value={selectedAcademy.name}
                      onChange={(e) =>
                        setSelectedAcademy({
                          ...selectedAcademy,
                          name: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-email">Email:</label> <br />
                    <input
                      id="edit-email"
                      type="text"
                      value={selectedAcademy.email}
                      onChange={(e) =>
                        setSelectedAcademy({
                          ...selectedAcademy,
                          email: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-phoneNumber">Celular:</label> <br />
                    <input
                      id="edit-phoneNumber"
                      type="text"
                      value={selectedAcademy.phoneNumber}
                      onChange={(e) =>
                        setSelectedAcademy({
                          ...selectedAcademy,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-location-street">Dirección:</label>{" "}
                    <br />
                    <input
                      id="edit-location-street"
                      type="text"
                      value={selectedAcademy.location.street}
                      onChange={(e) =>
                        setSelectedAcademy({
                          ...selectedAcademy,
                          location: {
                            ...selectedAcademy.location,
                            street: e.target.value,
                          },
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                </div>
              )}

              {dialogMode === "delete" && (
                <div className="text-center py-4">
                  <p className="mb-4">
                    ¿Estás seguro de que deseas eliminar la academia "
                    {selectedAcademy.name}"?
                  </p>
                  <p className="text-red-500 mb-6">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              {dialogMode === "add" && (
                <>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={handleCloseDialog}
                  >
                    Cerrar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    onClick={async () => {
                      console.log(newAcademy);
                      if (newAcademy) {
                        await saveAcademy({
                          ...newAcademy,
                          createdAt: Timestamp.now(),
                          updatedAt: Timestamp.now(),
                        });
                      }
                      handleCloseDialog();
                    }}
                  >
                    Guardar Cambios
                  </button>
                </>
              )}
              {dialogMode === "view" && (
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={handleCloseDialog}
                >
                  Cerrar
                </button>
              )}

              {dialogMode === "edit" && (
                <>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    onClick={async () => {
                      // Logic for update would go here
                      console.log(selectedAcademy);
                      if (selectedAcademy) {
                        const updatedAcademy = {
                          ...selectedAcademy,
                          updatedAt: Timestamp.now(),
                        };
                        await updateAcademy(selectedAcademy.id, updatedAcademy);
                      }
                      // handleCloseDialog();
                    }}
                  >
                    Guardar Cambios
                  </button>
                </>
              )}

              {dialogMode === "delete" && (
                <>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                    onClick={async () => {
                      if (selectedAcademy) {
                        try {
                          const success = await deleteAcademy(
                            selectedAcademy.id
                          );
                          if (success) {
                            console.log("Academy deleted successfully");
                          } else {
                            console.error("Failed to delete academy");
                          }
                        } catch (error) {
                          console.error("Error deleting academy: ", error);
                        }
                        handleCloseDialog();
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
                className="px-4 py-4 border-b whitespace-nowrap border-gray-300 bg-white"
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
