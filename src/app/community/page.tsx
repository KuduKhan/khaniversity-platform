import { StudentShell } from "@/components/student-shell";
import { CommunityStudio } from "@/components/community-studio";
import { communityState } from "@/modules/community/state";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const { cohort } = await searchParams;
  const state = await communityState(cohort);
  return (
    <StudentShell preview={false} active="community" email={state.email}>
      <CommunityStudio
        userId={state.id}
        profile={state.profile}
        cohorts={state.cohorts}
        activeCohort={state.activeCohort}
        posts={state.posts}
        submissions={state.submissions}
        peerProfiles={state.peerProfiles}
        reviews={state.reviews}
        myReviewIds={state.myReviewIds}
      />
    </StudentShell>
  );
}
