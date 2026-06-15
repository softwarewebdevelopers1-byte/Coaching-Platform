export default function Coaches() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- COACHES -->     <section id="coaches" class="section coaches-section">       <div class="container">         <div class="section-header">           <span class="section-label">Meet the Team</span>           <h2 class="section-title">Our <em>Expert Coaches</em></h2>           <p class="section-sub">             Certified professionals with proven track records and deep             specialization.           </p>         </div>         <div class="coaches-grid" id="coachesGrid"></div>       </div>     </section>`,
      }}
    />
  );
}
