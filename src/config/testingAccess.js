// Keep this aligned with RESUAI_TESTING_ACCESS on the server. The default is
// intentionally open for the current private validation round.
export const TESTING_ACCESS_ENABLED =
  String(import.meta.env.VITE_RESUAI_TESTING_ACCESS ?? "true").toLowerCase() !== "false";
