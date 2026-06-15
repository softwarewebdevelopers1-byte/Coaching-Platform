export default function Testimonials() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- TESTIMONIALS -->     <section id="testimonials" class="section testimonials-section">       <div class="container">         <div class="section-header">           <span class="section-label">Client Stories</span>           <h2 class="section-title">What Our <em>Clients Say</em></h2>         </div>         <div class="testimonials-slider" id="testimonialsSlider">           <div class="testimonials-track" id="testimonialsTrack"></div>           <div class="slider-controls">             <button class="slider-btn" id="prevBtn" aria-label="Previous">               &#8592;             </button>             <div class="slider-dots" id="sliderDots"></div>             <button class="slider-btn" id="nextBtn" aria-label="Next">               &#8594;             </button>           </div>         </div>       </div>     </section>`,
      }}
    />
  );
}
