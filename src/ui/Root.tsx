import { useEffect, useState } from "react";
import type { CreateManualOpportunityInput } from "../application/index.js";
import type { Opportunity, OpportunityStatus } from "../domain/index.js";
import { App } from "./App.js";

type OpportunitiesApiResponse = {
  opportunities?: Opportunity[];
};

type OpportunityUpdateApiResponse = {
  opportunity?: Opportunity;
  error?: string;
};

type OpportunityCreateApiResponse = {
  opportunity?: Opportunity;
  errors?: string[];
};

export function Root() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isSavingOpportunity, setIsSavingOpportunity] = useState(false);
  const [opportunitySaveError, setOpportunitySaveError] = useState<string | undefined>();
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [opportunityCreateError, setOpportunityCreateError] = useState<string | undefined>();

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

  function createOpportunity(input: CreateManualOpportunityInput) {
    setIsCreatingOpportunity(true);
    setOpportunityCreateError(undefined);

    fetch("/api/opportunities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    })
      .then(async (response) => {
        const payload = (await response.json()) as OpportunityCreateApiResponse;
        if (!response.ok || !payload.opportunity) {
          throw new Error(payload.errors?.join("; ") ?? response.statusText);
        }

        return payload.opportunity;
      })
      .then((createdOpportunity) => {
        setOpportunities((current) => [createdOpportunity, ...current]);
        window.history.pushState({}, "", `/opportunities/${encodeURIComponent(createdOpportunity.id)}`);
      })
      .catch((error: unknown) => {
        setOpportunityCreateError(error instanceof Error ? error.message : "Failed to create opportunity");
      })
      .finally(() => {
        setIsCreatingOpportunity(false);
      });
  }

  return (
    <App
      opportunities={opportunities}
      isSavingOpportunity={isSavingOpportunity}
      opportunitySaveError={opportunitySaveError}
      onUpdateOpportunity={updateOpportunity}
      isCreatingOpportunity={isCreatingOpportunity}
      opportunityCreateError={opportunityCreateError}
      onCreateOpportunity={createOpportunity}
    />
  );
}
