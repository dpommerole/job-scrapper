import type {
  ContractType,
  OpportunityClass,
  OpportunityStatus,
  RemotePolicy
} from "../../../domain/index.js";
import type { OpportunityFilters, OpportunityListState, OpportunitySortKey } from "../../view-models/opportunityFilters.js";
import { countActiveFilters, defaultOpportunityListState } from "../../view-models/opportunityFilters.js";

export type OpportunityListControlsProps = {
  state: OpportunityListState;
  sources: string[];
  resultCount: number;
  totalCount: number;
  onChange: (state: OpportunityListState) => void;
};

const statuses: OpportunityStatus[] = ["new", "interesting", "contacted", "replied", "interview", "offer", "rejected", "archived"];
const classes: OpportunityClass[] = ["hot", "interesting", "maybe", "weak", "reject"];
const remotePolicies: RemotePolicy[] = ["remote", "hybrid", "onsite", "unknown"];
const contractTypes: ContractType[] = ["freelance", "cdi", "cdd", "internship", "unknown"];

export function OpportunityListControls({
  state,
  sources,
  resultCount,
  totalCount,
  onChange
}: OpportunityListControlsProps) {
  const activeFilters = countActiveFilters(state.filters);

  return (
    <section className="opportunity-controls" aria-label="Opportunity filters and sorting">
      <div className="control-grid">
        <label>
          Search
          <input
            type="search"
            value={state.filters.search}
            onChange={(event) => updateFilters(state, onChange, { search: event.target.value })}
          />
        </label>
        <label>
          Status
          <select
            value={state.filters.status}
            onChange={(event) =>
              updateFilters(state, onChange, { status: event.target.value as OpportunityFilters["status"] })
            }
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Class
          <select
            value={state.filters.opportunityClass}
            onChange={(event) =>
              updateFilters(state, onChange, {
                opportunityClass: event.target.value as OpportunityFilters["opportunityClass"]
              })
            }
          >
            <option value="all">All classes</option>
            {classes.map((opportunityClass) => (
              <option value={opportunityClass} key={opportunityClass}>
                {opportunityClass}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <select value={state.filters.source} onChange={(event) => updateFilters(state, onChange, { source: event.target.value })}>
            <option value="all">All sources</option>
            {sources.map((source) => (
              <option value={source} key={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <label>
          Remote policy
          <select
            value={state.filters.remotePolicy}
            onChange={(event) =>
              updateFilters(state, onChange, { remotePolicy: event.target.value as OpportunityFilters["remotePolicy"] })
            }
          >
            <option value="all">All remote policies</option>
            {remotePolicies.map((remotePolicy) => (
              <option value={remotePolicy} key={remotePolicy}>
                {remotePolicy}
              </option>
            ))}
          </select>
        </label>
        <label>
          Contract
          <select
            value={state.filters.contractType}
            onChange={(event) =>
              updateFilters(state, onChange, { contractType: event.target.value as OpportunityFilters["contractType"] })
            }
          >
            <option value="all">All contracts</option>
            {contractTypes.map((contractType) => (
              <option value={contractType} key={contractType}>
                {contractType}
              </option>
            ))}
          </select>
        </label>
        <label>
          Minimum score
          <input
            type="number"
            min="0"
            max="100"
            value={state.filters.minimumScore ?? ""}
            onChange={(event) => updateFilters(state, onChange, { minimumScore: parseMinimumScore(event.target.value) })}
          />
        </label>
        <label>
          Sort by
          <select value={state.sort} onChange={(event) => onChange({ ...state, sort: event.target.value as OpportunitySortKey })}>
            <option value="collected-desc">Collected date desc</option>
            <option value="score-desc">Score desc</option>
            <option value="updated-desc">Updated date desc</option>
            <option value="follow-up-asc">Follow-up date asc</option>
          </select>
        </label>
      </div>
      <div className="filter-summary">
        <span>
          {resultCount} of {totalCount} opportunities · {activeFilters} active filters
        </span>
        <button type="button" onClick={() => onChange(defaultOpportunityListState)}>
          Reset
        </button>
      </div>
    </section>
  );
}

function updateFilters(
  state: OpportunityListState,
  onChange: (state: OpportunityListState) => void,
  filters: Partial<OpportunityFilters>
): void {
  onChange({
    ...state,
    filters: {
      ...state.filters,
      ...filters
    }
  });
}

function parseMinimumScore(value: string): number | undefined {
  if (value.trim() === "") return undefined;

  const score = Number(value);
  if (Number.isNaN(score)) return undefined;

  return Math.min(100, Math.max(0, score));
}
