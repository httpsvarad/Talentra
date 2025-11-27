// src/components/ui/card.jsx

import React from "react";
import { cn } from "@/lib/utils"; // if using clsx/tailwind helpers

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-2xl bg-white shadow-sm border", className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("px-6 pt-6 font-semibold text-lg", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
);
