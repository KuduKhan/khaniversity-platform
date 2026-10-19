"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Share2, Users } from "lucide-react";
import {
  joinCohort,
  postToCohort,
  reviewPeerProject,
  saveLearnerProfile,
  shareCapstone,
} from "@/modules/community/actions";

type Cohort = { id: string; title: string; course_id: string; join_code: string };
type Post = { id: number; body: string; post_type: string; user_id: string; created_at: string };
type Submission = { id: string; user_id: string; title: string; summary: string; source_code: string; created_at: string };
type PeerProfile = { user_id: string; display_name: string };
type Review = { submission_id: string; reviewer_id: string; clarity: number; correctness: number; testing: number; feedback: string; created_at: string };

export function CommunityStudio({
  userId,
  profile,
  cohorts,
  activeCohort,
  posts,
  submissions,
  peerProfiles,
  reviews,
  myReviewIds,
}: {
  userId: string;
  profile: { display_name: string; peer_visible: boolean } | null;
  cohorts: Cohort[];
  activeCohort: Cohort | null;
  posts: Post[];
  submissions: Submission[];
  peerProfiles: PeerProfile[];
  reviews: Review[];
  myReviewIds: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [profileName, setProfileName] = useState(profile?.display_name ?? "");
  const [peerVisible, setPeerVisible] = useState(profile?.peer_visible ?? false);
  const [invite, setInvite] = useState("");
  const [post, setPost] = useState("");
  const [projectSummary, setProjectSummary] = useState("");

  function run(action: (payload: unknown) => Promise<{ error?: string; ok?: boolean; cohortId?: string }>, payload: unknown) {
    startTransition(async () => {
      const result = await action(payload as never);
      setMessage(result.error ?? (result.cohortId ? "Cohort joined. Opening your workspace…" : "Saved. Refreshing your workspace…"));
      if (result.cohortId) router.push(`/community?cohort=${encodeURIComponent(result.cohortId)}`);
      else if (!result.error) router.refresh();
    });
  }
  const displayName = (id: string) => peerProfiles.find((item) => item.user_id === id)?.display_name ?? (id === userId ? profileName || "You" : "Learner");

  return (
    <div className="community-page">
      <header className="module-hero">
        <p className="eyebrow">PEER LEARNING · COURSE COHORTS</p>
        <h1>Learn in good company.</h1>
        <p className="lead">Join a course cohort to discuss ideas, share your project by choice and give structured peer feedback.</p>
        <div className="module-outcome"><Users size={17} /><span>Only members of the same enrolled-course cohort can read its discussions and shared projects.</span></div>
      </header>

      <section className="module-project">
        <p className="eyebrow">YOUR PEER PROFILE</p>
        <h2>Choose how your name appears.</h2>
        <form onSubmit={(e) => { e.preventDefault(); run(saveLearnerProfile, { name: profileName, peerVisible }); }}>
          <label>Display name<input value={profileName} onChange={(e) => setProfileName(e.target.value)} maxLength={60} required /></label>
          <label className="inline-check"><input type="checkbox" checked={peerVisible} onChange={(e) => setPeerVisible(e.target.checked)} /> Let other members of my cohorts see this display name</label>
          <button className="button outline" disabled={pending}>Save profile</button>
        </form>
      </section>

      {cohorts.length === 0 ? (
        <section className="module-project">
          <p className="eyebrow">JOIN A COHORT</p><h2>Bring your learning group together.</h2>
          <p>Use an invitation shared by an instructor or cohort member. You must be enrolled in the associated course.</p>
          <form onSubmit={(e) => { e.preventDefault(); run(joinCohort, invite); }}>
            <label>Invitation code<input value={invite} onChange={(e) => setInvite(e.target.value)} autoComplete="off" /></label>
            <button className="button gold" disabled={pending || !invite.trim()}>Join cohort <ArrowRight size={16} /></button>
          </form>
        </section>
      ) : activeCohort && (
        <>
          <div className="cohort-switcher">
            <span className="tag">{activeCohort.course_id.toUpperCase()} · COHORT</span>
            <h2>{activeCohort.title}</h2>
            <p>Invite code <code>{activeCohort.join_code}</code></p>
            {cohorts.length > 1 && <nav aria-label="Your cohorts">{cohorts.map((cohort) => <a className={cohort.id === activeCohort.id ? "selected" : ""} href={`/community?cohort=${cohort.id}`} key={cohort.id}>{cohort.title}</a>)}</nav>}
            <details className="join-another"><summary>Join another cohort</summary><form onSubmit={(e) => { e.preventDefault(); run(joinCohort, invite); }}><label>Invitation code<input value={invite} onChange={(e) => setInvite(e.target.value)} autoComplete="off" /></label><button className="button outline" disabled={pending || !invite.trim()}>Join</button></form></details>
          </div>
          <section className="module-project">
            <p className="eyebrow">DISCUSSION</p><h2>Share a useful question or insight.</h2>
            <form onSubmit={(e) => { e.preventDefault(); run(postToCohort, { cohortId: activeCohort.id, body: post }); setPost(""); }}>
              <label>Message<textarea value={post} onChange={(e) => setPost(e.target.value)} rows={4} maxLength={5000} required /></label>
              <button className="button gold" disabled={pending || !post.trim()}>Post to cohort <MessageCircle size={16} /></button>
            </form>
          </section>
          <section className="community-list"><h2>Recent discussion</h2>
            {posts.length ? posts.map((item) => <article className="community-post" key={item.id}><div><strong>{displayName(item.user_id)}</strong><small>{new Date(item.created_at).toLocaleString()} · {item.post_type === "project-update" ? "Project update" : "Discussion"}</small></div><p>{item.body}</p></article>) : <p className="empty-evidence">Start the discussion with a question or a small discovery from your learning.</p>}
          </section>
          <section className="module-project">
            <p className="eyebrow">PROJECT SHOWCASE</p><h2>Share your Personal Study Planner draft.</h2>
            <p>Sharing copies your saved project code into this cohort. You choose when to share; cohort members can read and review it.</p>
            <form onSubmit={(e) => { e.preventDefault(); run(shareCapstone, { cohortId: activeCohort.id, summary: projectSummary }); }}>
              <label>What should peers look at?<textarea value={projectSummary} onChange={(e) => setProjectSummary(e.target.value)} rows={3} minLength={20} maxLength={3000} required /></label>
              <button className="button outline" disabled={pending || projectSummary.trim().length < 20}>Share saved capstone <Share2 size={16} /></button>
            </form>
          </section>
          <section className="community-list"><h2>Peer projects</h2>
            {submissions.length ? submissions.map((submission) => {
              const existingReviews = reviews.filter((review) => review.submission_id === submission.id);
              const alreadyReviewed = myReviewIds.includes(submission.id);
              return <article className="peer-project" key={submission.id}>
                <span className="tag">PROJECT · {new Date(submission.created_at).toLocaleDateString()}</span>
                <h3>{submission.title}</h3><p className="peer-author">Shared by {displayName(submission.user_id)}</p><p>{submission.summary}</p>
                <details><summary>Review project code</summary><pre><code>{submission.source_code}</code></pre></details>
                <div className="peer-reviews"><strong>Peer feedback · {existingReviews.length}</strong>{existingReviews.map((review) => <p key={`${review.submission_id}-${review.reviewer_id}`}><b>{displayName(review.reviewer_id)} · {review.clarity + review.correctness + review.testing}/15</b><br />{review.feedback}</p>)}</div>
                {submission.user_id !== userId && !alreadyReviewed && <form className="peer-review-form" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); run(reviewPeerProject, { submissionId: submission.id, clarity: Number(data.get("clarity")), correctness: Number(data.get("correctness")), testing: Number(data.get("testing")), feedback: data.get("feedback") }); }}>
                  <p className="eyebrow">GIVE STRUCTURED FEEDBACK</p>
                  {(["clarity", "correctness", "testing"] as const).map((criterion) => <label key={criterion}>{criterion}<select name={criterion} defaultValue="3">{[1,2,3,4,5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>)}
                  <label>Specific, constructive feedback<textarea name="feedback" minLength={20} maxLength={2000} rows={3} required /></label>
                  <button className="button outline" disabled={pending}>Submit peer review</button>
                </form>}
                {submission.user_id === userId && <small>This is your shared project.</small>}
              </article>;
            }) : <p className="empty-evidence">No peer projects have been shared yet. A saved project stays private until its owner shares it here.</p>}
          </section>
        </>
      )}
      <p role="status" className="save-error">{message}</p>
      <p className="fine-print">Peer feedback is formative. It does not change course grades or issue credentials; formal capstone assessment remains with an authorized reviewer.</p>
    </div>
  );
}
