"use client";

import { useState } from "react";
import { assignCourseStaff } from "@/modules/operations/actions";
import styles from "./academic-workflow.module.css";

export function StaffManagement({ staff }: { staff: {user_id:string;role:string;granted_at:string}[] }) {
  const [email,setEmail] = useState("");
  const [role,setRole] = useState("instructor");
  const [pending,setPending] = useState(false);
  const [message,setMessage] = useState("");
  return <section className={styles.panel} aria-labelledby="staff-management-heading">
    <span className="eyebrow">ACADEMIC ADMINISTRATION · ACCESS CONTROL</span>
    <h2 id="staff-management-heading">Assign course staff</h2>
    <p>Only course administrators may appoint instructors, independent academic reviewers or additional administrators. The person must already have a verified KHANIVERSITY account. Every appointment is recorded in the audit trail. An administrator cannot assign their own role.</p>
    <form className={styles.form} onSubmit={async e=>{
      e.preventDefault();setPending(true);setMessage("");
      try { const r=await assignCourseStaff({email,role});setMessage(r.error??"Access granted and recorded in the audit trail.");if(!r.error)setEmail(""); }
      catch {setMessage("Unable to complete the assignment.");}
      finally {setPending(false);}
    }}>
      <label>Verified account email
        <input type="email" required maxLength={254} autoComplete="off" value={email} onChange={e=>setEmail(e.target.value)} placeholder="instructor@example.org" />
      </label>
      <label>Course permission
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="instructor">Instructor · draft and teach</option>
          <option value="reviewer">Academic reviewer · independent approval</option>
          <option value="administrator">Administrator · manage academic access</option>
        </select>
      </label>
      <button className="button gold" type="submit" disabled={pending}>{pending?"Saving…":"Assign staff role"}</button>
    </form>
    <p role="status" className="save-error">{message}</p>
    <h3>Currently assigned permissions</h3>
    {staff.length ? <div className={styles.queue}>
      {staff.map(s=><article key={s.user_id+s.role} className={styles.card}>
        <div className={styles.top}><strong>{s.role}</strong><small>{new Date(s.granted_at).toLocaleString()}</small></div>
        <small>Account ID: {s.user_id}</small>
      </article>)}
    </div> : <p>No staff assignments visible for CS101.</p>}
  </section>;
}
