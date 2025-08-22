"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ListValues from '../../../components/attributesValuesComponents/ListValues';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
export default function DashboardProducts() {
    const queryClient = new QueryClient();

  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Manage Product Attribute Values</h1>
        <QueryClientProvider client={queryClient}>
           <ListValues/>
        </QueryClientProvider>
    </div>
  );
}
