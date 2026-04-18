export * from "./types";
export * from "./adapter";
export * from "./export";
import { registerAdapter } from "./adapter";
import { cinemaStudioAdapter } from "./higgsfield-cinema-studio";
import { marketingStudioAdapter } from "./higgsfield-marketing-studio";

// Auto-register built-in adapters
registerAdapter(cinemaStudioAdapter);
registerAdapter(marketingStudioAdapter);

export { cinemaStudioAdapter, marketingStudioAdapter };
