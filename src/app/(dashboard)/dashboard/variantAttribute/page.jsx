"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ListAttributes from '../../../components/attributesComponents/ListAttributes';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
export default function DashboardProducts() {
    const queryClient = new QueryClient();

  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Manage Product Variant Attributes</h1>
        <QueryClientProvider client={queryClient}>
            <ListAttributes/>
        </QueryClientProvider>
    </div>
  );
}
