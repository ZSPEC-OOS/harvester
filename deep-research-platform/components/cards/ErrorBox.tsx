"use client";
import { AlertTriangle } from "lucide-react";

export function ErrorBox({ message }:{message:string}){return <div className="flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-900/20 px-3 py-2 text-rose-200"><AlertTriangle size={16} className="mt-0.5"/><p className="text-sm">{message}</p></div>;}
