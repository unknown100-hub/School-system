// financeMenu.jsx
import React from 'react';
import {
    FaChartPie,
    FaMoneyBillWave,
    FaFileInvoiceDollar,
    FaCreditCard,
    FaReceipt,
    FaChartLine,
    FaCog,
} from "react-icons/fa";

const financeMenu = [
    {
        title: "Dashboard",
        icon: FaChartPie,
        path: "/finances/dashboard",
    },
    {
        title: "Student Fees",
        icon: FaMoneyBillWave,
        children: [
            {
                title: "Fee Structure",
                path: "/finance/fees/structure",
            },
            {
                title: "Fee Collection",
                path: "/finance/fees/collection",
            },
            {
                title: "Outstanding Balances",
                path: "/finance/fees/outstanding",
            },
        ],
    },
    {
        title: "Invoices",
        icon: FaFileInvoiceDollar,
        path: "/finance/invoices",
    },
    {
        title: "Payments",
        icon: FaCreditCard,
        path: "/finance/payments",
    },
    {
        title: "Expenses",
        icon: FaReceipt,
        path: "/finance/expenses",
    },
    {
        title: "Reports",
        icon: FaChartLine,
        path: "/finance/reports",
    },
    {
        title: "Settings",
        icon: FaCog,
        path: "/finance/settings",
    },
];

export default financeMenu;