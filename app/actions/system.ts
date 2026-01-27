"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkSystemHealth() {
  const supabase = await createClient();
  const start = Date.now();

  try {
    // Jalankan query ringan
    const { count, error } = await supabase
      .from("academic_years")
      .select("*", { count: "exact", head: true });

    const latency = Date.now() - start;

    if (error) {
      return {
        status: "error",
        latency: latency,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: "healthy",
      latency: latency,
      message: "Connected",
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    return {
      status: "error",
      latency: Date.now() - start,
      message: err.message || "Unknown error",
      timestamp: new Date().toISOString()
    };
  }
}
