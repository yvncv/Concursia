"use client";
import React from "react";
import useUsers from "@/app/hooks/useUsers";
import useAcademies from "@/app/hooks/useAcademies";
import useEvents from "@/app/hooks/useEvents";
import { Bar, Pie, Line, Radar, Doughnut, PolarArea, Bubble } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler, RadialLinearScale } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  RadialLinearScale // Registrar la escala radial
);

const Dashboard: React.FC = () => {
  const { users, loadingUsers } = useUsers();
  const { academies, loadingAcademies, errorAcademies } = useAcademies();
  const { events, loadingEvents } = useEvents();

  const eventosActivos = events.filter((evento) => evento.status === "en curso");
  const totalEventos = events.length;

  const userData = {
    labels: ["Usuarios", "Academias", "Eventos Activos", "Total de Eventos"],
    datasets: [
      {
        label: "Datos",
        data: [users.length, academies.length, eventosActivos.length, totalEventos],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const pieData = {
    labels: ["Usuarios", "Academias", "Eventos Activos", "Total de Eventos"],
    datasets: [
      {
        data: [users.length, academies.length, eventosActivos.length, totalEventos],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const lineData = {
    labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    datasets: [
      {
        label: "Eventos Activos",
        data: [5, 7, 10, 8],
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  const radarData = {
    labels: ["Usuarios", "Academias", "Eventos Activos", "Total de Eventos"],
    datasets: [
      {
        label: "Datos",
        data: [users.length, academies.length, eventosActivos.length, totalEventos],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "#FF6384",
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ["Usuarios", "Academias", "Eventos Activos", "Total de Eventos"],
    datasets: [
      {
        data: [users.length, academies.length, eventosActivos.length, totalEventos],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const polarAreaData = {
    labels: ["Usuarios", "Academias", "Eventos Activos", "Total de Eventos"],
    datasets: [
      {
        data: [users.length, academies.length, eventosActivos.length, totalEventos],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const bubbleData = {
    datasets: [
      {
        label: "Usuarios vs Eventos Activos",
        data: [
          { x: users.length, y: eventosActivos.length, r: 10 },
          { x: academies.length, y: totalEventos, r: 15 },
        ],
        backgroundColor: "#FF6384",
      },
    ],
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <section id="info-cards" className="">
        <div className="flex flex-row">
          {/* Tarjeta de Usuarios */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Usuarios</h2>
            {loadingUsers ? (
              <p>Cargando...</p>
            ) : (
              <p className="text-2xl font-bold">{users.length}</p>
            )}
          </div>

          {/* Tarjeta de Academias */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Academias</h2>
            {loadingAcademies ? (
              <p>Cargando...</p>
            ) : errorAcademies ? (
              <p className="text-red-500">Error: {errorAcademies}</p>
            ) : (
              <p className="text-2xl font-bold">{academies.length}</p>
            )}
          </div>

          {/* Tarjeta de Eventos Activos */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Eventos Activos</h2>
            {loadingEvents ? (
              <p>Cargando...</p>
            ) : (
              <p className="text-2xl font-bold">{eventosActivos.length}</p>
            )}
          </div>

          {/* Tarjeta Total de Eventos */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Total de Eventos</h2>
            <p className="text-2xl font-bold">{totalEventos}</p>
          </div>
        </div>

      </section>

      {/* Gráficos */}
      <div className="mt-8 ">
        {/* Gráfico de Barras */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Datos por Categoría (Barras)</h3>
          <Bar data={userData} />
        </div>

        {/* Gráfico de Pastel */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Datos por Categoría (Pastel)</h3>
          <Pie data={pieData} />
        </div>

        {/* Gráfico de Líneas */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Eventos Activos (Líneas)</h3>
          <Line data={lineData} />
        </div>

        {/* Gráfico Radar */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Datos por Categoría (Radar)</h3>
          <Radar data={radarData} />
        </div>

        {/* Gráfico Doughnut */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Datos por Categoría (Doughnut)</h3>
          <Doughnut data={doughnutData} />
        </div>

        {/* Gráfico de Polar Area */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Datos por Categoría (Polar Area)</h3>
          <PolarArea data={polarAreaData} />
        </div>

        {/* Gráfico de Burbuja */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Usuarios vs Eventos Activos (Burbuja)</h3>
          <Bubble data={bubbleData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
