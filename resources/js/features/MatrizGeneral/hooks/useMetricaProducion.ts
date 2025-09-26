// useProductionMetrics.ts
import { useMemo, useState } from "react";
import { computeProductionMetrics, ProductionInput, ProductionResult } from "../utils/helperProduccion";

export function useProductionMetrics(raw: ProductionInput): ProductionResult {
  // Store the computed results in state for later use
  const [cachedResults, setCachedResults] = useState<ProductionResult | null>(null);

  const results = useMemo(() => {
    const computed = computeProductionMetrics(raw);
    // Update cached results whenever computation occurs
    setCachedResults(computed);
    return computed;
  }, [JSON.stringify(raw)]);


  // Return either the newly computed results or cached results
  return {
    ...results,
    ...cachedResults,
    ...computeProductionMetrics(raw)
  };
}
