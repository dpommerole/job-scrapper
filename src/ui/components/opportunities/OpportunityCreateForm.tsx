import { useState } from "react";
import type { ContractType, RemotePolicy } from "../../../domain/index.js";
import type { CreateManualOpportunityInput } from "../../../application/index.js";

export type OpportunityCreateFormProps = {
  isCreating?: boolean;
  createError?: string | undefined;
  onCreate: (input: CreateManualOpportunityInput) => void;
};

const remotePolicies: RemotePolicy[] = ["unknown", "remote", "hybrid", "onsite"];
const contractTypes: ContractType[] = ["unknown", "freelance", "cdi", "cdd", "internship"];

export function OpportunityCreateForm({ isCreating = false, createError, onCreate }: OpportunityCreateFormProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  return (
    <form
      className="opportunity-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const input = formDataToOpportunityInput(formData);
        const errors = validateInput(input);

        setValidationErrors(errors);
        if (errors.length > 0) return;

        onCreate(input);
      }}
    >
      <div className="form-grid">
        <Field name="source" label="Source" />
        <Field name="sourceUrl" label="Source URL" />
        <Field name="title" label="Title" />
        <Field name="company" label="Company" />
        <Field name="recruiterName" label="Recruiter name" />
        <Field name="recruiterCompany" label="Recruiter company" />
        <Field name="location" label="Location" />
        <Select name="remotePolicy" label="Remote policy" options={remotePolicies} />
        <Select name="contractType" label="Contract type" options={contractTypes} />
        <Field name="seniority" label="Seniority" />
        <Field name="duration" label="Duration" />
        <Field name="startDate" label="Start date" />
        <Field name="rateMin" label="Rate min" type="number" />
        <Field name="rateMax" label="Rate max" type="number" />
      </div>

      <label>
        Required skills
        <textarea name="requiredSkills" rows={3} placeholder="Vue.js; TypeScript; Vitest" />
      </label>
      <label>
        Nice-to-have skills
        <textarea name="niceToHaveSkills" rows={3} placeholder="Design system; Accessibility" />
      </label>
      <label>
        Description
        <textarea name="description" rows={7} />
      </label>
      <label>
        Notes
        <textarea name="notes" rows={4} />
      </label>

      {validationErrors.length > 0 ? (
        <div className="form-error-list" role="alert">
          {validationErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      {createError ? <p className="form-error">{createError}</p> : null}

      <button type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create opportunity"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label>
      {label}
      <input name={name} type={type} />
    </label>
  );
}

function Select<T extends string>({ name, label, options }: { name: string; label: string; options: T[] }) {
  return (
    <label>
      {label}
      <select name={name}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formDataToOpportunityInput(formData: FormData): CreateManualOpportunityInput {
  return {
    source: getString(formData, "source"),
    sourceUrl: getString(formData, "sourceUrl"),
    title: getString(formData, "title"),
    company: getString(formData, "company"),
    recruiterName: getString(formData, "recruiterName"),
    recruiterCompany: getString(formData, "recruiterCompany"),
    location: getString(formData, "location"),
    remotePolicy: getString(formData, "remotePolicy") as RemotePolicy,
    contractType: getString(formData, "contractType") as ContractType,
    seniority: getString(formData, "seniority"),
    duration: getString(formData, "duration"),
    startDate: getString(formData, "startDate"),
    rateMin: getString(formData, "rateMin"),
    rateMax: getString(formData, "rateMax"),
    requiredSkills: getString(formData, "requiredSkills"),
    niceToHaveSkills: getString(formData, "niceToHaveSkills"),
    description: getString(formData, "description"),
    notes: getString(formData, "notes")
  };
}

function validateInput(input: CreateManualOpportunityInput): string[] {
  const errors: string[] = [];

  if (!input.source?.trim()) errors.push("Missing required field: source");
  if (!input.title?.trim()) errors.push("Missing required field: title");
  if (!input.description?.trim()) errors.push("Missing required field: description");

  return errors;
}

function getString(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}
