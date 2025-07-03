import React from "react";
import { Ticket } from "@/app/types/ticketType";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";

interface TicketsStatsProps {
  tickets: Ticket[];
}

const TicketsStats: React.FC<TicketsStatsProps> = ({ tickets }) => {
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Pendiente').length,
    paid: tickets.filter(t => t.status === 'Pagado').length,
    canceled: tickets.filter(t => t.status === 'Anulado').length,
    totalAmount: tickets.reduce((sum, t) => sum + t.totalAmount, 0),
  };

  const statCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Users,
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      valueColor: "text-gray-900",
    },
    {
      title: "Pendientes",
      value: stats.pending,
      icon: Clock,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      valueColor: "text-yellow-600",
    },
    {
      title: "Pagados",
      value: stats.paid,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "Anulados",
      value: stats.canceled,
      icon: XCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      valueColor: "text-red-600",
    },
    {
      title: "Total S/",
      value: stats.totalAmount.toFixed(2),
      icon: CreditCard,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      valueColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.valueColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-3 ${stat.bgColor} rounded-full`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketsStats;