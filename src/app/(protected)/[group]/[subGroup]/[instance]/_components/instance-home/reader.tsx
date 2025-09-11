import { SectionHeading } from "@/components/heading";
import { JoinInstance } from "@/components/join-instance";

export async function ReaderHome() {
  return (
    <>
      <SectionHeading>Reader Home</SectionHeading>
      {/* <ReaderInstanceHome params={params} /> */}
      <JoinInstance />
    </>
  );
}
