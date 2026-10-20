"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignCourseStaff, revokeCourseStaff } from "@/modules/operations/actions";
import styles from "./academic-workflow.module.css";

type Assignment = { user_id: string; role: string; granted_at: string };

export function StaffManagement({
  staff, currentUserId,
}: { staff: Assignment[]; currentUserId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("instructor");
  const [pending, setPending] = useState(false);
  const [pendingRevocation, setPendingRevocation] = useState<string | null>(null);
  const [confirmRevocation, setConfirmRevocation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const keyFor = (item: Assignment) => `${item.user_id}:${item.role}`;
  return <section className={styles.panel} aria-labelledby="staff-management-heading">
    <span className="eyebrow">ADMINOS 0.3 · COURSE ACCESS GOVERNANCE</span>
    <h2 id="staff-management-heading">Academic staff permissions</h2>
    <p>Only verified accounts can receive instructional access. Course administrators can assign or revoke roles. Every change is recorded in the audit trail. Self-revocation and anonymous privilege changes are prohibited.</p>
    <form className={styles.form} onSubmit={async e=>{
      e.preventDefault();
      setPending(true); setMessage(""); setConfirmRevocation(null);
      try {
        const result=await assignCourseStaff({email,role});
        setMessage(result.error ?? "The verified staff role has been assigned and audited.");
        if (!result.error) {setEmail(""); router.refresh();}
      } catch { setMessage("Unable to complete the staff assignment."); }
      finally {setPending(false);}
    }}>
      <label>Verified KHANIVERSITY account email
        <input type="email" required maxLength={254} autoComplete="off"
          value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="instructor@example.org"/>
      </label>
      <label>Academic permission
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="instructor">Instructor · draft and assess</option>
          <option value="reviewer">Academic reviewer · independent approval</option>
          <option value="administrator">Administrator · govern course permissions</option>
        </select>
      </label>
      <button className="button gold" type="submit" disabled={pending || !!pendingRevocation}>
        {pending?"Assigning…":"Assign verified staff role"}
      </button>
    </form>
    <p role="status" aria-live="polite" className="save-error">{message}</p>
    <h3>Course staff register</h3>
    {staff.length ? <div className={styles.queue}>
      {staff.map(item=>{
        const key=keyFor(item);
        const isSelf=item.user_id===currentUserId;
        return <article key={key} className={styles.card}>
          <div className={styles.top}>
            <strong>{item.role}{isSelf?" (your account)":""}</strong>
            <small>Granted {new Date(item.granted_at).toLocaleDateString()}</small>
          </div>
          <small>Account: {item.user_id}</small>
          {!isSelf && (confirmRevocation === key
            ? <div className={styles.buttons}>
                <p>Remove <strong>{item.role}</strong> permission from this account? This takes effect for subsequent authorized operations and is audited.</p>
                <button type="button" className="button" disabled={pending || !!pendingRevocation}
                  onClick={async ()=>{
                    setPendingRevocation(key); setMessage("");
                    try {
                      const result=await revokeCourseStaff({userId:item.user_id,role:item.role});
                      setMessage(result.error ?? "Staff permission revoked and audited.");
                      if (!result.error) router.refresh();
                    } catch {setMessage("Unable to revoke this permission.");}
                    finally {setPendingRevocation(null);setConfirmRevocation(null);}
                  }}>
                  {pendingRevocation === key?"Revoking…":"Confirm role revocation"}
                </button>
                <button type="button" className="button outline" disabled={!!pendingRevocation}
                  onClick={()=>setConfirmRevocation(null)}>Cancel</button>
              </div>
            : <button type="button" className="button outline"
                disabled={pending || !!pendingRevocation}
                onClick={()=>{setConfirmRevocation(key);setMessage("");}}>
                Review role revocation
              </button>)}
        </article>;
      })}
    </div> : <p>No academic staff assignments are currently visible.</p>}
  </section>;
}
