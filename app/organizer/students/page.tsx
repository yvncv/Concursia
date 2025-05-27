/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { AcademiesDatatable, type ColumnDef } from "@/app/admin/academies/page";
import useUsers from "@/app/hooks/useUsers";
import { useEffect, useState } from "react";
import { Users } from "@/app/types/userType";
import { Eye, FilePenLine, Trash2 } from "lucide-react";

const StudentsPage = () => {
  const { users } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) => user.academyId !== "" && user.academyId)
    );
  }, [users]);

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
      render: (value: any, item: Users) => {
        return <p>{`${item.firstName} ${item.lastName}`}</p>;
      },
    },
    {
      key: "gender",
      title: "Sexo",
      render: (value: any, item: Users) => {
        return <p>{value.split(0, 1)}</p>;
      },
    },
    {
      key: "category",
      title: "Categoría",
      render: (value: any, item: Users) => {
        return <p>{item.marinera.participant.category}</p>;
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Users) => {
        return (
          <div className="flex justify-center space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="Visualizar"
              // onClick={() => handleSeeAcademy(item)}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
              title="Editar"
              // onClick={() => handleUpdateAcademy(item)}
            >
              <FilePenLine className="w-5 h-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Eliminar"
              // onClick={() => handleDeleteAcademy(item)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <AcademiesDatatable columns={columns} data={filteredUsers} />
    </div>
  );
};

export default StudentsPage;
