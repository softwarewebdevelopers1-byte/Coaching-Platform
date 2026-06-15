export default function CoachModal() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- COACH PROFILE MODAL -->     <div       class="modal-overlay"       id="coachModal"       role="dialog"       aria-modal="true"       aria-labelledby="modalCoachName"     >       <div class="modal-box">         <button class="modal-close" id="modalClose" aria-label="Close">           ✕         </button>         <div class="modal-header">           <div class="modal-avatar" id="modalAvatar"></div>           <div>             <p class="modal-coach-name" id="modalCoachName"></p>             <p class="modal-coach-spec" id="modalCoachSpec"></p>           </div>         </div>         <div class="modal-stats" id="modalStats"></div>         <p class="modal-bio" id="modalBio"></p>         <div class="modal-tags" id="modalTags"></div>         <div class="modal-actions">           <button class="btn btn-primary" id="modalBookBtn">             Book a Session           </button>           <button class="btn btn-ghost" id="modalClose2">Close</button>         </div>       </div>     </div>`,
      }}
    />
  );
}
