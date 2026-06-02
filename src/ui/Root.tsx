import { useEffect, useState } from "react";
import type { Opportunity, OpportunityStatus } from "../domain/index.js";
import { App } from "./App.js";

type OpportunitiesApiResponse = {
  opportunities?: Opportunity[];
};

type OpportunityUpdateApiResponse = {
  opportunity?: Opportunity;
  error?: string;
};

export function Root() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isSavingOpportunity, setIsSavingOpportunity] = useState(false);
  const [opportunitySaveError, setOpportunitySaveError] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    fetch("/api/opportunities")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText))))
      .then((payload: OpportunitiesApiResponse) => {
        if (isMounted && Array.isArray(payload.opportunities)) {
          setOpportunities(payload.opportunities);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOpportunities([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateOpportunity(id: string, update: { status: OpportunityStatus; notes: string }) {
    setIsSavingOpportunity(true);
    setOpportunitySaveError(undefined);

    fetch(`/api/opportunities/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(update)
    })
      .then(async (response) => {
        const payload = (await response.json()) as OpportunityUpdateApiResponse;
        if (!response.ok || !payload.opportunity) {
          throw new Error(payload.error ?? response.statusText);
        }

        return payload.opportunity;
      })
      .then((updatedOpportunity) => {
        setOpportunities((current) =>
          current.map((opportunity) => (opportunity.id === updatedOpportunity.id ? updatedOpportunity : opportunity))
        );
      })
      .catch((error: unknown) => {
        setOpportunitySaveError(error instanceof Error ? error.message : "Failed to save opportunity");
      })
      .finally(() => {
        setIsSavingOpportunity(false);
      });
  }

  return (
    <App
      opportunities={opportunities}
      isSavingOpportunity={isSavingOpportunity}
      opportunitySaveError={opportunitySaveError}
      onUpdateOpportunity={updateOpportunity}
    />
  );
}
