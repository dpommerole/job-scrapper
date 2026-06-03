import { useEffect, useState } from "react";
import type { CreateManualOpportunityInput, ReportDetail, ReportSummary } from "../application/index.js";
import type { Opportunity, OpportunityStatus, Outreach, OutreachChannel, OutreachStatus } from "../domain/index.js";
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

type OutreachApiResponse = {
  outreachItems?: Outreach[];
};

type OutreachCreateApiResponse = {
  outreach?: Outreach;
  error?: string;
};

type OutreachUpdateApiResponse = {
  outreach?: Outreach;
  error?: string;
};

type ReportsApiResponse = {
  reports?: ReportSummary[];
};

type ReportDetailApiResponse = {
  report?: ReportDetail;
  error?: string;
};

export function Root() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isSavingOpportunity, setIsSavingOpportunity] = useState(false);
  const [opportunitySaveError, setOpportunitySaveError] = useState<string | undefined>();
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [opportunityCreateError, setOpportunityCreateError] = useState<string | undefined>();
  const [outreachItems, setOutreachItems] = useState<Outreach[]>([]);
  const [isCreatingOutreach, setIsCreatingOutreach] = useState(false);
  const [isSavingOutreach, setIsSavingOutreach] = useState(false);
  const [outreachSaveError, setOutreachSaveError] = useState<string | undefined>();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | undefined>();
  const [reportLoadError, setReportLoadError] = useState<string | undefined>();

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

  useEffect(() => {
    if (window.location.pathname !== "/reports") return;

    let isMounted = true;

    fetch("/api/reports")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText))))
      .then((payload: ReportsApiResponse) => {
        if (isMounted && Array.isArray(payload.reports)) {
          setReports(payload.reports);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setReports([]);
          setReportLoadError(error instanceof Error ? error.message : "Failed to load reports");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname !== "/outreach") return;

    let isMounted = true;

    fetch("/api/outreach")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText))))
      .then((payload: OutreachApiResponse) => {
        if (isMounted && Array.isArray(payload.outreachItems)) {
          setOutreachItems(payload.outreachItems);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOutreachItems([]);
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

  function createOutreachDraft(input: {
    opportunityId: string;
    channel: OutreachChannel;
    followUpAt?: string;
    subject?: string;
    message?: string;
  }) {
    setIsCreatingOutreach(true);
    setOutreachSaveError(undefined);

    fetch("/api/outreach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    })
      .then(async (response) => {
        const payload = (await response.json()) as OutreachCreateApiResponse;
        if (!response.ok || !payload.outreach) {
          throw new Error(payload.error ?? response.statusText);
        }

        return payload.outreach;
      })
      .then((createdOutreach) => {
        setOutreachItems((current) => [createdOutreach, ...current]);
      })
      .catch((error: unknown) => {
        setOutreachSaveError(error instanceof Error ? error.message : "Failed to create outreach draft");
      })
      .finally(() => {
        setIsCreatingOutreach(false);
      });
  }

  function updateOutreachItem(id: string, update: { status?: OutreachStatus; followUpAt?: string; notes?: string }) {
    setIsSavingOutreach(true);
    setOutreachSaveError(undefined);

    fetch(`/api/outreach/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(update)
    })
      .then(async (response) => {
        const payload = (await response.json()) as OutreachUpdateApiResponse;
        if (!response.ok || !payload.outreach) {
          throw new Error(payload.error ?? response.statusText);
        }

        return payload.outreach;
      })
      .then((updatedOutreach) => {
        setOutreachItems((current) =>
          current.map((outreach) => (outreach.id === updatedOutreach.id ? updatedOutreach : outreach))
        );
      })
      .catch((error: unknown) => {
        setOutreachSaveError(error instanceof Error ? error.message : "Failed to save outreach");
      })
      .finally(() => {
        setIsSavingOutreach(false);
      });
  }

  function openReport(id: string) {
    setReportLoadError(undefined);

    fetch(`/api/reports/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const payload = (await response.json()) as ReportDetailApiResponse;
        if (!response.ok || !payload.report) {
          throw new Error(payload.error ?? response.statusText);
        }

        return payload.report;
      })
      .then((report) => {
        setSelectedReport(report);
      })
      .catch((error: unknown) => {
        setReportLoadError(error instanceof Error ? error.message : "Failed to open report");
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
      outreachItems={outreachItems}
      isCreatingOutreach={isCreatingOutreach}
      isSavingOutreach={isSavingOutreach}
      outreachSaveError={outreachSaveError}
      onCreateOutreachDraft={createOutreachDraft}
      onUpdateOutreach={updateOutreachItem}
      reports={reports}
      selectedReport={selectedReport}
      reportLoadError={reportLoadError}
      onOpenReport={openReport}
    />
  );
}
