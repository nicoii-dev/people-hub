"use client";

import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { RECRUITMENT_STAGE_OPTIONS } from "@/config/constants";
import type { JobOpening, RecruitmentStage } from "@/types/recruitment";

interface RecruitmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  jobs?: JobOpening[];
  jobId?: string;
  onJobChange?: (value: string) => void;
  stage?: RecruitmentStage | "";
  onStageChange?: (value: RecruitmentStage | "") => void;
}

export function RecruitmentFilters({
  search,
  onSearchChange,
  jobs,
  jobId,
  onJobChange,
  stage,
  onStageChange,
}: RecruitmentFiltersProps) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-3">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search…" className="w-full" />
      {onJobChange ? (
        <FilterDropdown
          value={jobId ?? ""}
          onValueChange={onJobChange}
          options={(jobs ?? []).map((job) => ({ value: job.id, label: job.title }))}
          placeholder="Filter by job"
          emptyLabel="All jobs"
          className="w-full"
        />
      ) : null}
      {onStageChange ? (
        <FilterDropdown
          value={stage ?? ""}
          onValueChange={(value) => onStageChange(value as RecruitmentStage | "")}
          options={RECRUITMENT_STAGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          placeholder="Filter by stage"
          emptyLabel="All stages"
          className="w-full"
        />
      ) : null}
    </div>
  );
}
