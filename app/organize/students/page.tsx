/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { AcademiesDatatable, type ColumnDef } from "@/app/admin/academies/page";
import useUsers from "@/app/hooks/useUsers";
import { useEffect, useState } from "react";
import { User } from "@/app/types/userType";
import { Eye, FilePenLine, Trash2, MapPin, UserPlus } from "lucide-react";
import { Timestamp } from "firebase/firestore";

const StudentsPage = () => {
  const { users, updateUserById, deleteUserById, saveUser } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Initial empty user state
  const emptyUser: User = {
    id: "",
    roleId: "",
    dni: "",
    firstName: "",
    lastName: "",
    birthDate: null as unknown as Timestamp,
    gender: "",
    email: [""],
    phoneNumber: [""],
    category: "",
    attendedEvents: [],
    participatedEvents: [],
    level: "",
    academyId: "",
    academyName: "",
    profileImage: "",
    createdAt: null as unknown as Timestamp,
    location: {
      department: "",
      district: "",
      province: "",
    },
    marinera: {
      academyId: "",
      attendedEvents: [],
      participant: {
        category: "",
        level: "",
        participatedEvents: [],
      },
      participatedEvents: [],
    },
  };

  const [newUser, setNewUser] = useState<User>(emptyUser);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Add dialog states
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<
    "view" | "edit" | "add" | "delete"
  >("view");

  // Update the handlers to use dialogs
  const handleSeeStudent = (student: User) => {
    setSelectedUser(student);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleUpdateStudent = (student: User) => {
    setSelectedUser(student);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteStudent = (student: User) => {
    setSelectedUser(student);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const handleAddStudent = () => {
    setNewUser({ ...emptyUser });
    setDialogMode("add");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) => user.academyId !== "" && user.academyId)
    );
  }, [users]);

  // Your columns definition can remain the same
  const columns: ColumnDef[] = [
    {
      key: "dni",
      title: "DNI",
    },
    {
      key: "academyName",
      title: "Academia",
    },
    {
      key: "student",
      title: "Estudiante",
      render: (value: any, item: User) => {
        return <p>{`${item.firstName} ${item.lastName}`}</p>;
      },
    },
    {
      key: "gender",
      title: "Sexo",
      render: (value: any, item: User) => {
        return <p>{value.split(0, 1)}</p>;
      },
    },
    {
      key: "category",
      title: "Categoría",
      render: (value: any, item: User) => {
        return <p>{item.marinera.participant.category}</p>;
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: User) => {
        return (
          <div className="flex justify-center space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="Visualizar"
              onClick={() => handleSeeStudent(item)}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
              title="Editar"
              onClick={() => handleUpdateStudent(item)}
            >
              <FilePenLine className="w-5 h-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Eliminar"
              onClick={() => handleDeleteStudent(item)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col p-4 h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Estudiantes</h1>
        <button
          onClick={handleAddStudent}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          <UserPlus className="w-5 h-5" />
          Agregar Estudiante
        </button>
      </div>

      <div id="table-div" className="w-full">
        <AcademiesDatatable columns={columns} data={filteredUsers} />
      </div>

      {/* Student Dialog - for edit and view */}
      {dialogOpen && selectedUser && dialogMode !== "add" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {dialogMode === "view" && "Detalles del Estudiante"}
                {dialogMode === "edit" && "Editar Estudiante"}
                {dialogMode === "add" && "Agregar Nuevo Estudiante"}
                {dialogMode === "delete" && "Eliminar Estudiante"}
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {dialogMode === "view" && (
                <div className="space-y-4">
                  {/* Profile Image */}
                  {selectedUser.profileImage && (
                    <div className="flex justify-center mb-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                        <img
                          src={
                            typeof selectedUser.profileImage === "string"
                              ? selectedUser.profileImage
                              : URL.createObjectURL(selectedUser.profileImage)
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-500">DNI:</h3>
                      <p>{selectedUser.dni}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">
                        Nombre completo:
                      </h3>
                      <p>{`${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">
                        Fecha de nacimiento:
                      </h3>
                      <p>
                        {selectedUser.birthDate?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Género:</h3>
                      <p>{selectedUser.gender}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Email:</h3>
                      <p>{selectedUser.email.join(", ")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Teléfono:</h3>
                      <p>{selectedUser.phoneNumber.join(", ")}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Academia:</h3>
                      <p>{selectedUser.academyName || "No asignado"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Categoría:</h3>
                      <p>{selectedUser.marinera.participant.category}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Nivel:</h3>
                      <p>{selectedUser.marinera.participant.level}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500">Ubicación:</h3>
                    <p>{`${selectedUser.location.district}, ${selectedUser.location.province}, ${selectedUser.location.department}`}</p>
                  </div>

                  {selectedUser.marinera.participant.participatedEvents
                    ?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-500">
                        Eventos participados:
                      </h3>
                      <ul className="list-disc pl-5">
                        {selectedUser.marinera.participant.participatedEvents.map(
                          (event, index) => (
                            <li key={index}>{event}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {selectedUser.marinera.attendedEvents?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-500">
                        Eventos asistidos:
                      </h3>
                      <ul className="list-disc pl-5">
                        {selectedUser.marinera.attendedEvents.map(
                          (event, index) => (
                            <li key={index}>{event}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {dialogMode === "edit" && selectedUser && (
                <div className="flex flex-col gap-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="edit-firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre
                      </label>
                      <input
                        id="edit-firstName"
                        type="text"
                        value={selectedUser.firstName}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            firstName: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Apellidos
                      </label>
                      <input
                        id="edit-lastName"
                        type="text"
                        value={selectedUser.lastName}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            lastName: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-dni"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        DNI
                      </label>
                      <input
                        id="edit-dni"
                        type="text"
                        value={selectedUser.dni}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            dni: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="edit-gender"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Género
                      </label>
                      <select
                        id="edit-gender"
                        value={selectedUser.gender}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            gender: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">
                      Información de Contacto
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="edit-email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email
                        </label>
                        <input
                          id="edit-email"
                          type="email"
                          value={selectedUser.email[0] || ""}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              email: [
                                e.target.value,
                                ...selectedUser.email.slice(1),
                              ],
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Teléfono
                        </label>
                        <input
                          id="edit-phone"
                          type="tel"
                          value={selectedUser.phoneNumber[0] || ""}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              phoneNumber: [
                                e.target.value,
                                ...selectedUser.phoneNumber.slice(1),
                              ],
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Ubicación</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="edit-department"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Departamento
                        </label>
                        <input
                          id="edit-department"
                          type="text"
                          value={selectedUser.location.department}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              location: {
                                ...selectedUser.location,
                                department: e.target.value,
                              },
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-province"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Provincia
                        </label>
                        <input
                          id="edit-province"
                          type="text"
                          value={selectedUser.location.province}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              location: {
                                ...selectedUser.location,
                                province: e.target.value,
                              },
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-district"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Distrito
                        </label>
                        <input
                          id="edit-district"
                          type="text"
                          value={selectedUser.location.district}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              location: {
                                ...selectedUser.location,
                                district: e.target.value,
                              },
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marinera Information */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">
                      Información de Marinera
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="edit-category"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Categoría
                        </label>
                        <select
                          id="edit-category"
                          value={selectedUser.marinera.participant.category}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              marinera: {
                                ...selectedUser.marinera,
                                participant: {
                                  ...selectedUser.marinera.participant,
                                  category: e.target.value,
                                },
                              },
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Infantil">Infantil</option>
                          <option value="Junior">Junior</option>
                          <option value="Juvenil">Juvenil</option>
                          <option value="Adulto">Adulto</option>
                          <option value="Senior">Senior</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="edit-level"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nivel
                        </label>
                        <select
                          id="edit-level"
                          value={selectedUser.marinera.participant.level}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              marinera: {
                                ...selectedUser.marinera,
                                participant: {
                                  ...selectedUser.marinera.participant,
                                  level: e.target.value,
                                },
                              },
                            })
                          }
                          className="p-2 border border-gray-300 rounded-lg w-full"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Principiante">Principiante</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Imagen de Perfil</h3>
                    <div className="flex items-center gap-4">
                      {selectedUser.profileImage && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300">
                          <img
                            src={
                              typeof selectedUser.profileImage === "string"
                                ? selectedUser.profileImage
                                : URL.createObjectURL(selectedUser.profileImage)
                            }
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedUser({
                              ...selectedUser,
                              profileImage: e.target.files[0],
                            });
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {dialogMode === "delete" && (
                <div className="text-center py-4">
                  <p className="mb-4">
                    ¿Estás seguro de que deseas eliminar al estudiante "
                    {`${selectedUser.firstName} ${selectedUser.lastName}`}"?
                  </p>
                  <p className="text-red-500 mb-6">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
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
                      await updateUserById(selectedUser);
                      handleCloseDialog();
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
                      await deleteUserById(selectedUser.id);
                      setSelectedUser(null);
                      handleCloseDialog();
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

      {/* Add Student Dialog */}
      {dialogOpen && dialogMode === "add" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                Agregar Nuevo Estudiante
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="add-firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nombre *
                    </label>
                    <input
                      id="add-firstName"
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          firstName: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Apellidos *
                    </label>
                    <input
                      id="add-lastName"
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          lastName: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-dni"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      DNI *
                    </label>
                    <input
                      id="add-dni"
                      type="text"
                      value={newUser.dni}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          dni: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Género *
                    </label>
                    <select
                      id="add-gender"
                      value={newUser.gender}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          gender: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="add-birthDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fecha de nacimiento *
                    </label>
                    <input
                      id="add-birthDate"
                      type="date"
                      value={
                        newUser.birthDate instanceof Timestamp
                          ? new Date(newUser.birthDate.seconds * 1000)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setNewUser({
                          ...newUser,
                          birthDate: Timestamp.fromDate(date) as any,
                        });
                      }}
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="add-roleId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Rol *
                    </label>
                    <select
                      id="add-roleId"
                      value={newUser.roleId}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          roleId: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded-lg w-full"
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="student">Estudiante</option>
                      <option value="teacher">Profesor</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Información de Contacto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="add-email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        id="add-email"
                        type="email"
                        value={newUser.email[0] || ""}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            email: [e.target.value],
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="add-phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Teléfono *
                      </label>
                      <input
                        id="add-phone"
                        type="tel"
                        value={newUser.phoneNumber[0] || ""}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            phoneNumber: [e.target.value],
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Ubicación</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="add-department"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Departamento *
                      </label>
                      <input
                        id="add-department"
                        type="text"
                        value={newUser.location.department}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            location: {
                              ...newUser.location,
                              department: e.target.value,
                            },
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="add-province"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Provincia *
                      </label>
                      <input
                        id="add-province"
                        type="text"
                        value={newUser.location.province}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            location: {
                              ...newUser.location,
                              province: e.target.value,
                            },
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="add-district"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Distrito *
                      </label>
                      <input
                        id="add-district"
                        type="text"
                        value={newUser.location.district}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            location: {
                              ...newUser.location,
                              district: e.target.value,
                            },
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Academy and Marinera Information */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">
                    Información de Academia y Marinera
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="add-academyId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        ID de Academia
                      </label>
                      <input
                        id="add-academyId"
                        type="text"
                        value={newUser.academyId || ""}
                        onChange={(e) => {
                          const academyId = e.target.value;
                          setNewUser({
                            ...newUser,
                            academyId,
                            marinera: {
                              ...newUser.marinera,
                              academyId: academyId,
                            },
                          });
                        }}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="add-academyName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre de Academia
                      </label>
                      <input
                        id="add-academyName"
                        type="text"
                        value={newUser.academyName || ""}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            academyName: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="add-category"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Categoría
                      </label>
                      <select
                        id="add-category"
                        value={newUser.marinera.participant.category}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            marinera: {
                              ...newUser.marinera,
                              participant: {
                                ...newUser.marinera.participant,
                                category: e.target.value,
                              },
                            },
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Infantil">Infantil</option>
                        <option value="Junior">Junior</option>
                        <option value="Juvenil">Juvenil</option>
                        <option value="Adulto">Adulto</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="add-level"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nivel
                      </label>
                      <select
                        id="add-level"
                        value={newUser.marinera.participant.level}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            marinera: {
                              ...newUser.marinera,
                              participant: {
                                ...newUser.marinera.participant,
                                level: e.target.value,
                              },
                            },
                          })
                        }
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Profile Image */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Imagen de Perfil</h3>
                  <div className="flex items-center gap-4">
                    {newUser.profileImage &&
                      typeof newUser.profileImage !== "string" && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300">
                          <img
                            src={URL.createObjectURL(newUser.profileImage)}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setNewUser({
                            ...newUser,
                            profileImage: e.target.files[0],
                          });
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={handleCloseDialog}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                onClick={async () => {
                  try {
                    // Set creation timestamp
                    const userWithTimestamp = {
                      ...newUser,
                      createdAt: Timestamp.now(),
                    };
                    await saveUser(userWithTimestamp);
                    handleCloseDialog();
                    // Reset the form
                    setNewUser(emptyUser);
                  } catch (error) {
                    console.error("Error adding student:", error);
                    // You might want to show an error message here
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
