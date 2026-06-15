export default function Hero() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- HERO -->     <section id="home" class="hero">       <div class="hero-bg">         <div class="hero-overlay"></div>         <div class="hero-noise"></div>       </div>       <div class="hero-content">         <span class="hero-eyebrow">Coaching for the ambitious</span>         <h1 class="hero-headline">           Find the Right Coach<br /><em>for Your Growth</em>         </h1>         <p class="hero-sub">           We connect high-achievers with world-class coaches across career,           business, life, and leadership. Your transformation starts with one           conversation.         </p>         <div class="hero-actions">           <a href="#select-coach" class="btn btn-primary">Get Started</a>           <a href="#programs" class="btn btn-ghost">Explore Programs</a>         </div>         <div class="hero-stats">           <div class="stat">             <strong>2,400+</strong><span>Clients Coached</span>           </div>           <div class="stat-divider"></div>           <div class="stat">             <strong>98%</strong><span>Satisfaction Rate</span>           </div>           <div class="stat-divider"></div>           <div class="stat">             <strong>50+</strong><span>Expert Coaches</span>           </div>         </div>       </div>       <div class="hero-scroll-hint">         <span>Scroll</span>         <div class="scroll-line"></div>       </div>     </section>`,
      }}
    />
  );
}
