import { useEffect, useState } from "react";
import type { Opportunity } from "../domain/index.js";
import { App } from "./App.js";

type OpportunitiesApiResponse = {
  opportunities?: Opportunity[];
};

export function Root() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

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

  return <App opportunities={opportunities} />;
}
