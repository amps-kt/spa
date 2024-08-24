"use client";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Algorithm } from "@/lib/validations/algorithm";

import { ResultsTableRow } from "./results-table-row";

export function ResultsTable({
  selectedAlgName,
  customAlgs,
}: {
  selectedAlgName: string | undefined;
  customAlgs: Algorithm[];
}) {
  const [selectedAlg, setSelectedAlg] = useState(selectedAlgName);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Matching Type</TableHead>
          <TableHead className="text-center">Weight</TableHead>
          <TableHead className="text-center">Size</TableHead>
          <TableHead className="w-fit min-w-[8rem] text-center">
            Profile
          </TableHead>
          <TableHead className="w-32 text-center">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <ResultsTableRow
          algName={"generous"}
          algDisplayName={"Generous"}
          selectedAlgName={selectedAlg}
          setSelectedMatching={setSelectedAlg}
        />
        <ResultsTableRow
          algName={"greedy"}
          algDisplayName={"Greedy"}
          selectedAlgName={selectedAlg}
          setSelectedMatching={setSelectedAlg}
        />
        <ResultsTableRow
          algName={"greedy-generous"}
          algDisplayName={"Greedy-Generous"}
          selectedAlgName={selectedAlg}
          setSelectedMatching={setSelectedAlg}
        />
        <ResultsTableRow
          algName={"minimum-cost"}
          algDisplayName={"Minimum Cost"}
          selectedAlgName={selectedAlg}
          setSelectedMatching={setSelectedAlg}
        />
        {customAlgs.map(({ algName, displayName }, i) => (
          <ResultsTableRow
            algName={algName}
            algDisplayName={displayName}
            selectedAlgName={selectedAlg}
            setSelectedMatching={setSelectedAlg}
            key={i}
          />
        ))}
      </TableBody>
    </Table>
  );
}
