import { requireStudent } from "@/lib/database/server";

export async function communityState(requestedCohortId?: string) {
  const { db, id, email } = await requireStudent();
  const [{ data: memberships }, { data: profile }] = await Promise.all([
    db.from("cohort_memberships").select("cohort_id").eq("user_id", id),
    db.from("profiles").select("display_name,peer_visible").eq("user_id", id).maybeSingle(),
  ]);
  const cohortIds = (memberships ?? []).map((membership) => membership.cohort_id);
  const { data: cohorts } = cohortIds.length
    ? await db.from("cohorts").select("id,title,course_id,join_code").in("id", cohortIds)
    : { data: [] };
  const activeCohort = cohorts?.find((cohort) => cohort.id === requestedCohortId) ?? cohorts?.[0] ?? null;
  const [{ data: posts }, { data: submissions }] = activeCohort
    ? await Promise.all([
        db.from("cohort_posts").select("id,body,post_type,user_id,created_at,parent_id").eq("cohort_id", activeCohort.id).order("created_at", { ascending: false }).limit(50),
        db.from("project_submissions").select("id,user_id,title,summary,source_code,created_at").eq("cohort_id", activeCohort.id).order("created_at", { ascending: false }).limit(30),
      ])
    : [{ data: [] }, { data: [] }];
  const userIds = [...new Set([...(posts ?? []).map((post) => post.user_id), ...(submissions ?? []).map((submission) => submission.user_id)])];
  const { data: peerProfiles } = userIds.length
    ? await db.from("profiles").select("user_id,display_name").in("user_id", userIds)
    : { data: [] };
  const submissionIds = (submissions ?? []).map((submission) => submission.id);
  const { data: reviews } = submissionIds.length
    ? await db.from("peer_reviews").select("submission_id,reviewer_id,clarity,correctness,testing,feedback,created_at").in("submission_id", submissionIds).order("created_at", { ascending: false })
    : { data: [] };
  const { data: myReviews } = submissionIds.length
    ? await db.from("peer_reviews").select("submission_id").eq("reviewer_id", id).in("submission_id", submissionIds)
    : { data: [] };
  return {
    id,
    email,
    profile: profile ?? null,
    cohorts: cohorts ?? [],
    activeCohort,
    posts: posts ?? [],
    submissions: submissions ?? [],
    peerProfiles: peerProfiles ?? [],
    reviews: reviews ?? [],
    myReviewIds: (myReviews ?? []).map((review) => review.submission_id),
  };
}
